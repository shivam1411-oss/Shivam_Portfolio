// Supabase Edge Function: Razorpay webhook, a safety net that unlocks the course even if the buyer closed
// the page before verify-payment ran. Razorpay calls it server-to-server.
//
// Razorpay Dashboard → Account & Settings → Webhooks → Add: URL https://<project>.supabase.co/functions/v1/razorpay-webhook,
// events payment.captured and order.paid, and a secret you choose (also saved as RAZORPAY_WEBHOOK_SECRET).
// Turn OFF "Verify JWT" for this function: Razorpay does not send a Supabase token; the signature below is the check.

type Env = Record<string, string | undefined>;

/** The server (service) key: the older SUPABASE_SERVICE_ROLE_KEY, or the newer sb_secret_ key from SUPABASE_SECRET_KEYS. */
function serviceKeyFrom(env: Env) {
  if (env.SUPABASE_SERVICE_ROLE_KEY) return env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    const keys = JSON.parse(env.SUPABASE_SECRET_KEYS || '{}');
    return keys.default || Object.values(keys)[0] || '';
  } catch {
    return '';
  }
}
/** Headers that authenticate as the server. New sb_secret_ keys go only in apikey; older JWT keys also as a Bearer token. */
const serverHeaders = (key: string) => (key.startsWith('sb_secret_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` });
/** Names (never values) of required settings that are missing. */
const missing = (env: Env, serviceKey: string, names: string[]) => [
  ...(env.SUPABASE_URL ? [] : ['SUPABASE_URL']),
  ...(serviceKey ? [] : ['service key (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEYS)']),
  ...names.filter((n) => !env[n]),
];

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function handler(req: Request, rawEnv: Env, f: typeof fetch = fetch): Promise<Response> {
  const env: Env = { ...rawEnv, RAZORPAY_WEBHOOK_SECRET: (rawEnv.RAZORPAY_WEBHOOK_SECRET || '').trim().replace(/^['"]|['"]$/g, '').trim() };
  if (req.method !== 'POST') return new Response('Use POST', { status: 405 });
  const serviceKey = serviceKeyFrom(env);
  const gaps = missing(env, serviceKey, ['RAZORPAY_WEBHOOK_SECRET']);
  if (gaps.length) return new Response(`Not configured. Missing: ${gaps.join(', ')}`, { status: 500 });

  const raw = await req.text(); // the signature covers the exact bytes Razorpay sent
  const signature = req.headers.get('x-razorpay-signature') || '';
  if (!safeEqual(await hmacHex(env.RAZORPAY_WEBHOOK_SECRET, raw), signature)) return new Response('Bad signature', { status: 400 });

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }
  if (event.event !== 'payment.captured' && event.event !== 'order.paid') return new Response('Ignored', { status: 200 });
  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id || payment.status !== 'captured') return new Response('Ignored', { status: 200 });

  const headers = { ...serverHeaders(serviceKey), 'Content-Type': 'application/json' };
  const pRes = await f(`${env.SUPABASE_URL}/rest/v1/purchases?razorpay_order_id=eq.${encodeURIComponent(payment.order_id)}&select=id,amount_paise,status`, { headers });
  const [purchase] = pRes.ok ? await pRes.json() : [];
  if (!purchase) return new Response('Unknown order', { status: 200 }); // not one of ours; acknowledge so Razorpay stops retrying
  if (purchase.status === 'paid') return new Response('Already paid', { status: 200 });
  if (Number(payment.amount) !== Number(purchase.amount_paise)) return new Response('Amount mismatch', { status: 200 });

  const upd = await f(`${env.SUPABASE_URL}/rest/v1/purchases?id=eq.${purchase.id}&status=neq.paid`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'paid', razorpay_payment_id: payment.id, paid_at: new Date().toISOString() }),
  });
  return new Response(upd.ok ? 'Unlocked' : 'Retry', { status: upd.ok ? 200 : 500 }); // 500 makes Razorpay retry later
}

// @ts-ignore Deno is only defined on Supabase
if (typeof Deno !== 'undefined') Deno.serve((req: Request) => handler(req, Deno.env.toObject()));
