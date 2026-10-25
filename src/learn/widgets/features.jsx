import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ban, Bot, Globe, KeyRound, Monitor, Server } from 'lucide-react';
import { Playground, Slider, btn } from '../ui';

const pct = (v) => `${(v * 100).toFixed(1)}%`;

/** Bell curve with the ±1.96 cut-offs and where this test's z lands. */
function BellCurve({ z }) {
  const W = 320;
  const H = 110;
  const x = (v) => ((v + 4) / 8) * W;
  const y = (v) => H - 10 - Math.exp((-v * v) / 2) * (H - 25);
  const pts = Array.from({ length: 81 }, (_, i) => -4 + i * 0.1);
  const path = pts.map((v, i) => `${i ? 'L' : 'M'}${x(v).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const tail = (from, to) => {
    const seg = pts.filter((v) => v >= from && v <= to);
    return `M${x(from)},${H - 10} ${seg.map((v) => `L${x(v).toFixed(1)},${y(v).toFixed(1)}`).join(' ')} L${x(to)},${H - 10} Z`;
  };
  const zc = Math.max(-4, Math.min(4, z));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Normal curve with z = ${z.toFixed(2)}`}>
      <path d={tail(-4, -1.96)} fill="var(--accent)" opacity="0.2" />
      <path d={tail(1.96, 4)} fill="var(--accent)" opacity="0.2" />
      <path d={path} fill="none" stroke="var(--subtle)" strokeWidth="1.5" />
      <line x1="0" x2={W} y1={H - 10} y2={H - 10} stroke="var(--line-strong)" />
      {[-1.96, 1.96].map((v) => (
        <text key={v} x={x(v)} y={H} textAnchor="middle" fontSize="9" fill="var(--subtle)">
          {v}
        </text>
      ))}
      <line x1={x(zc)} x2={x(zc)} y1="8" y2={H - 10} stroke="var(--accent)" strokeWidth="2.5" />
      <text x={x(zc)} y="8" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--accent)">
        z = {z.toFixed(2)}
      </text>
    </svg>
  );
}

export function ZTestStepper() {
  const [n1, setN1] = useState(5000);
  const [c1, setC1] = useState(1500);
  const [n2, setN2] = useState(5000);
  const [c2, setC2] = useState(1650);
  const cured1 = Math.min(c1, n1);
  const cured2 = Math.min(c2, n2);
  const p1 = cured1 / n1;
  const p2 = cured2 / n2;
  const pooled = (cured1 + cured2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  const z = se ? (p2 - p1) / se : 0;
  const lift = p1 ? ((p2 - p1) / p1) * 100 : 0;
  const significant = Math.abs(z) >= 1.96;
  const steps = [
    ['Champion cure rate p₁', `${cured1} ÷ ${n1}`, pct(p1)],
    ['Challenger cure rate p₂', `${cured2} ÷ ${n2}`, pct(p2)],
    ['Pooled rate p', `(${cured1} + ${cured2}) ÷ (${n1} + ${n2})`, pct(pooled)],
    ['Standard error', '√( p(1−p) × (1/n₁ + 1/n₂) )', se.toFixed(4)],
    ['z score', '(p₂ − p₁) ÷ standard error', z.toFixed(2)],
    ['Lift', '(p₂ − p₁) ÷ p₁', `${lift >= 0 ? '+' : ''}${lift.toFixed(1)}%`],
  ];
  const count = (v) => v.toLocaleString('en-IN');
  return (
    <Playground
      title="Is the challenger really better?"
      hint="This is the exact maths behind the Lab's champion-challenger calculator. Try a small group (500 accounts) with the same cure rates: the lift stays the same but stops being significant."
    >
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <Slider label="Champion accounts" value={n1} min={500} max={20000} step={100} onChange={setN1} format={count} />
          <Slider label="Champion cured" value={c1} min={0} max={20000} step={10} onChange={setC1} format={count} />
          <Slider label="Challenger accounts" value={n2} min={500} max={20000} step={100} onChange={setN2} format={count} />
          <Slider label="Challenger cured" value={c2} min={0} max={20000} step={10} onChange={setC2} format={count} />
          <BellCurve z={z} />
        </div>
        <div>
          <ol className="space-y-2">
            {steps.map(([label, how, value], i) => (
              <li key={label} className="flex items-start gap-3 p-3 rounded-xl bg-surface-2 border border-line">
                <span className="w-6 h-6 shrink-0 rounded-md bg-accent/15 text-accent text-xs font-extrabold flex items-center justify-center">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-fg">{label}</span>
                  <span className="block text-[11px] font-mono text-subtle break-words">{how}</span>
                </span>
                <span className="font-mono text-sm font-bold text-fg tabular-nums">{value}</span>
              </li>
            ))}
          </ol>
          <div className={`mt-3 p-3 rounded-xl text-sm font-bold ${significant && lift > 0 ? 'bg-accent/15 text-accent' : 'bg-amber-400/15 text-amber-600 dark:text-amber-300'}`}>
            {significant ? (lift > 0 ? '|z| ≥ 1.96 → significant at 95%: scale the challenger' : '|z| ≥ 1.96 → significant at 95%: keep the champion') : '|z| < 1.96 → could be luck: keep testing'}
          </div>
        </div>
      </div>
    </Playground>
  );
}

/** Keep the country code and the last three digits, hide the rest. */
const maskPhone = (raw) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 6) return '—';
  const cc = digits.slice(0, digits.length - 10) || '91';
  const last = digits.slice(-3);
  return `+${cc} ••••• ••${last}`;
};

