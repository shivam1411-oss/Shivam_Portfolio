// Supabase Edge Function: CodeJack admin page's server. Only users listed in public.admins can use it.
//
// POST /functions/v1/admin   Header: Authorization: Bearer <signed-in admin's access token>
//   { "action": "overview" }                              → { users, purchases, progress }
//   { "action": "refund", "purchase_id": "…" }            → refunds the full amount through Razorpay, marks it refunded
//   { "action": "grant", "email": "…", "product": "…" }   → gives a course for free (recorded as a ₹0 purchase)
//   { "action": "revoke", "purchase_id": "…" }            → removes access from a free grant
//   { "action": "support_list" }                          → { tickets } every support request, with replies
//   { "action": "support_reply", "ticket_id": 12, "message": "…", "resolve": false }
//        → saves your reply, marks the request answered (or resolved) and emails it to the learner
//   { "action": "support_status", "ticket_id": 12, "status": "resolved" } → open | answered | resolved
// Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (for refunds); BREVO_API_KEY and optional SUPPORT_FROM / SUPPORT_INBOX
// (for support replies, as in the support function). SUPABASE_URL and the service key are provided by Supabase.
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

// ---------------------------------------------------------------- support replies (same email style as the support function)
const ticketNumber = (id: number) => `CJ-${String(id).padStart(4, '0')}`;
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
function replyEmail(title: string, intro: string, message: string) {
  return `<!doctype html><html lang="en"><body style="margin:0;padding:24px 12px;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #e7e5e4;border-radius:20px;">
<tr><td style="padding:28px 28px 6px;"><img src="https://shivam-soni.com/codejack-icon.png" width="52" height="52" alt="CodeJack" style="display:block;width:52px;height:52px;border:0;border-radius:12px;margin:0 0 14px;" /><div style="font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#0f766e;">CodeJack Support</div>
<h1 style="margin:12px 0 0;font-size:21px;line-height:1.3;font-weight:800;">${escapeHtml(title)}</h1></td></tr>
<tr><td style="padding:10px 28px 0;font-size:15px;line-height:1.6;color:#52525b;">${intro}</td></tr>
<tr><td style="padding:16px 28px;"><div style="padding:14px 16px;background:#f6f6f4;border-radius:12px;font-size:14px;line-height:1.6;color:#27272a;">${escapeHtml(message).replace(/\n/g, '<br />')}</div></td></tr>
<tr><td style="padding:0 28px 26px;font-size:12px;line-height:1.6;color:#71717a;">You can reply to this email, or add a message under <a href="https://shivam-soni.com/learn.html#/support" style="color:#0f766e;">Help in CodeJack</a>.</td></tr>
</table></td></tr></table></body></html>`;
}

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

    if (action === 'support_list') {
      const tickets = await rest(
        'support_tickets?select=id,user_id,email,name,category,subject,message,context,status,created_at,updated_at,support_replies(id,author,message,created_at)&order=updated_at.desc&support_replies.order=created_at.asc&limit=500'
      ).then((r) => r.json());
      if (!Array.isArray(tickets)) return json(req, 500, { error: 'Could not read support requests. Has supabase/support.sql been run?' });
      return json(req, 200, { tickets: tickets.map(({ support_replies, ...t }: any) => ({ ...t, number: ticketNumber(t.id), replies: support_replies || [] })) });
    }

    if (action === 'support_reply' || action === 'support_status') {
      const id = Number(body.ticket_id);
      if (!Number.isInteger(id) || id < 1) return json(req, 400, { error: 'Unknown request.' });
      const [t] = await rest(`support_tickets?id=eq.${id}&select=id,email,name,subject`).then((r) => r.json());
      if (!t) return json(req, 404, { error: 'Request not found.' });
      let status = String(body.status || '');
      if (action === 'support_reply') {
        const message = String(body.message || '').replace(/\r\n/g, '\n').trim().slice(0, 4000);
        if (!message) return json(req, 400, { error: 'Write a reply first.' });
        const ins = await rest('support_replies', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ ticket_id: id, author: 'support', message }) });
        if (!ins.ok) return json(req, 500, { error: 'The reply could not be saved.' });
        status = body.resolve ? 'resolved' : 'answered';
        let emailed = false;
        const brevo = cleanSecret(env.BREVO_API_KEY || rawEnv.BREVO_API_KEY);
        if (brevo) {
          const no = ticketNumber(id);
          const r = await f('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'api-key': brevo, 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              sender: { name: 'CodeJack Support', email: cleanSecret(rawEnv.SUPPORT_FROM) || 'support@shivam-soni.com' },
              to: [{ email: t.email, name: t.name || undefined }],
              replyTo: { email: cleanSecret(rawEnv.SUPPORT_INBOX) || 'hello@shivam-soni.com' },
              subject: `Re: ${t.subject} [${no}]`,
              htmlContent: replyEmail(
                `A reply to your request ${no}`,
                `Hi ${escapeHtml(t.name || 'there')}, ${status === 'resolved' ? 'here is our reply. We have marked this request as resolved; reply if anything is still not right.' : 'here is our reply to your request.'}`,
                message
              ),
            }),
          });
          emailed = r.ok;
          if (!r.ok) console.error('Brevo rejected the support reply', r.status, await r.text().catch(() => ''));
        }
        const upd = await rest(`support_tickets?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status, updated_at: new Date().toISOString() }) });
        if (!upd.ok) return json(req, 500, { error: 'Reply saved, but the status could not be updated.' });
        return json(req, 200, { ok: true, emailed });
      }
      if (!['open', 'answered', 'resolved'].includes(status)) return json(req, 400, { error: 'Unknown status.' });
      const upd = await rest(`support_tickets?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status, updated_at: new Date().toISOString() }) });
      if (!upd.ok) return json(req, 500, { error: 'The status could not be updated.' });
      return json(req, 200, { ok: true });
    }

    return json(req, 400, { error: 'Unknown action.' });
  } catch (e) {
    return json(req, 500, { error: String((e as Error)?.message || e) });
  }
}

// @ts-ignore Deno is only defined on Supabase
if (typeof Deno !== 'undefined') Deno.serve((req: Request) => handler(req, Deno.env.toObject()));
