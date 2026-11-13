// Supabase Edge Function: create a Razorpay order for a Learning Lab course.
//
// POST /functions/v1/create-order   body: { "product": "python" | … | "all" }
// Header: Authorization: Bearer <the signed-in learner's access token>
// → 200 { order_id, amount, currency, key_id, product, title }
//
// The price comes from the products table, never from the browser. A 'created' purchase row is stored so
// verify-payment and the webhook can match the payment to the learner.
// Secrets (Supabase → Edge Functions → Secrets): RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.

const ALLOWED_ORIGINS = ['https://shivam-soni.com', 'https://www.shivam-soni.com', 'https://localhost', 'http://localhost:5173', 'http://localhost:4173'];
const MIN_AMOUNT = 100; // paise; Razorpay's minimum

type Env = Record<string, string | undefined>;

const corsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
};
const json = (req: Request, status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } });

/** The signed-in user for this request, checked with Supabase Auth, or null. */
async function getUser(req: Request, env: Env, serviceKey: string, f: typeof fetch) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const r = await f(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: serviceKey, Authorization: auth } });
  if (!r.ok) return null;
  const user = await r.json();
  return user?.id ? user : null;
}

/** Call the database's REST API with the service key (bypasses row-level security; server only). */
const db = (env: Env, serviceKey: string, f: typeof fetch) => (path: string, init: RequestInit = {}) =>
  f(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });

export async function handler(req: Request, env: Env, f: typeof fetch = fetch): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, 405, { error: 'Use POST.' });

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!env.SUPABASE_URL || !serviceKey || !env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET)
    return json(req, 500, { error: 'Payments are not configured yet (missing server secrets).' });

  const user = await getUser(req, env, serviceKey, f);
  if (!user) return json(req, 401, { error: 'Please sign in again to buy a course.' });

  let product = '';
  try {
    product = String((await req.json())?.product || '');
  } catch {
    return json(req, 400, { error: 'Send JSON like { "product": "python" }.' });
  }
  if (!/^[a-z0-9-]{1,30}$/.test(product)) return json(req, 400, { error: 'Unknown course.' });

  const q = db(env, serviceKey, f);
  const prodRes = await q(`products?id=eq.${product}&active=eq.true&select=id,title,price_paise`);
  const [item] = prodRes.ok ? await prodRes.json() : [];
  if (!item) return json(req, 400, { error: 'This course is not for sale.' });
  const amount = Number(item.price_paise);
  if (!Number.isInteger(amount) || amount < MIN_AMOUNT) return json(req, 500, { error: 'This course has an invalid price.' });

  // Do not sell something the learner already owns.
  const ownRes = await q(`purchases?user_id=eq.${user.id}&status=eq.paid&product_id=in.(${product},all)&select=product_id`);
  if (ownRes.ok && (await ownRes.json()).length) return json(req, 409, { error: 'You already own this course.' });

  const order = await f('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt: `lab_${product}_${Date.now().toString(36)}`.slice(0, 40),
      notes: { user_id: user.id, product, email: user.email || '' },
    }),
  });
  if (order.status === 401) return json(req, 500, { error: 'The payment provider rejected our credentials. Please try again later.' });
  if (!order.ok) return json(req, 500, { error: 'Could not start the payment. Please try again.' });
  const o = await order.json();

  const ins = await q('purchases', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ user_id: user.id, product_id: product, amount_paise: amount, status: 'created', razorpay_order_id: o.id }),
  });
  if (!ins.ok) return json(req, 500, { error: 'Could not record the order. Please try again.' });

  return json(req, 200, { order_id: o.id, amount: o.amount, currency: o.currency, key_id: env.RAZORPAY_KEY_ID, product, title: item.title });
}

// On Supabase (Deno): serve the function. (Node tests import `handler` directly.)
// @ts-ignore Deno is only defined on Supabase
if (typeof Deno !== 'undefined') Deno.serve((req: Request) => handler(req, Deno.env.toObject()));
