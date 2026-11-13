// Supabase Edge Function: the Learning Lab admin page's server. Only users listed in public.admins can use it.
//
// POST /functions/v1/admin   Header: Authorization: Bearer <signed-in admin's access token>
//   { "action": "overview" }                              → { users, purchases, progress }
//   { "action": "refund", "purchase_id": "…" }            → refunds the full amount through Razorpay, marks it refunded
//   { "action": "grant", "email": "…", "product": "…" }   → gives a course for free (recorded as a ₹0 purchase)
//   { "action": "revoke", "purchase_id": "…" }            → removes access from a free grant
// Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (for refunds). SUPABASE_URL and the service key are provided by Supabase.
// Turn OFF "Verify JWT" for this function, like the others: it checks the admin itself.

const ALLOWED_ORIGINS = ['https://shivam-soni.com', 'https://www.shivam-soni.com', 'https://localhost', 'http://localhost:5173', 'http://localhost:4173'];

type Env = Record<string, string | undefined>;

function serviceKeyFrom(env: Env) {
  if (env.SUPABASE_SERVICE_ROLE_KEY) return env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    const keys = JSON.parse(env.SUPABASE_SECRET_KEYS || '{}');
    return keys.default || Object.values(keys)[0] || '';
  } catch {
    return '';
  }
}
const serverHeaders = (key: string) => (key.startsWith('sb_secret_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` });
const cleanSecret = (v?: string) => (v || '').trim().replace(/^['"]|['"]$/g, '').trim();

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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function handler(req: Request, rawEnv: Env, f: typeof fetch = fetch): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, 405, { error: 'Use POST.' });
  const env: Env = { ...rawEnv, RAZORPAY_KEY_ID: cleanSecret(rawEnv.RAZORPAY_KEY_ID), RAZORPAY_KEY_SECRET: cleanSecret(rawEnv.RAZORPAY_KEY_SECRET) };
  const key = serviceKeyFrom(env);
  if (!env.SUPABASE_URL || !key) return json(req, 500, { error: 'Not configured (missing SUPABASE_URL or service key).' });
  const base = env.SUPABASE_URL;
  const H = { ...serverHeaders(key), 'Content-Type': 'application/json' };
  const rest = (path: string, init: RequestInit = {}) => f(`${base}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });

  // Who is calling, and are they an admin?
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return json(req, 401, { error: 'Please sign in.' });
  const me = await f(`${base}/auth/v1/user`, { headers: { apikey: serverHeaders(key).apikey, Authorization: auth } });
  const user = me.ok ? await me.json() : null;
  if (!user?.id) return json(req, 401, { error: 'Please sign in again.' });
  const adminRes = await rest(`admins?user_id=eq.${user.id}&select=user_id`);
  if (!adminRes.ok || !(await adminRes.json()).length) return json(req, 403, { error: 'This page is for the site owner only.' });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json(req, 400, { error: 'Send JSON.' });
  }
  const action = String(body.action || '');

  const listUsers = async () => {
    const r = await f(`${base}/auth/v1/admin/users?page=1&per_page=1000`, { headers: H });
    if (!r.ok) throw new Error(`Could not list accounts (${r.status}).`);
    const data = await r.json();
    return (data.users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || '',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      confirmed: !!u.email_confirmed_at,
    }));
  };

  try {
    if (action === 'overview') {
      const [users, purchases, progress] = await Promise.all([
        listUsers(),
        rest('purchases?select=id,user_id,product_id,amount_paise,status,razorpay_order_id,razorpay_payment_id,created_at,paid_at&order=created_at.desc').then((r) => r.json()),
        rest('progress?select=user_id,data,updated_at').then((r) => r.json()),
      ]);
      // Only what the page needs from progress: completed lesson keys per user.
      const done = Object.fromEntries(
        (progress || []).map((p: any) => [p.user_id, Object.keys(p.data?.lessons?.done || {}).filter((k) => p.data.lessons.done[k])])
      );
      return json(req, 200, { users, purchases, done });
    }

    if (action === 'refund' || action === 'revoke') {
      const id = String(body.purchase_id || '');
      if (!UUID.test(id)) return json(req, 400, { error: 'Unknown purchase.' });
      const [p] = await rest(`purchases?id=eq.${id}&select=id,status,amount_paise,razorpay_payment_id,product_id`).then((r) => r.json());
      if (!p) return json(req, 404, { error: 'Purchase not found.' });
      if (p.status !== 'paid') return json(req, 400, { error: `This purchase is ${p.status}, so there is nothing to ${action}.` });
      let refundId = null;
      if (action === 'refund') {
        if (!p.razorpay_payment_id) return json(req, 400, { error: 'This was a free grant; use Remove access instead.' });
        if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return json(req, 500, { error: 'Razorpay keys are not set.' });
        const r = await f(`https://api.razorpay.com/v1/payments/${encodeURIComponent(p.razorpay_payment_id)}/refund`, {
          method: 'POST',
          headers: { Authorization: `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: p.amount_paise, speed: 'normal', notes: { purchase_id: p.id, product: p.product_id } }),
        });
        const out = await r.json().catch(() => ({}));
        if (!r.ok) return json(req, 502, { error: `Razorpay could not refund: ${out?.error?.description || r.status}` });
        refundId = out.id;
      } else if (p.razorpay_payment_id) {
        return json(req, 400, { error: 'This was a paid purchase; use Refund instead.' });
      }
      const upd = await rest(`purchases?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'refunded' }) });
      if (!upd.ok) return json(req, 500, { error: 'Refunded at Razorpay, but the purchase could not be updated. Update it in the Table Editor.' });
      return json(req, 200, { ok: true, refund_id: refundId });
    }

    if (action === 'grant') {
      const email = String(body.email || '').trim().toLowerCase();
      const product = String(body.product || '');
      if (!email || !/^[a-z0-9-]{1,30}$/.test(product)) return json(req, 400, { error: 'Give an email and a course.' });
      const [prod] = await rest(`products?id=eq.${product}&select=id`).then((r) => r.json());
      if (!prod) return json(req, 400, { error: 'Unknown course.' });
      const target = (await listUsers()).find((u: any) => (u.email || '').toLowerCase() === email);
      if (!target) return json(req, 404, { error: 'No account with that email. Ask them to sign up first.' });
      const ins = await rest('purchases', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ user_id: target.id, product_id: product, amount_paise: 0, status: 'paid', paid_at: new Date().toISOString() }),
      });
      if (!ins.ok) return json(req, 500, { error: 'Could not record the grant.' });
      return json(req, 200, { ok: true });
    }

    return json(req, 400, { error: 'Unknown action.' });
  } catch (e) {
    return json(req, 500, { error: String((e as Error)?.message || e) });
  }
}

// @ts-ignore Deno is only defined on Supabase
if (typeof Deno !== 'undefined') Deno.serve((req: Request) => handler(req, Deno.env.toObject()));
