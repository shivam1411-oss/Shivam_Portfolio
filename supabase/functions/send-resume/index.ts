// Supabase Edge Function: email the resume PDF to a visitor, sent through Brevo from shivam-soni.com.
// Replaces EmailJS for the website's "Get Resume" form.
//
// POST /functions/v1/send-resume   body: { "name": "…", "email": "…", "company": "" }
// → 200 { ok: true }  |  400 bad input  |  429 too many requests  |  500 not configured / send failed
//
// Abuse limits (hashed email and IP only, kept 2 days, table public.resume_requests in supabase/resume.sql):
// the same address 3 times a day, the same IP 10 times an hour, and 250 emails a day in total.
// "company" is a hidden form field: people leave it empty, bots fill it in and get a silent success.
//
// Secrets (Supabase → Edge Functions → Secrets): BREVO_API_KEY. Optional: RESUME_FROM (sender address,
// default resume@shivam-soni.com; add it under Brevo → Senders), RESUME_REPLY_TO (default hello@shivam-soni.com).
// SUPABASE_URL and the service key are provided by Supabase automatically. Deploy with "Verify JWT" off.

const ALLOWED_ORIGINS = ['https://shivam-soni.com', 'https://www.shivam-soni.com', 'https://localhost', 'http://localhost:5173', 'http://localhost:4173'];
const RESUME_URL = 'https://shivam-soni.com/assets/Shivam-Soni-Resume.pdf';
const LIMITS = { perEmailDay: 3, perIpHour: 10, totalDay: 250 };

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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/** HMAC-SHA256 so the table never holds an email address or IP in the clear. */
async function hash(secret: string, value: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function toBase64(bytes: Uint8Array) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// The email itself: a short summary a recruiter can scan without opening the PDF.
// Keep these facts in step with resume/resume.html.
const SITE = 'https://shivam-soni.com/';
const LINKEDIN = 'https://www.linkedin.com/in/shivamsoni-strategy';
export const EMAIL_SUBJECT = 'Resume: Shivam Soni, Business & Collection Strategy (7+ years, consumer credit)';
const HIGHLIGHTS: [string, string][] = [
  ['Current role', 'Manager, Business and Collection Strategy at OneCard (FPL Technologies), Pune'],
  ['Experience', '7+ years in financial services and consumer credit at OneCard, HDFC Bank and Bandhan Bank'],
  ['Focus', 'Portfolio and collection strategy, champion-challenger testing, CRM product rollout, Agile delivery'],
  ['Results', 'Collection efficiency up from 50% to 65%, forward roll rates down 15%, DSO down 12 days'],
  ['Tools', 'SQL, Power BI, Python, Advanced Excel'],
  ['Education', 'MBA in Finance'],
];
const SIGNATURE = ['Shivam Soni', 'Manager, Business and Collection Strategy', 'Pune, India'];

export function emailText(name: string) {
  return [
    `Hi ${name},`,
    'Thank you for your interest. My resume is attached as a PDF (Shivam-Soni-Resume.pdf).',
    `In brief:\n${HIGHLIGHTS.map(([k, v]) => `- ${k}: ${v}`).join('\n')}`,
    'If the role looks like a fit, I would be glad to set up a call. Reply to this email with the job description or a few times that suit you, and I will get back to you promptly.',
    `Portfolio: ${SITE}\nLinkedIn: ${LINKEDIN}`,
    `Best regards,\n${SIGNATURE.join('\n')}`,
  ].join('\n\n');
}

export function emailHtml(name: string) {
  const p = 'margin:0 0 14px';
  const rows = HIGHLIGHTS.map(
    ([k, v]) => `<tr><td style="padding:4px 12px 4px 0;vertical-align:top;white-space:nowrap;color:#555"><b>${escapeHtml(k)}</b></td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
  ).join('');
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:600px">
<p style="${p}">Hi ${escapeHtml(name)},</p>
<p style="${p}">Thank you for your interest. My resume is attached as a PDF (Shivam-Soni-Resume.pdf).</p>
<p style="margin:0 0 6px"><b>In brief</b></p>
<table role="presentation" style="border-collapse:collapse;margin:0 0 14px;font-size:14px">${rows}</table>
<p style="${p}">If the role looks like a fit, I would be glad to set up a call. Reply to this email with the job description or a few times that suit you, and I will get back to you promptly.</p>
<p style="${p}"><a href="${SITE}" style="color:#0f766e">Portfolio</a> &nbsp;·&nbsp; <a href="${LINKEDIN}" style="color:#0f766e">LinkedIn</a></p>
<p style="margin:0">Best regards,<br>${SIGNATURE.map(escapeHtml).join('<br>')}</p>
</div>`;
}

export async function handler(req: Request, rawEnv: Env, f: typeof fetch = fetch): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, 405, { error: 'Use POST.' });
  const env = { ...rawEnv, BREVO_API_KEY: clean(rawEnv.BREVO_API_KEY) };
  const serviceKey = serviceKeyFrom(env);
  if (!env.SUPABASE_URL || !serviceKey || !env.BREVO_API_KEY) return json(req, 500, { error: 'Resume emails are not configured yet.' });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json(req, 400, { error: 'Please enter your name and email address.' });
  }
  const name = String(body.name || '').trim().slice(0, 80);
  const email = String(body.email || '').trim().toLowerCase().slice(0, 200);
  if (String(body.company || '').trim()) return json(req, 200, { ok: true }); // a bot filled the hidden field
  if (name.length < 2) return json(req, 400, { error: 'Please enter your name.' });
  if (!EMAIL.test(email)) return json(req, 400, { error: 'Please enter a valid email address.' });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const [emailHash, ipHash] = await Promise.all([hash(serviceKey, `email:${email}`), hash(serviceKey, `ip:${ip}`)]);
  const db = (path: string, init: RequestInit = {}) =>
    f(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { ...serverHeaders(serviceKey), 'Content-Type': 'application/json', ...(init.headers || {}) } });
  const count = async (filter: string) => {
    const r = await db(`resume_requests?select=id&${filter}`, { headers: { Prefer: 'count=exact', Range: '0-0' } });
    return Number((r.headers.get('content-range') || '*/0').split('/')[1]) || 0;
  };
  const dayAgo = new Date(Date.now() - 864e5).toISOString();
  const hourAgo = new Date(Date.now() - 36e5).toISOString();
  const [byEmail, byIp, total] = await Promise.all([
    count(`email_hash=eq.${emailHash}&created_at=gte.${dayAgo}`),
    count(`ip_hash=eq.${ipHash}&created_at=gte.${hourAgo}`),
    count(`created_at=gte.${dayAgo}`),
  ]);
  if (byEmail >= LIMITS.perEmailDay || byIp >= LIMITS.perIpHour || total >= LIMITS.totalDay)
    return json(req, 429, { error: 'Too many requests. Please try again later, or email hello@shivam-soni.com.' });

  const pdf = await f(RESUME_URL);
  if (!pdf.ok) return json(req, 500, { error: 'The resume could not be attached. Please try again later.' });
  const attachment = toBase64(new Uint8Array(await pdf.arrayBuffer()));

  const from = clean(env.RESUME_FROM) || 'resume@shivam-soni.com';
  const replyTo = clean(env.RESUME_REPLY_TO) || 'hello@shivam-soni.com';
  const sent = await f('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Shivam Soni', email: from },
      to: [{ email, name }],
      replyTo: { email: replyTo, name: 'Shivam Soni' },
      subject: EMAIL_SUBJECT,
      htmlContent: emailHtml(name),
      textContent: emailText(name),
      attachment: [{ name: 'Shivam-Soni-Resume.pdf', content: attachment }],
      tags: ['resume'],
    }),
  });
  if (!sent.ok) {
    console.error('Brevo rejected the email', sent.status, (await sent.text()).slice(0, 300));
    return json(req, 500, { error: 'The email could not be sent. Please try again later.' });
  }

  // Record the request for the limits, and drop records older than two days.
  await db('resume_requests', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ email_hash: emailHash, ip_hash: ipHash }) });
  await db(`resume_requests?created_at=lt.${new Date(Date.now() - 2 * 864e5).toISOString()}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
  return json(req, 200, { ok: true });
}

// @ts-ignore Deno is only defined on Supabase
if (typeof Deno !== 'undefined') Deno.serve((req: Request) => handler(req, Deno.env.toObject()));