export function MaskPhone() {
  const [raw, setRaw] = useState('+91 98765 43456');
  const digits = raw.replace(/\D/g, '');
  return (
    <Playground
      title="Masking a phone number"
      hint="The pop-up shows a masked number to stop scrapers collecting it, but the link behind it still holds the full number so tapping it opens WhatsApp or the dialler."
    >
      <label className="block text-xs font-semibold text-muted max-w-sm">
        Phone number
        <input
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-2 border border-line text-sm font-mono text-fg focus:outline-none focus:border-accent"
        />
      </label>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-surface-2 border border-line">
          <div className="eyebrow text-subtle mb-1">What visitors read (value)</div>
          <div className="font-mono font-bold text-fg">{maskPhone(raw)}</div>
        </div>
        <div className="p-4 rounded-xl bg-surface-2 border border-line">
          <div className="eyebrow text-subtle mb-1">Where the tap goes (href)</div>
          <div className="font-mono text-xs text-fg break-all">https://wa.me/{digits || '…'}</div>
          <div className="font-mono text-xs text-fg break-all">tel:+{digits || '…'}</div>
        </div>
      </div>
      <p className="mt-3 text-xs text-subtle">
        In your site the masked text is simply typed into src/data/content.js; this demo builds it with a small function so you can see the idea.
      </p>
    </Playground>
  );
}

const NODES = [
  { id: 'browser', label: 'Visitor\'s browser', sub: 'ChatWidget.jsx', Icon: Monitor },
  { id: 'worker', label: 'Cloudflare Worker', sub: 'chat-worker/src/index.ts', Icon: Server },
  { id: 'claude', label: 'Claude API', sub: 'Anthropic', Icon: Bot },
];

