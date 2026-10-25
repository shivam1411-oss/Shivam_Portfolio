import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../theme/ThemeProvider';
import { ease } from '../../components/motion';
import { Choice, Playground, Slider, btn } from '../ui';

/** Click through a chain of steps; each shows what happens at that stage. Reused by several lessons. */
export function Steps({ title, hint, steps }) {
  const [active, setActive] = useState(0);
  const step = steps[active];
  return (
    <Playground title={title} hint={hint}>
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {steps.map((s, i) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActive(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                i === active ? 'bg-accent text-bg border-accent' : i < active ? 'border-accent/40 text-accent' : 'border-line text-muted hover:text-fg'
              }`}
            >
              {i + 1}. {s.label}
            </button>
            {i < steps.length - 1 && <ChevronRight size={14} className="text-subtle" />}
          </span>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25, ease }}
          className="rounded-xl bg-surface-2 border border-line p-4"
        >
          <div className="font-extrabold text-fg mb-1">{step.label}</div>
          <p className="text-sm text-muted leading-relaxed">{step.body}</p>
          {step.code && <pre className="mt-3 p-3 rounded-lg bg-[#0d1014] text-[#d6f5f0] font-mono text-[12px] overflow-x-auto">{step.code}</pre>}
        </motion.div>
      </AnimatePresence>
      <div className="mt-4 flex gap-2">
        <button type="button" className={btn} disabled={active === 0} onClick={() => setActive((a) => a - 1)}>
          Back
        </button>
        <button type="button" className={btn} disabled={active === steps.length - 1} onClick={() => setActive((a) => a + 1)}>
          Next step <ChevronRight size={14} />
        </button>
      </div>
    </Playground>
  );
}

const TREE = {
  name: 'App',
  file: 'src/App.jsx',
  does: 'The root. Shows the welcome screen first, then loads and shows the Site. Also draws the code trail that follows your cursor.',
  children: [
    { name: 'CodeTrail', file: 'src/components/CodeTrail.jsx', does: 'A full-screen canvas that sheds flickering code tokens behind the cursor or finger.' },
    { name: 'Intro', file: 'src/components/Intro.jsx', does: 'The welcome screen: falling code matrix, decoding name, and the portal that opens into the site.' },
    {
      name: 'Site',
      file: 'src/Site.jsx',
      does: 'The portfolio itself. Holds two pieces of state (is the contact pop-up open? is the resume pop-up open?) and passes "open" and "close" functions down as props.',
      children: [
        { name: 'CursorReveal', file: 'src/components/CursorReveal.jsx', does: 'The hidden code matrix that "water droplets" reveal wherever the cursor moves.' },
        { name: 'Navbar', file: 'src/components/Navbar.jsx', does: 'Top bar with section links, theme toggle, and Resume / Connect buttons. Receives onConnect and onResume props.' },
        { name: 'Hero', file: 'src/components/Hero.jsx', does: 'The first screen: headline, photo with spinning ring, and the three proof cards.' },
        { name: 'Marquee', file: 'src/components/Marquee.jsx', does: 'The endlessly scrolling strip of skills.' },
        { name: 'Metrics', file: 'src/components/Metrics.jsx', does: '"Impact by the numbers": before/after result cards with bars, read from src/data/impact.js.' },
        { name: 'Experience', file: 'src/components/Experience.jsx', does: 'The career timeline, read from the experience list in src/data/content.js.' },
        { name: 'Lab', file: 'src/components/Lab.jsx', does: 'The Analytical Lab: pick a method, see its formula, drag sliders on a live calculator, reveal the SQL.' },
        { name: 'Footer', file: 'src/components/Footer.jsx', does: 'Bottom of the page with links, copyright and back-to-top.' },
        { name: 'ContactModal', file: 'src/components/ContactModal.jsx', does: 'The "Let\'s Connect" pop-up with masked phone numbers.' },
        { name: 'ResumeModal', file: 'src/components/ResumeModal.jsx', does: 'Previews the resume PDF and emails it via EmailJS.' },
        { name: 'ChatWidget', file: 'src/components/ChatWidget.jsx', does: '"Ask my AI": the chat bubble. Only appears when the Worker address is configured.' },
      ],
    },
  ],
};

function TreeNode({ node, depth, selected, onSelect }) {
  const active = selected.name === node.name;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(node)}
        style={{ marginLeft: depth * 18 }}
        className={`my-0.5 px-2.5 py-1 rounded-lg font-mono text-[13px] transition-colors ${active ? 'bg-accent text-bg font-bold' : 'text-fg hover:bg-surface-2'}`}
      >
        {'<'}
        {node.name}
        {' />'}
      </button>
      {node.children && (
        <ul>
          {node.children.map((c) => (
            <TreeNode key={c.name} node={c} depth={depth + 1} selected={selected} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ComponentTree() {
  const [selected, setSelected] = useState(TREE.children[2]);
  return (
    <Playground title="Explore your site's component tree" hint="Every box on your website is a component. Click one to see which file it lives in and what it does.">
      <div className="grid md:grid-cols-2 gap-5">
        <ul className="max-h-80 overflow-y-auto pr-2">
          <TreeNode node={TREE} depth={0} selected={selected} onSelect={setSelected} />
        </ul>
        <div className="rounded-xl bg-surface-2 border border-line p-4 self-start md:sticky md:top-0">
          <div className="font-mono text-accent font-bold">{`<${selected.name} />`}</div>
          <div className="mt-1 font-mono text-[11px] text-subtle">{selected.file}</div>
          <p className="mt-3 text-sm text-muted leading-relaxed">{selected.does}</p>
        </div>
      </div>
    </Playground>
  );
}

/** Mini copy of a Hero proof card, so props can be edited live. */
function ProofCard({ title, body, accent }) {
  return (
    <div className={`p-5 rounded-2xl bg-surface border shadow-soft ${accent ? 'border-accent/50' : 'border-line'}`}>
      <div className={`eyebrow mb-2 ${accent ? 'text-accent' : 'text-subtle'}`}>Proof point</div>
      <div className="font-extrabold text-fg">{title || 'Untitled'}</div>
      <p className="mt-1 text-sm text-muted leading-relaxed">{body}</p>
    </div>
  );
}

export function PropsPlayground() {
  const [title, setTitle] = useState('Automated collections');
  const [body, setBody] = useState('Moved collections from Excel to a CRM-driven model.');
  const [accent, setAccent] = useState(true);
  const input = 'w-full px-3 py-2 rounded-lg bg-surface-2 border border-line text-sm text-fg focus:outline-none focus:border-accent';
  return (
    <Playground title="Change the props, watch the component update" hint="The same component can show different content. You only change its inputs (props).">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-muted">
            title
            <input className={`${input} mt-1`} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block text-xs font-semibold text-muted">
            body
            <textarea className={`${input} mt-1`} rows={2} value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-muted">
            <input type="checkbox" checked={accent} onChange={(e) => setAccent(e.target.checked)} className="accent-[var(--accent)]" /> accent
          </label>
          <pre className="p-3 rounded-lg bg-[#0d1014] text-[#d6f5f0] font-mono text-[12px] whitespace-pre-wrap break-words">
            {`<ProofCard\n  title="${title}"\n  body="${body}"\n  accent={${accent}}\n/>`}
          </pre>
        </div>
        <ProofCard title={title} body={body} accent={accent} />
      </div>
    </Playground>
  );
}

export function StateCalculator() {
  const [values, setValues] = useState({ open: 100, billed: 40, close: 77, current: 43 });
  const renders = useRef(0);
  renders.current += 1;
  const set = (id) => (v) => setValues((all) => ({ ...all, [id]: v }));
  const { open, billed, close, current } = values;
  const denom = open + billed - current;
  const cei = denom > 0 ? Math.max(0, ((open + billed - close) / denom) * 100) : 0;
  const cr = (v) => `₹${v} Cr`;

  return (
    <Playground
      title="State in action: the CEI calculator"
      hint="Each slider calls setValues. React stores the new state, re-runs the component, and the result below is recalculated. Watch the render counter."
    >
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <Slider label="Opening receivables" value={open} min={50} max={200} onChange={set('open')} format={cr} />
          <Slider label="Billed this cycle" value={billed} min={10} max={100} onChange={set('billed')} format={cr} />
          <Slider label="Closing receivables" value={close} min={20} max={200} onChange={set('close')} format={cr} />
          <Slider label="Closing current (not yet due)" value={current} min={0} max={120} onChange={set('current')} format={cr} />
        </div>
        <div className="space-y-3">
          <div className="rounded-xl bg-surface-2 border border-line p-4 text-center">
            <div className="eyebrow text-subtle">Collection efficiency</div>
            <div className="text-4xl font-extrabold text-fg tabular-nums mt-1">{cei.toFixed(1)}%</div>
            <div className="mt-2 text-xs text-muted font-mono">
              ({open} + {billed} − {close}) ÷ ({open} + {billed} − {current}) × 100
            </div>
          </div>
          <pre className="p-3 rounded-lg bg-[#0d1014] text-[#d6f5f0] font-mono text-[12px] overflow-x-auto">
            {`// current state\n${JSON.stringify(values, null, 2)}`}
          </pre>
          <div className="text-xs text-muted">
            This component has rendered <span className="font-mono font-bold text-accent">{renders.current}</span> times.
          </div>
        </div>
      </div>
    </Playground>
  );
}

export function DataToUI() {
  const [entry, setEntry] = useState({
    period: 'June 2023 – May 2026',
    title: 'Manager, Repayments',
    company: 'FPL Technologies (OneCard), Pune',
    point: 'Optimized collection cycles, cutting DSO by 12 days.',
  });
  const set = (k) => (e) => setEntry((x) => ({ ...x, [k]: e.target.value }));
  const input = 'w-full px-3 py-1.5 rounded-lg bg-[#0d1014] border border-white/10 text-[12px] font-mono text-[#fcd28d] focus:outline-none focus:border-[#3fd1bf]';
  return (
    <Playground
      title="Edit the data, not the design"
      hint="On the left is an entry exactly like the ones in src/data/content.js. On the right is how the Experience component draws it. Change the text; the layout never needs touching."
    >
      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-xl bg-[#0d1014] p-4 font-mono text-[12px] text-[#d6f5f0] space-y-2">
          <div>{'{'}</div>
          {Object.keys(entry).map((k) => (
            <label key={k} className="flex items-center gap-2 pl-4">
              <span className="text-[#9196f6] shrink-0">{k === 'point' ? 'points[0]' : k}:</span>
              <input className={input} value={entry[k]} onChange={set(k)} />
            </label>
          ))}
          <div>{'}'}</div>
        </div>
        <div className="relative pl-6 border-l-2 border-accent/40">
          <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-accent" />
          <div className="eyebrow text-accent">{entry.period}</div>
          <div className="mt-1 text-lg font-extrabold text-fg">{entry.title}</div>
          <div className="text-sm font-semibold text-muted">{entry.company}</div>
          <ul className="mt-3 list-disc pl-5 text-sm text-muted marker:text-accent">
            <li>{entry.point}</li>
          </ul>
        </div>
      </div>
    </Playground>
  );
}

const TOKEN_PRESETS = {
  light: { '--bg': '#f7f7f5', '--surface': '#ffffff', '--fg': '#0c0d10', '--muted': '#5b5f68', '--accent': '#0f8a7e', '--accent-2': '#5b61d6' },
  dark: { '--bg': '#0a0b0e', '--surface': '#121419', '--fg': '#ecedef', '--muted': '#a0a4ad', '--accent': '#3fd1bf', '--accent-2': '#9196f6' },
};

export function TokenEditor() {
  const [preset, setPreset] = useState('light');
  const [tokens, setTokens] = useState(TOKEN_PRESETS.light);
  const pick = (p) => {
    setPreset(p);
    setTokens(TOKEN_PRESETS[p]);
  };
  const css = useMemo(() => Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n'), [tokens]);
  return (
    <Playground
      title="Repaint the site by changing six variables"
      hint="The preview uses the same CSS variables as your site. Pick a colour and every element using that variable changes together. That is how one class (.dark) switches the whole theme."
    >
      <div className="mb-4">
        <Choice label="Preset" options={[{ value: 'light', label: ':root (light)' }, { value: 'dark', label: '.dark' }]} value={preset} onChange={pick} />
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          {Object.entries(tokens).map(([k, v]) => (
            <label key={k} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface-2 border border-line">
              <span className="font-mono text-xs text-fg">{k}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-subtle">{v}</span>
                <input type="color" value={v} onChange={(e) => setTokens((t) => ({ ...t, [k]: e.target.value }))} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
              </span>
            </label>
          ))}
        </div>
        <div className="space-y-3">
          <div style={{ background: tokens['--bg'], color: tokens['--fg'] }} className="rounded-2xl p-5 border border-line">
            <div style={{ color: tokens['--accent'] }} className="eyebrow">Impact</div>
            <div className="text-2xl font-extrabold mt-1">
              Collections that run on{' '}
              <span style={{ backgroundImage: `linear-gradient(110deg, ${tokens['--accent']}, ${tokens['--accent-2']})` }} className="bg-clip-text text-transparent">
                strategy
              </span>
            </div>
            <div style={{ background: tokens['--surface'] }} className="mt-4 p-4 rounded-xl shadow-soft">
              <div className="font-bold">CEI 50% → 65%</div>
              <div style={{ color: tokens['--muted'] }} className="text-sm">On the DPD 30–150 buckets.</div>
              <div style={{ background: tokens['--accent'], color: tokens['--bg'] }} className="mt-3 inline-block px-3 py-1.5 rounded-lg text-xs font-bold">
                Let's connect
              </div>
            </div>
          </div>
          <pre className="p-3 rounded-lg bg-[#0d1014] text-[#d6f5f0] font-mono text-[12px] overflow-x-auto">{`${preset === 'dark' ? '.dark' : ':root'} {\n${css}\n}`}</pre>
        </div>
      </div>
    </Playground>
  );
}

/** Walks the same decision the script in index.html makes before the page is drawn. */
export function ThemeDecider() {
  const [saved, setSaved] = useState('none');
  const [os, setOs] = useState('dark');
  const { theme } = useTheme();
  const result = saved !== 'none' ? saved : os;
  const lines = [
    { text: 'var saved = localStorage.getItem("theme");', on: true },
    { text: `// saved is ${saved === 'none' ? 'null (never chosen)' : `"${saved}"`}`, on: true, comment: true },
    { text: 'var dark = saved', on: true },
    { text: '  ? saved === "dark"            // a choice was saved: use it', on: saved !== 'none' },
    { text: '  : matchMedia("(prefers-color-scheme: dark)").matches;  // else follow the device', on: saved === 'none' },
    { text: 'document.documentElement.classList.toggle("dark", dark);', on: true },
  ];
  return (
    <Playground
      title="Which theme will a visitor see?"
      hint="Set what the visitor saved earlier and what their phone or laptop prefers. The highlighted lines are the ones that decide."
    >
      <div className="flex flex-wrap gap-5 mb-4">
        <div>
          <div className="text-xs font-semibold text-muted mb-1.5">Saved in localStorage</div>
          <Choice label="Saved theme" options={[{ value: 'none', label: 'nothing' }, 'light', 'dark']} value={saved} onChange={setSaved} />
        </div>
        <div>
          <div className="text-xs font-semibold text-muted mb-1.5">Device setting</div>
          <Choice label="Device preference" options={['light', 'dark']} value={os} onChange={setOs} />
        </div>
      </div>
      <pre className="p-4 rounded-xl bg-[#0d1014] font-mono text-[12px] overflow-x-auto">
        {lines.map((l, i) => (
          <div key={i} className={`px-2 -mx-2 rounded ${l.on ? (l.comment ? 'text-white/40' : 'text-[#d6f5f0]') : 'text-white/20 line-through'} ${l.on && !l.comment && i >= 3 && i <= 4 ? 'bg-[#3fd1bf]/15' : ''}`}>
            {l.text}
          </div>
        ))}
      </pre>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="text-sm text-fg">
          Result: <span className={`font-extrabold px-2 py-0.5 rounded-md ${result === 'dark' ? 'bg-[#0a0b0e] text-[#3fd1bf]' : 'bg-white text-[#0f8a7e] border border-line'}`}>{result}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          Now try the real toggle (this page is in <b className="text-fg">{theme}</b>): <ThemeToggle />
        </div>
      </div>
    </Playground>
  );
}

const EASINGS = {
  'site ease': [0.22, 1, 0.36, 1],
  linear: 'linear',
  spring: 'spring',
};

export function MotionPlayground() {
  const [duration, setDuration] = useState(0.6);
  const [distance, setDistance] = useState(16);
  const [step, setStep] = useState(0.08);
  const [easing, setEasing] = useState('site ease');
  const [run, setRun] = useState(0);
  const transition = easing === 'spring' ? { type: 'spring', stiffness: 260, damping: 18 } : { duration, ease: EASINGS[easing] };
  const easeText = easing === 'spring' ? "type: 'spring'" : `duration: ${duration}, ease: ${easing === 'linear' ? "'linear'" : 'ease'}`;

  return (
    <Playground title="Tune the entrance animation" hint="This is the fadeUp + stagger pattern used for cards across the site. Change the numbers and press Replay.">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <Slider label="Duration" value={duration} min={0.1} max={2} step={0.1} onChange={setDuration} format={(v) => `${v.toFixed(1)}s`} />
          <Slider label="Start lower by (y)" value={distance} min={0} max={80} onChange={setDistance} format={(v) => `${v}px`} />
          <Slider label="Stagger between cards" value={step} min={0} max={0.4} step={0.02} onChange={setStep} format={(v) => `${v.toFixed(2)}s`} />
          <Choice label="Easing" options={Object.keys(EASINGS)} value={easing} onChange={setEasing} />
          <pre className="p-3 rounded-lg bg-[#0d1014] text-[#d6f5f0] font-mono text-[12px] overflow-x-auto">
            {`const fadeUp = {\n  hidden: { opacity: 0, y: ${distance} },\n  show: { opacity: 1, y: 0,\n    transition: { ${easeText} } },\n};\n// parent: staggerChildren: ${step}`}
          </pre>
        </div>
        <div>
          <button type="button" className={`${btn} mb-3`} onClick={() => setRun((r) => r + 1)}>
            <RotateCcw size={14} /> Replay
          </button>
          <motion.div key={run} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: step } } }} className="grid grid-cols-2 gap-3">
            {['CEI', 'Roll rate', 'DSO', 'Slippage'].map((t) => (
              <motion.div
                key={t}
                variants={{ hidden: { opacity: 0, y: distance }, show: { opacity: 1, y: 0, transition } }}
                className="p-4 rounded-xl bg-surface-2 border border-line font-bold text-fg"
              >
                {t}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </Playground>
  );
}
