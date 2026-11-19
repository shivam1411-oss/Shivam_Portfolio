import { useMemo, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { Choice, Playground, btn } from '../ui';

// Playgrounds for the "Cloudflare & Web Security" course. Every value shown comes from shivam-soni.com itself
// (DNS answers, response headers, robots.txt, the send-resume limits), checked when the course was written.

const Row = ({ label, children }) => (
  <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2 border-b border-line last:border-0 text-sm">
    <span className="text-subtle font-semibold">{label}</span>
    <span className="text-fg">{children}</span>
  </div>
);
const Mono = ({ children }) => <span className="font-mono text-[0.85em]">{children}</span>;
const Verdict = ({ ok, children }) => (
  <span className={`inline-flex items-center gap-1 font-bold ${ok ? 'text-accent' : 'text-[#e5484d]'}`}>
    {ok ? <Check size={14} /> : <X size={14} />} {children}
  </span>
);

// ---------------------------------------------------------------- a visit, with and without the proxy

const JOURNEY = [
  { id: 'dns', label: '1. Look up the address' },
  { id: 'connect', label: '2. Connect securely' },
  { id: 'check', label: '3. Check the visitor' },
  { id: 'fetch', label: '4. Fetch the page' },
  { id: 'reply', label: '5. Send it back' },
];

/** The five stages of a visit to shivam-soni.com, with Cloudflare's proxy on (as it is) or off. */
export function VisitJourney() {
  const [proxy, setProxy] = useState('on');
  const [stage, setStage] = useState('dns');
  const on = proxy === 'on';
  const detail = {
    dns: on
      ? ['The browser asks DNS for shivam-soni.com. Cloudflare\'s nameservers answer with Cloudflare\'s own addresses.', 'A  104.21.18.99\nA  172.67.181.144']
      : ['DNS answers with GitHub Pages\' addresses directly. Anyone can see exactly where the site is hosted.', 'A  185.199.108.153\nA  185.199.109.153\n…'],
    connect: on
      ? ['The browser opens an HTTPS connection to Cloudflare. Cloudflare holds the certificate and turns http:// and www. into https://shivam-soni.com/.', 'http://shivam-soni.com  → 301 https://shivam-soni.com/']
      : ['The browser connects straight to GitHub. HTTPS still works, but there is nothing in between to redirect, filter or cache.', 'TLS handled by GitHub Pages'],
    check: on
      ? ['Cloudflare checks who is asking before anything reaches GitHub: known AI training crawlers are turned away here.', 'User-Agent: GPTBot  → 403 Forbidden']
      : ['No checkpoint. Every request, from any bot, reaches GitHub Pages and gets the page.', 'User-Agent: GPTBot  → 200 OK'],
    fetch: on
      ? ['Files Cloudflare already holds are served from a data centre near the visitor. Others are fetched from GitHub Pages, the "origin".', 'JS file: cf-cache-status: HIT\nPage:    cf-cache-status: DYNAMIC']
      : ['Every request travels to GitHub\'s servers, wherever the visitor is.', 'x-github-request-id: …'],
    reply: on
      ? ['The answer goes back through Cloudflare, which adds its own headers.', 'server: cloudflare\ncf-ray: a5cf…-MRS']
      : ['GitHub answers directly.', 'server: GitHub.com'],
  }[stage];

  return (
    <Playground title="Follow one visit to shivam-soni.com" hint="Click each stage. Then switch the proxy off to see what Cloudflare adds.">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-xs font-semibold text-muted">Cloudflare proxy</span>
        <Choice label="Cloudflare proxy" value={proxy} onChange={setProxy} options={[{ value: 'on', label: 'On (orange cloud)' }, { value: 'off', label: 'Off (DNS only)' }]} />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {JOURNEY.map((s) => (
          <button key={s.id} type="button" onClick={() => setStage(s.id)} className={`${btn} ${stage === s.id ? 'border-accent/60 text-fg bg-accent/10' : ''}`}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-surface-2 border border-line p-4">
        <p className="text-sm text-fg leading-relaxed">{detail[0]}</p>
        <pre className="mt-3 font-mono text-xs text-accent whitespace-pre-wrap">{detail[1]}</pre>
      </div>
      <p className="mt-3 text-xs text-subtle">Path: Visitor → {on ? 'Cloudflare (edge) → ' : ''}GitHub Pages</p>
    </Playground>
  );
}

// ---------------------------------------------------------------- reading response headers

const REQUESTS = {
  page: {
    label: 'The home page',
    line: 'GET https://shivam-soni.com/  →  200',
    headers: ['server: cloudflare', 'cf-cache-status: DYNAMIC', 'cache-control: max-age=600', 'via: 1.1 varnish', 'x-github-request-id: 74B0:…'],
    notes: ['DYNAMIC: Cloudflare does not keep HTML pages by default, so it asked GitHub Pages (the origin) for this one.', 'via and x-github-request-id show GitHub\'s own servers answered behind Cloudflare.'],
  },
  asset: {
    label: 'A JavaScript file',
    line: 'GET https://shivam-soni.com/assets/main-….js  →  200',
    headers: ['server: cloudflare', 'cf-cache-status: HIT', 'cache-control: max-age=14400', 'age: 381'],
    notes: ['HIT: served from Cloudflare\'s copy, without asking GitHub.', 'age: the copy is 381 seconds old. Safe, because a changed file gets a new name (main-….js) at every build.'],
  },
  robots: {
    label: 'robots.txt',
    line: 'GET https://shivam-soni.com/robots.txt  →  200',
    headers: ['server: cloudflare', 'content-type: text/plain; charset=utf-8', 'cf-cache-status: MISS'],
    notes: ['MISS: Cloudflare may keep this file, but did not have it yet, so it fetched it from GitHub. The next request is likely a HIT.'],
  },
  http: {
    label: 'http:// (no s)',
    line: 'GET http://shivam-soni.com/  →  301',
    headers: ['location: https://shivam-soni.com/', 'server: cloudflare'],
    notes: ['301 Moved Permanently: Cloudflare sends every plain-http visit to the encrypted https:// address before anything else happens.'],
  },
  www: {
    label: 'www.',
    line: 'GET https://www.shivam-soni.com/  →  301',
    headers: ['location: https://shivam-soni.com/', 'server: cloudflare'],
    notes: ['One address for everyone: www. is redirected to the bare domain, so links and search results all point to the same place.'],
  },
};

/** Real response headers from shivam-soni.com, with what each one means. */
export function HeaderReader() {
  const [pick, setPick] = useState('page');
  const r = REQUESTS[pick];
  return (
    <Playground title="Read what Cloudflare sends back" hint="Each request below was made to the live site. Pick one and read its headers.">
      <Choice label="Request" value={pick} onChange={setPick} options={Object.entries(REQUESTS).map(([value, x]) => ({ value, label: x.label }))} />
      <div className="mt-4 rounded-xl bg-surface-2 border border-line p-4 font-mono text-xs">
        <div className="text-fg font-bold">{r.line}</div>
        {r.headers.map((h) => (
          <div key={h} className={h.startsWith('cf-cache') || h.startsWith('location') ? 'text-accent' : 'text-muted'}>
            {h}
          </div>
        ))}
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-muted list-disc pl-5 marker:text-accent">
        {r.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </Playground>
  );
}

// ---------------------------------------------------------------- robots.txt, read the way a crawler reads it

// The site's robots.txt, shortened: the real file lists more training crawlers in the second group.
const ROBOTS_GROUPS = [
  { agents: ['*'], rules: ['Content-Signal: search=yes, ai-input=yes, ai-train=no', 'Allow: /'], allow: true },
  { agents: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'Bytespider', 'Meta-ExternalAgent', 'Applebot-Extended'], rules: ['Disallow: /'], allow: false },
];
const CRAWLERS = [
  ['Googlebot', 'Google Search'],
  ['Bingbot', 'Bing search'],
  ['OAI-SearchBot', 'ChatGPT search answers'],
  ['GPTBot', 'OpenAI model training'],
  ['ClaudeBot', 'Anthropic model training'],
  ['Google-Extended', 'Gemini training (a token, not a separate crawler)'],
  ['CCBot', 'Common Crawl dataset'],
];

/** Find the group a crawler obeys: the one naming it, otherwise the * group. */
export function robotsVerdict(agent) {
  const named = ROBOTS_GROUPS.find((g) => g.agents.some((a) => a.toLowerCase() === agent.toLowerCase()));
  return { group: named || ROBOTS_GROUPS[0], named: Boolean(named) };
}

export function RobotsChecker() {
  const [agent, setAgent] = useState('GPTBot');
  const { group, named } = robotsVerdict(agent);
  return (
    <Playground title="Which rules does each crawler follow?" hint="A crawler obeys the one group that names it; if none does, it obeys the * group.">
      <Choice label="Crawler" value={agent} onChange={setAgent} options={CRAWLERS.map(([a]) => a)} />
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <pre className="rounded-xl bg-surface-2 border border-line p-4 font-mono text-xs leading-relaxed overflow-x-auto">
          {ROBOTS_GROUPS.map((g, i) => (
            <span key={i} className={g === group ? 'text-accent' : 'text-subtle'}>
              {g.agents.map((a) => `User-agent: ${a}\n`).join('')}
              {g.rules.join('\n')}
              {i < ROBOTS_GROUPS.length - 1 ? '\n\n' : ''}
            </span>
          ))}
        </pre>
        <div className="rounded-xl border border-line p-4 text-sm">
          <Row label="Crawler">
            <Mono>{agent}</Mono>
          </Row>
          <Row label="Used for">{CRAWLERS.find(([a]) => a === agent)[1]}</Row>
          <Row label="Group it reads">{named ? 'Its own name is listed' : 'No group names it, so the * group'}</Row>
          <Row label="Verdict">
            <Verdict ok={group.allow}>{group.allow ? 'May read the site' : 'Asked to stay out'}</Verdict>
          </Row>
        </div>
      </div>
    </Playground>
  );
}

// ---------------------------------------------------------------- category blocking vs crawler-by-crawler

const BOTS = [
  { name: 'Googlebot', job: 'Search', training: true, want: true },
  { name: 'BingBot', job: 'Search', training: true, want: true },
  { name: 'Applebot', job: 'Search (Siri, Spotlight)', training: true, want: true },
  { name: 'PetalBot', job: 'Search (Huawei)', training: true, want: true },
  { name: 'OAI-SearchBot', job: 'AI search answers', training: false, want: true },
  { name: 'GPTBot', job: 'AI training', training: true, want: false, listed: true },
  { name: 'ClaudeBot', job: 'AI training', training: true, want: false, listed: true },
  { name: 'CCBot', job: 'AI training', training: true, want: false, listed: true },
  { name: 'Bytespider', job: 'AI training', training: true, want: false, listed: true },
];

/** What Cloudflare does to each crawler under the two ways of blocking AI training. */
export function CrawlerGate() {
  const [policy, setPolicy] = useState('category');
  const rows = BOTS.map((b) => {
    const blocked = policy === 'category' ? b.training : Boolean(b.listed);
    return { ...b, blocked, right: blocked !== b.want };
  });
  const wrong = rows.filter((r) => !r.right);
  return (
    <Playground title="Block AI training without blocking search" hint="Cloudflare files crawlers into categories. Some search engines also train AI with what they crawl, so they sit in the Training category too.">
      <Choice
        label="Policy"
        value={policy}
        onChange={setPolicy}
        options={[
          { value: 'category', label: 'Block the Training category' },
          { value: 'each', label: 'Block crawler by crawler' },
        ]}
      />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-subtle">
              <th className="py-2 pr-3 font-semibold">Crawler</th>
              <th className="py-2 pr-3 font-semibold">What it does</th>
              <th className="py-2 pr-3 font-semibold">Gets</th>
              <th className="py-2 font-semibold">Is that what we want?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-line">
                <td className="py-2 pr-3 font-mono text-xs text-fg">{r.name}</td>
                <td className="py-2 pr-3 text-muted">{r.job}</td>
                <td className="py-2 pr-3 font-mono text-xs">{r.blocked ? '403' : '200'}</td>
                <td className="py-2">
                  <Verdict ok={r.right}>{r.right ? 'Yes' : r.want ? 'No: search loses the site' : 'No: still copied'}</Verdict>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm font-semibold text-fg">
        {wrong.length ? `${wrong.length} crawlers handled wrongly, including ${wrong.map((r) => r.name).join(', ')}.` : 'Every crawler handled as intended.'}
      </p>
    </Playground>
  );
}

// ---------------------------------------------------------------- what may ship in the website

const ITEMS = [
  { text: 'Supabase project URL', server: false, why: 'An address, not a password. The website must know where to send requests.' },
  { text: 'Supabase publishable (anon) key', server: false, why: 'Made to be public. What it can read is limited by row-level security in the database.' },
  { text: 'Supabase secret (service role) key', server: true, why: 'Skips row-level security entirely. Only Edge Functions and the deploy job hold it.' },
  { text: 'Brevo API key (xkeysib-…)', server: true, why: 'Sends email as shivam-soni.com. It lives only in the Edge Function secrets.' },
  { text: 'Razorpay key_id (rzp_…)', server: false, why: 'Identifies the account to the checkout window. Useless without the secret.' },
  { text: 'Razorpay key secret', server: true, why: 'Signs and checks payments. If it leaked, payments could be faked.' },
  { text: 'Anthropic API key', server: true, why: 'Spends money on every message. It lives in the chat Worker as a Wrangler secret.' },
  { text: 'Chat Worker URL', server: false, why: 'Public on purpose. The Worker checks the Origin and rate-limits each visitor.' },
];

/** Sort keys and settings into "fine in the website" and "server only". */
export function SecretSorter() {
  const [answers, setAnswers] = useState({});
  const score = ITEMS.filter((it) => answers[it.text] !== undefined && answers[it.text] === it.server).length;
  const done = Object.keys(answers).length;
  return (
    <Playground title="Fine in the website, or server only?" hint="Anything in the website can be read by anyone who opens the browser's developer tools. Decide where each item belongs.">
      <ul className="space-y-2">
        {ITEMS.map((it) => {
          const a = answers[it.text];
          const answered = a !== undefined;
          return (
            <li key={it.text} className="rounded-xl border border-line p-3">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <span className="text-sm font-semibold text-fg">{it.text}</span>
                <span className="flex gap-1">
                  {[
                    [false, 'In the website'],
                    [true, 'Server only'],
                  ].map(([v, label]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setAnswers((s) => ({ ...s, [it.text]: v }))}
                      className={`${btn} text-xs ${a === v ? 'border-accent/60 bg-accent/10 text-fg' : ''}`}
                    >
                      {label}
                    </button>
                  ))}
                </span>
              </div>
              {answered && (
                <p className="mt-2 text-xs leading-relaxed">
                  <Verdict ok={a === it.server}>{a === it.server ? 'Right.' : `Not quite: ${it.server ? 'server only' : 'fine in the website'}.`}</Verdict>{' '}
                  <span className="text-muted">{it.why}</span>
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-fg">
          {score} of {ITEMS.length} right{done < ITEMS.length ? ` (${ITEMS.length - done} to go)` : ''}
        </span>
        <button type="button" className={btn} onClick={() => setAnswers({})}>
          <RotateCcw size={14} /> Start again
        </button>
      </div>
    </Playground>
  );
}

// ---------------------------------------------------------------- the resume form's guards

export const LIMITS = { perEmailDay: 3, perIpHour: 10, totalDay: 250 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** The send-resume function's checks, in the same order, on a pretend request. */
export function guard(state, req) {
  if (String(req.company || '').trim()) return { status: 200, body: '{ "ok": true }', why: 'The hidden "company" field was filled in, so it is a bot. It gets a fake success and no email is sent.', sent: false };
  if (String(req.name || '').trim().length < 2) return { status: 400, body: 'Please enter your name.', why: 'Rejected before anything else happens.', sent: false };
  if (!EMAIL.test(req.email || '')) return { status: 400, body: 'Please enter a valid email address.', why: 'The address does not look like name@domain.tld.', sent: false };
  const byEmail = state.log.filter((l) => l.email === req.email).length;
  const byIp = state.log.filter((l) => l.ip === req.ip).length;
  if (byEmail >= LIMITS.perEmailDay || byIp >= LIMITS.perIpHour || state.log.length >= LIMITS.totalDay) {
    const which = byEmail >= LIMITS.perEmailDay ? `this email already had ${LIMITS.perEmailDay} today` : `this IP already sent ${LIMITS.perIpHour} this hour`;
    return { status: 429, body: 'Too many requests. Please try again later…', why: `Limit reached: ${which}.`, sent: false };
  }
  return { status: 200, body: '{ "ok": true }', why: 'Every check passed: Brevo sends the PDF and the request is recorded (as hashes) for the limits.', sent: true };
}

const ACTIONS = [
  { id: 'visitor', label: 'Recruiter sends', req: () => ({ name: 'Asha', email: 'asha@acme.in', ip: '49.36.1.10', company: '' }) },
  { id: 'again', label: 'Same email again', req: () => ({ name: 'Asha', email: 'asha@acme.in', ip: '49.36.1.10', company: '' }) },
  { id: 'bot', label: 'Bot fills every field', req: () => ({ name: 'Bot', email: 'spam@bots.io', ip: '203.0.113.7', company: 'Acme Ltd' }) },
  { id: 'typo', label: 'Email typo', req: () => ({ name: 'Ravi', email: 'ravi@gmail', ip: '49.36.1.11', company: '' }) },
  { id: 'flood', label: 'Flood: 12 different emails, one IP', req: null },
];

export function FormGuard() {
  const [state, setState] = useState({ log: [], results: [] });
  const send = (action) => {
    setState((s) => {
      const reqs = action.req ? [action.req()] : Array.from({ length: 12 }, (_, i) => ({ name: 'Flood', email: `x${i}@flood.test`, ip: '198.51.100.9', company: '' }));
      let next = s;
      for (const req of reqs) {
        const r = guard(next, req);
        next = {
          log: r.sent ? [...next.log, { email: req.email, ip: req.ip }] : next.log,
          results: [{ ...r, label: action.label, email: req.email, n: next.results.length + 1 }, ...next.results].slice(0, 30),
        };
      }
      return next;
    });
  };
  const sentFlood = useMemo(() => state.log.filter((l) => l.ip === '198.51.100.9').length, [state.log]);
  return (
    <Playground title="Try to abuse the resume form" hint={`The real limits: ${LIMITS.perEmailDay} per email address a day, ${LIMITS.perIpHour} per IP address an hour, ${LIMITS.totalDay} in total a day.`}>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button key={a.id} type="button" className={btn} onClick={() => send(a)}>
            {a.label}
          </button>
        ))}
        <button type="button" className={btn} onClick={() => setState({ log: [], results: [] })}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>
      <div className="mt-3 text-xs text-muted">
        Emails actually sent: <b className="text-fg">{state.log.length}</b> · from the flooding IP: <b className="text-fg">{sentFlood}</b>
      </div>
      <ul className="mt-3 space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {state.results.length === 0 && <li className="text-sm text-subtle">Press a button to send a request.</li>}
        {state.results.map((r) => (
          <li key={r.n} className="rounded-lg border border-line px-3 py-2 text-xs">
            <span className={`font-mono font-bold ${r.status === 200 ? 'text-accent' : 'text-[#e5484d]'}`}>{r.status}</span> <span className="text-fg font-semibold">{r.label}</span>{' '}
            <span className="font-mono text-subtle">{r.email}</span>
            <div className="text-muted mt-0.5">{r.why}</div>
          </li>
        ))}
      </ul>
    </Playground>
  );
}