const SCENARIOS = {
  normal: {
    label: 'Ask a question',
    reach: 'claude',
    log: [
      ['browser', 'POST { messages: [{ role: "user", content: "How can I reduce DSO?" }] }'],
      ['worker', 'Origin https://shivam1411-oss.github.io is on the allow-list ✓'],
      ['worker', 'Rate limit for this IP: 3 of 10 this minute ✓'],
      ['worker', 'Conversation is well formed (alternating, ≤ 20 messages, ≤ 2000 chars) ✓'],
      ['worker', 'Calls Claude with the secret ANTHROPIC_API_KEY (never sent to the browser)'],
      ['claude', 'Streams the answer back word by word'],
      ['browser', 'Words appear in the chat bubble as they arrive'],
    ],
  },
  origin: {
    label: 'Call it from another website',
    reach: 'worker',
    blocked: true,
    log: [
      ['browser', 'POST from https://some-other-site.com'],
      ['worker', 'Origin not on the allow-list → 403 Forbidden. Claude is never called, so it costs nothing.'],
    ],
  },
  spam: {
    label: 'Send 11 messages in a minute',
    reach: 'worker',
    blocked: true,
    log: [
      ['browser', 'Message #11 within 60 seconds'],
      ['worker', 'Rate limit exceeded → 429 "Too many messages. Please wait a minute and try again."'],
    ],
  },
  leak: {
    label: 'What if the key were in the site?',
    reach: 'claude',
    leak: true,
    log: [
      ['browser', 'const key = "sk-ant-…"   // shipped inside the JavaScript bundle'],
      ['browser', 'Anyone can press F12, open the bundle and copy the key'],
      ['claude', 'They can now run any amount of requests on your bill. This is why the Worker exists.'],
    ],
  },
};

export function ChatFlow() {
  const [scenario, setScenario] = useState('normal');
  const [run, setRun] = useState(0);
  const s = SCENARIOS[scenario];
  const reachIndex = NODES.findIndex((n) => n.id === s.reach);
  const play = (key) => {
    setScenario(key);
    setRun((r) => r + 1);
  };
  return (
    <Playground title="Follow one chat message" hint="Pick a scenario to watch where the request goes and what the Worker checks before spending money on Claude.">
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(SCENARIOS).map(([key, v]) => (
          <button key={key} type="button" onClick={() => play(key)} className={`${btn} ${scenario === key ? '!border-accent !text-accent' : ''}`}>
            {v.leak ? <KeyRound size={14} /> : v.blocked ? <Ban size={14} /> : <Globe size={14} />} {v.label}
          </button>
        ))}
      </div>

      <div className="relative grid grid-cols-3 gap-2 sm:gap-6 items-center">
        {NODES.map((n, i) => {
          const { Icon } = n;
          const lit = i <= reachIndex;
          const danger = s.leak && n.id !== 'worker';
          return (
            <div
              key={n.id}
              className={`relative z-10 rounded-xl border p-3 text-center transition-colors ${
                s.leak && n.id === 'worker' ? 'opacity-30 border-line' : lit ? (danger ? 'border-amber-400/60 bg-amber-400/10' : 'border-accent/50 bg-accent/10') : 'border-line'
              }`}
            >
              <Icon size={20} className={`mx-auto ${lit ? 'text-accent' : 'text-subtle'}`} />
              <div className="mt-1 text-xs font-bold text-fg">{n.label}</div>
              <div className="text-[10px] font-mono text-subtle break-all">{n.sub}</div>
            </div>
          );
        })}
        <motion.span
          key={`${scenario}-${run}`}
          className={`absolute top-1/2 -mt-1.5 w-3 h-3 rounded-full ${s.blocked ? 'bg-amber-400' : 'bg-accent'} shadow-[0_0_12px_var(--accent)]`}
          initial={{ left: '12%' }}
          animate={{ left: `${12 + reachIndex * 38}%` }}
          transition={{ duration: 0.9 * Math.max(reachIndex, 0.5), ease: 'easeInOut' }}
        />
      </div>

      <div className="mt-5 rounded-xl bg-[#0d1014] p-4 font-mono text-[12px] space-y-1.5 min-h-[9rem]">
        <AnimatePresence mode="popLayout">
          {s.log.map(([who, text], i) => (
            <motion.div
              key={`${scenario}-${run}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.35 }}
              className="flex gap-2"
            >
              <span className="shrink-0 text-[#9196f6]">[{who}]</span>
              <span className={/403|429|bill|copy/.test(text) ? 'text-amber-300' : 'text-[#d6f5f0]'}>{text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Playground>
  );
}
