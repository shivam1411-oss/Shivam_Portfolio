// Checks the support and admin Edge Functions against an in-memory stand-in for Supabase and Brevo: sign-in,
// validation, limits, emails (and HTML escaping), learners seeing only their own requests, admin-only actions,
// replies, status changes, and that a request is saved even when email fails. Nothing real is called.
//   node scripts/check-support.mts
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const support = await import(`${repo}/supabase/functions/support/index.ts`);
const admin = await import(`${repo}/supabase/functions/admin/index.ts`);

const db: Record<string, any[]> = { support_tickets: [], support_replies: [], admins: [{ user_id: 'admin-1' }] };
const ids: Record<string, number> = { support_tickets: 0, support_replies: 0 };
const emails: any[] = [];
const users: Record<string, any> = {
  'tok-learner': { id: 'user-1', email: 'asha@example.com', user_metadata: { name: 'Asha' } },
  'tok-other': { id: 'user-2', email: 'ravi@example.com', user_metadata: {} },
  'tok-admin': { id: 'admin-1', email: 'owner@example.com', user_metadata: { name: 'Owner' } },
};

function match(row: any, filters: URLSearchParams) {
  for (const [k, v] of filters) {
    if (['select', 'order', 'limit'].includes(k) || k.includes('.')) continue;
    const [op, ...rest] = v.split('.');
    const val = rest.join('.');
    const cell = row[k];
    if (op === 'eq' && String(cell) !== val) return false;
    if (op === 'neq' && String(cell) === val) return false;
    if (op === 'gte' && !(String(cell) >= val)) return false;
    if (op === 'in' && !val.replace(/[()]/g, '').split(',').includes(String(cell))) return false;
  }
  return true;
}

const fake: typeof fetch = async (input: any, init: any = {}) => {
  const url = new URL(String(input));
  const method = init.method || 'GET';
  const headers = new Headers(init.headers || {});
  if (url.hostname === 'api.brevo.com') {
    emails.push(JSON.parse(init.body));
    return new Response('{}', { status: 201 });
  }
  if (url.pathname === '/auth/v1/user') {
    const u = users[(headers.get('authorization') || '').replace('Bearer ', '')];
    return u ? Response.json(u) : new Response('{}', { status: 401 });
  }
  const table = url.pathname.replace('/rest/v1/', '');
  const rows = db[table];
  if (method === 'POST') {
    const row = { id: ++ids[table], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), status: 'open', ...JSON.parse(init.body) };
    rows.push(row);
    return headers.get('prefer')?.includes('representation') ? Response.json([row], { status: 201 }) : new Response(null, { status: 201 });
  }
  if (method === 'PATCH') {
    rows.filter((r) => match(r, url.searchParams)).forEach((r) => Object.assign(r, JSON.parse(init.body)));
    return new Response(null, { status: 204 });
  }
  let found = rows.filter((r) => match(r, url.searchParams));
  if (url.searchParams.get('select')?.includes('support_replies(')) {
    found = found.map((t) => ({ ...t, support_replies: db.support_replies.filter((r) => r.ticket_id === t.id) }));
  }
  if (headers.get('prefer')?.includes('count=exact')) return new Response('[]', { headers: { 'content-range': `0-0/${found.length}` } });
  return Response.json(found);
};

