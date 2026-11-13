// Supabase Edge Function: verify a Razorpay payment and unlock the course.
//
// POST /functions/v1/verify-payment
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }   (what Razorpay Checkout returns)
// Header: Authorization: Bearer <the signed-in learner's access token>
// → 200 { ok: true, product } only when the signature is valid and the payment really succeeded.
//
// 1. Signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET) must equal razorpay_signature (else 400).
// 2. The order must belong to this learner, and Razorpay must report the payment for this order and amount.
//    An authorized-but-not-captured payment is captured here. Only then is the purchase marked paid.
// Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (+ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY provided by Supabase).

const ALLOWED_ORIGINS = ['https://shivam-soni.com', 'https://www.shivam-soni.com', 'https://localhost', 'http://localhost:5173', 'http://localhost:4173'];

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

async function getUser(req: Request, env: Env, serviceKey: string, f: typeof fetch) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const r = await f(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: serviceKey, Authorization: auth } });
  if (!r.ok) return null;
  const user = await r.json();
  return user?.id ? user : null;
}

const db = (env: Env, serviceKey: string, f: typeof fetch) => (path: string, init: RequestInit = {}) =>
  f(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });

export async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Compare without leaking timing information. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function handler(req: Request, env: Env, f: typeof fetch = fetch): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, 405, { error: 'Use POST.' });

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!env.SUPABASE_URL || !serviceKey || !env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET)
    return json(req, 500, { error: 'Payments are not configured yet (missing server secrets).' });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json(req, 400, { error: 'Send the payment details as JSON.' });
  }
  const orderId = String(body.razorpay_order_id || '');
  const paymentId = String(body.razorpay_payment_id || '');
  const signature = String(body.razorpay_signature || '');
  if (!orderId || !paymentId || !signature) return json(req, 400, { error: 'Missing payment details.' });

  // 1. Signature check: proves Razorpay issued this payment for this order.
  const expected = await hmacHex(env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`);
  if (!safeEqual(expected, signature)) return json(req, 400, { error: 'Payment could not be verified (signature mismatch).' });

  const user = await getUser(req, env, serviceKey, f);
  if (!user) return json(req, 401, { error: 'Please sign in again to finish unlocking your course.' });

  // 2. The order must be this learner's.
  const q = db(env, serviceKey, f);
  const pRes = await q(`purchases?razorpay_order_id=eq.${encodeURIComponent(orderId)}&select=id,user_id,product_id,amount_paise,status`);
  const [purchase] = pRes.ok ? await pRes.json() : [];
  if (!purchase || purchase.user_id !== user.id) return json(req, 404, { error: 'This order was not found for your account.' });
  if (purchase.status === 'paid') return json(req, 200, { ok: true, product: purchase.product_id });

  // 3. Ask Razorpay what really happened, and capture the payment if needed.
  const rzAuth = { Authorization: `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`, 'Content-Type': 'application/json' };
  const payRes = await f(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers: rzAuth });
  if (!payRes.ok) return json(req, 500, { error: 'Could not confirm the payment with Razorpay. If money was taken, it will be unlocked or refunded automatically.' });
  let payment = await payRes.json();
  if (payment.order_id !== orderId || Number(payment.amount) !== Number(purchase.amount_paise) || payment.currency !== 'INR')
    return json(req, 400, { error: 'The payment does not match this order.' });
  if (payment.status === 'authorized') {
    const cap = await f(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/capture`, {
      method: 'POST',
      headers: rzAuth,
      body: JSON.stringify({ amount: payment.amount, currency: payment.currency }),
    });
    if (cap.ok) payment = await cap.json();
  }
  if (payment.status !== 'captured') return json(req, 400, { error: `The payment is ${payment.status}, so the course was not unlocked.` });

  const upd = await q(`purchases?id=eq.${purchase.id}&status=neq.paid`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'paid', razorpay_payment_id: paymentId, paid_at: new Date().toISOString() }),
  });
  if (!upd.ok) return json(req, 500, { error: 'Payment received but the course could not be unlocked yet. It will unlock shortly.' });
  return json(req, 200, { ok: true, product: purchase.product_id });
}

// @ts-ignore Deno is only defined on Supabase
if (typeof Deno !== 'undefined') Deno.serve((req: Request) => handler(req, Deno.env.toObject()));
