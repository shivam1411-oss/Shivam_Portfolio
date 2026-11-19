// Supabase Edge Function: CodeJack support requests, for signed-in learners.
//
// POST /functions/v1/support   Header: Authorization: Bearer <signed-in learner's access token>
//   { "action": "create", "category": "payment", "subject": "…", "message": "…", "context": { … } }
//        → { ticket }   saves a ticket, emails you a notification and the learner a confirmation
//   { "action": "list" }                                  → { tickets }   the learner's own tickets, with replies
//   { "action": "reply", "ticket_id": 12, "message": "…" } → { ok }       a follow-up; reopens the ticket, emails you
//
// Tables: public.support_tickets and public.support_replies (supabase/support.sql).
// Secrets: BREVO_API_KEY (already set for send-resume). Optional: SUPPORT_FROM (sender, default
// support@shivam-soni.com: add it as a sender in Brevo), SUPPORT_INBOX (where notifications go, default
// hello@shivam-soni.com). Turn OFF "Verify JWT" for this function, like the others: it checks the sign-in itself.

const ALLOWED_ORIGINS = ['https://shivam-soni.com', 'https://www.shivam-soni.com', 'https://localhost', 'http://localhost:5173', 'http://localhost:4173'];
export const CATEGORIES: Record<string, string> = {
  payment: 'Payment or course unlock',
  account: 'Account or sign-in',
  content: 'Lesson, exercise or quiz',
  bug: 'Something is broken',
  other: 'Something else',
};
export const LIMITS = { ticketsPerDay: 5, repliesPerDay: 20, openTickets: 10 };
const LAB = 'https://shivam-soni.com/learn.html#/support';

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
const clean = (v?: string) => (v || '').trim().replace(/^['"]|['"]$/g, '').trim();

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

export const ticketNumber = (id: number) => `CJ-${String(id).padStart(4, '0')}`;
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
const paragraphs = (s: string) => escapeHtml(s).replace(/\n/g, '<br />');
const oneLine = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const text = (v: unknown, max: number) => String(v ?? '').replace(/\r\n/g, '\n').trim().slice(0, max);

/** A short, plain email in the same style as the account emails. */
export function emailHtml(title: string, intro: string, quote: string, footer: string) {
  return `<!doctype html><html lang="en"><body style="margin:0;padding:24px 12px;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #e7e5e4;border-radius:20px;">
<tr><td style="padding:28px 28px 6px;"><div style="font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#0f766e;">CodeJack Support</div>
<h1 style="margin:12px 0 0;font-size:21px;line-height:1.3;font-weight:800;">${escapeHtml(title)}</h1></td></tr>
<tr><td style="padding:10px 28px 0;font-size:15px;line-height:1.6;color:#52525b;">${intro}</td></tr>
<tr><td style="padding:16px 28px;"><div style="padding:14px 16px;background:#f6f6f4;border-radius:12px;font-size:14px;line-height:1.6;color:#27272a;">${quote}</div></td></tr>
<tr><td style="padding:0 28px 26px;font-size:12px;line-height:1.6;color:#71717a;">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

async function sendEmail(f: typeof fetch, env: Env, to: { email: string; name?: string }, subject: string, html: string, replyTo?: string) {
  const key = clean(env.BREVO_API_KEY);
  if (!key) return false;
  const r = await f('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'CodeJack Support', email: clean(env.SUPPORT_FROM) || 'support@shivam-soni.com' },
      to: [to],
      replyTo: { email: replyTo || clean(env.SUPPORT_INBOX) || 'hello@shivam-soni.com' },
      subject,
      htmlContent: html,
    }),
  });
  if (!r.ok) console.error('Brevo rejected the support email', r.status, await r.text().catch(() => ''));
  return r.ok;
}

export async function handler(req: Request, env: Env, f: typeof fetch = fetch): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, 405, { error: 'Use POST.' });
  const key = serviceKeyFrom(env);
  if (!env.SUPABASE_URL || !key) return json(req, 500, { error: 'Support is not configured yet.' });
  const base = env.SUPABASE_URL;
  const H = { ...serverHeaders(key), 'Content-Type': 'application/json' };
  const rest = (path: string, init: RequestInit = {}) => f(`${base}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  const count = async (path: string) => {
    const r = await rest(path, { headers: { Prefer: 'count=exact', Range: '0-0' } });
    return Number((r.headers.get('content-range') || '').split('/')[1] || 0);
  };

  // Who is asking? Only signed-in learners can use support.
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return json(req, 401, { error: 'Please sign in to contact support.' });
  const me = await f(`${base}/auth/v1/user`, { headers: { apikey: serverHeaders(key).apikey, Authorization: auth } });
  const user = me.ok ? await me.json() : null;
  if (!user?.id || !user.email) return json(req, 401, { error: 'Please sign in again.' });
  const name = oneLine(user.user_metadata?.name, 60);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json(req, 400, { error: 'Send JSON.' });
  }
  const action = String(body.action || '');
  const dayAgo = new Date(Date.now() - 864e5).toISOString();
  const inbox = clean(env.SUPPORT_INBOX) || 'hello@shivam-soni.com';

  try {
    if (action === 'create') {
      const category = String(body.category || '');
      const subject = oneLine(body.subject, 120);
      const message = text(body.message, 4000);
      if (!CATEGORIES[category]) return json(req, 400, { error: 'Choose what your request is about.' });
      if (subject.length < 3) return json(req, 400, { error: 'Add a short subject.' });
      if (message.length < 10) return json(req, 400, { error: 'Describe the problem in a sentence or two.' });
      const [today, open] = await Promise.all([
        count(`support_tickets?select=id&user_id=eq.${user.id}&created_at=gte.${dayAgo}`),
        count(`support_tickets?select=id&user_id=eq.${user.id}&status=neq.resolved`),
      ]);
      if (today >= LIMITS.ticketsPerDay) return json(req, 429, { error: 'You have raised several requests today. Please add to an existing one, or try again tomorrow.' });
      if (open >= LIMITS.openTickets) return json(req, 429, { error: 'You have many open requests. Please add to one of them instead.' });

      const raw = (body.context || {}) as Record<string, unknown>;
      const context = {
        from: oneLine(raw.from, 200),
        platform: raw.platform === 'app' ? 'app' : 'web',
        payment: oneLine(raw.payment, 80),
        browser: oneLine(req.headers.get('user-agent'), 200),
      };
      const ins = await rest('support_tickets', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ user_id: user.id, email: user.email, name, category, subject, message, context }),
      });
      if (!ins.ok) {
        console.error('Could not save the ticket', ins.status, await ins.text().catch(() => ''));
        return json(req, 500, { error: 'Your request could not be saved. Please try again, or email hello@shivam-soni.com.' });
      }
      const [ticket] = await ins.json();
      const no = ticketNumber(ticket.id);

      // Emails are best effort: the ticket is already saved and shows in the admin page either way.
      const details = `<b>${escapeHtml(CATEGORIES[category])}</b> · ${escapeHtml(subject)}<br /><br />${paragraphs(message)}`;
      await Promise.all([
        sendEmail(
          f,
          env,
          { email: inbox, name: 'Shivam Soni' },
          `[${no}] ${CATEGORIES[category]}: ${subject}`,
          emailHtml(
            `New support request ${no}`,
            `From <b>${escapeHtml(name || user.email)}</b> (${escapeHtml(user.email)}), on the ${context.platform === 'app' ? 'Android app' : 'website'}${context.payment ? `, payment reference ${escapeHtml(context.payment)}` : ''}.`,
            details,
            'Reply from the Support section of the CodeJack admin page, so the learner sees it in CodeJack too.'
          ),
          user.email
        ),
        sendEmail(
          f,
          env,
          { email: user.email, name: name || undefined },
          `We received your request ${no}`,
          emailHtml(
            `We received your request ${no}`,
            `Hi ${escapeHtml(name || 'there')}, thanks for getting in touch. We usually reply within 48 hours. You will get an email when we do, and you can follow the request under <a href="${LAB}" style="color:#0f766e;">Help in CodeJack</a>.`,
            details,
            'You received this because you raised a support request in CodeJack at shivam-soni.com.'
          )
        ),
      ]);
      return json(req, 200, { ticket: { ...ticket, number: no, replies: [] } });
    }

    if (action === 'list') {
      const tickets = await rest(
        `support_tickets?user_id=eq.${user.id}&select=id,category,subject,message,status,created_at,updated_at,support_replies(id,author,message,created_at)&order=updated_at.desc&support_replies.order=created_at.asc`
      ).then((r) => r.json());
      return json(req, 200, {
        tickets: (Array.isArray(tickets) ? tickets : []).map(({ support_replies, ...t }: any) => ({ ...t, number: ticketNumber(t.id), replies: support_replies || [] })),
      });
    }

    if (action === 'reply') {
      const id = Number(body.ticket_id);
      const message = text(body.message, 4000);
      if (!Number.isInteger(id) || id < 1) return json(req, 400, { error: 'Unknown request.' });
      if (!message) return json(req, 400, { error: 'Write a message first.' });
      const [ticket] = await rest(`support_tickets?id=eq.${id}&user_id=eq.${user.id}&select=id,subject,category`).then((r) => r.json());
      if (!ticket) return json(req, 404, { error: 'Request not found.' });
      const today = await count(
        `support_replies?select=id&author=eq.learner&created_at=gte.${dayAgo}&ticket_id=in.(${(
          await rest(`support_tickets?user_id=eq.${user.id}&select=id`).then((r) => r.json())
        )
          .map((t: any) => t.id)
          .join(',')})`
      );
      if (today >= LIMITS.repliesPerDay) return json(req, 429, { error: 'You have sent many messages today. Please wait for a reply.' });
      const ins = await rest('support_replies', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ ticket_id: id, author: 'learner', message }) });
      if (!ins.ok) return json(req, 500, { error: 'Your message could not be saved. Please try again.' });
      await rest(`support_tickets?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'open', updated_at: new Date().toISOString() }) });
      const no = ticketNumber(id);
      await sendEmail(
        f,
        env,
        { email: inbox, name: 'Shivam Soni' },
        `[${no}] New message: ${ticket.subject}`,
        emailHtml(`New message on ${no}`, `From <b>${escapeHtml(name || user.email)}</b> (${escapeHtml(user.email)}). The request is open again.`, paragraphs(message), 'Reply from the Support section of the CodeJack admin page.'),
        user.email
      );
      return json(req, 200, { ok: true });
    }

    return json(req, 400, { error: 'Unknown action.' });
  } catch (e) {
    console.error('Support function failed', e);
    return json(req, 500, { error: 'Something went wrong. Please try again, or email hello@shivam-soni.com.' });
  }
}

// @ts-ignore Deno is only defined on Supabase
if (typeof Deno !== 'undefined') Deno.serve((req: Request) => handler(req, Deno.env.toObject()));