const env = { SUPABASE_URL: 'https://db.test', SUPABASE_SERVICE_ROLE_KEY: 'svc', BREVO_API_KEY: 'xkeysib-test' };
const call = async (mod: any, token: string | null, body: any) => {
  const req = new Request('https://db.test/functions/v1/x', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin: 'https://shivam-soni.com', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const res = await mod.handler(req, env, fake);
  return { status: res.status, body: await res.json() };
};

const good = { action: 'create', category: 'payment', subject: 'Paid but Python is locked', message: 'I paid for Python an hour ago and it is still locked.', context: { from: '#/c/python/py-loops', platform: 'app', payment: 'pay_123' } };
let r;

// Signed out, and bad input
r = await call(support, null, good); assert.equal(r.status, 401);
r = await call(support, 'tok-learner', { ...good, category: 'nope' }); assert.equal(r.status, 400);
r = await call(support, 'tok-learner', { ...good, message: 'short' }); assert.equal(r.status, 400);

// Create: saved, numbered, two emails
r = await call(support, 'tok-learner', good);
assert.equal(r.status, 200); assert.equal(r.body.ticket.number, 'CJ-0001');
assert.equal(db.support_tickets[0].context.platform, 'app'); assert.equal(db.support_tickets[0].context.payment, 'pay_123');
assert.equal(emails.length, 2);
assert.equal(emails[0].to[0].email, 'hello@shivam-soni.com'); assert.match(emails[0].subject, /^\[CJ-0001\] Payment or course unlock/);
assert.equal(emails[0].replyTo.email, 'asha@example.com');
assert.equal(emails[1].to[0].email, 'asha@example.com'); assert.match(emails[1].subject, /CJ-0001/);
assert.equal(emails[1].sender.email, 'support@shivam-soni.com');

// HTML in a message is escaped in the email
r = await call(support, 'tok-learner', { ...good, subject: 'Script test', message: '<script>alert(1)</script> please check' });
assert.ok(!emails.at(-1).htmlContent.includes('<script>'));

// Limits: 5 a day
for (let i = 0; i < 3; i++) r = await call(support, 'tok-learner', good);
assert.equal(r.status, 200);
r = await call(support, 'tok-learner', good); assert.equal(r.status, 429);

// List: only your own
await call(support, 'tok-other', { ...good, subject: 'Other person' });
r = await call(support, 'tok-learner', { action: 'list' });
assert.equal(r.body.tickets.length, 5); assert.ok(r.body.tickets.every((t: any) => t.number.startsWith('CJ-')));
r = await call(support, 'tok-other', { action: 'list' }); assert.equal(r.body.tickets.length, 1);

// Reply to someone else's ticket: not found
r = await call(support, 'tok-other', { action: 'reply', ticket_id: 1, message: 'hi' }); assert.equal(r.status, 404);

// Admin: non-admins refused; admin sees everything
r = await call(admin, 'tok-learner', { action: 'support_list' }); assert.equal(r.status, 403);
r = await call(admin, 'tok-admin', { action: 'support_list' }); assert.equal(r.status, 200); assert.equal(r.body.tickets.length, 6);

// Admin reply: saved, status answered, learner emailed
const before = emails.length;
r = await call(admin, 'tok-admin', { action: 'support_reply', ticket_id: 1, message: 'Unlocked now, sorry for the wait.\nThanks!' });
assert.equal(r.status, 200); assert.equal(r.body.emailed, true);
assert.equal(db.support_tickets[0].status, 'answered');
assert.equal(emails.length, before + 1); assert.equal(emails.at(-1).to[0].email, 'asha@example.com'); assert.match(emails.at(-1).subject, /\[CJ-0001\]/);
assert.ok(emails.at(-1).htmlContent.includes('Unlocked now, sorry for the wait.<br />Thanks!'));

// Learner follow-up reopens it and emails you
r = await call(support, 'tok-learner', { action: 'reply', ticket_id: 1, message: 'Works now, thank you!' });
assert.equal(r.status, 200); assert.equal(db.support_tickets[0].status, 'open'); assert.match(emails.at(-1).subject, /New message/);

// Learner sees the thread in order
r = await call(support, 'tok-learner', { action: 'list' });
const t1 = r.body.tickets.find((t: any) => t.id === 1);
assert.deepEqual(t1.replies.map((x: any) => x.author), ['support', 'learner']);

// Admin resolves with a reply, then reopens via status
r = await call(admin, 'tok-admin', { action: 'support_reply', ticket_id: 1, message: 'Great!', resolve: true });
assert.equal(db.support_tickets[0].status, 'resolved');
r = await call(admin, 'tok-admin', { action: 'support_status', ticket_id: 1, status: 'bogus' }); assert.equal(r.status, 400);
r = await call(admin, 'tok-admin', { action: 'support_status', ticket_id: 1, status: 'open' }); assert.equal(db.support_tickets[0].status, 'open');

// Email failure does not lose the ticket
const failing: typeof fetch = async (i: any, init: any) => (new URL(String(i)).hostname === 'api.brevo.com' ? new Response('nope', { status: 401 }) : fake(i, init));
const req = new Request('https://db.test/x', { method: 'POST', headers: { 'Content-Type': 'application/json', authorization: 'Bearer tok-other' }, body: JSON.stringify({ ...good, subject: 'Email down' }) });
const res = await support.handler(req, env, failing);
assert.equal(res.status, 200); assert.ok(db.support_tickets.some((t) => t.subject === 'Email down'));

console.log(`All support checks passed (${db.support_tickets.length} tickets, ${db.support_replies.length} replies, ${emails.length} emails).`);
