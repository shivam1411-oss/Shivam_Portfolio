import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ArrowRight, BookOpen, Boxes, Code2, Database, Layers, Palette, Rocket, Sparkles, SquareTerminal } from 'lucide-react';
import { ease } from '../components/motion';
import { courseById, courses } from './courses';
import { timeline } from './timeline';
import { btn, btnPrimary } from './ui';

// Landing page of the Learning Lab: the portfolio drawn as an "exploded view" of its real layers.
// Move the pointer to tilt the stack; pick a layer to see what it does and which lesson teaches it.

const site = courseById.site;
const lessonTitle = (id) => site.lessons.find((l) => l.id === id)?.title;

// Bottom to top, the way the site is actually built.
const LAYERS = [
  {
    id: 'data',
    cta: 'How the data layer works',
    name: 'Data',
    Icon: Database,
    what: 'Your career, results, contacts and Lab formulas live in plain JavaScript files, not inside the layout.',
    file: 'src/data/content.js',
    lesson: 'data',
    mock: 'data',
  },
  {
    id: 'components',
    cta: 'How the components work',
    name: 'Components',
    Icon: Boxes,
    what: 'About twenty React components (Navbar, Hero, Lab, Footer…) turn that data into the page, with state for every slider and pop-up.',
    file: 'src/components/',
    lesson: 'components',
    mock: 'components',
  },
  {
    id: 'styles',
    cta: 'How the styling works',
    name: 'Styles',
    Icon: Palette,
    what: 'Tailwind classes and a handful of CSS variables give the whole site its look, and one class switches it between light and dark.',
    file: 'src/index.css',
    lesson: 'styling',
    mock: 'styles',
  },
  {
    id: 'effects',
    cta: 'How the effects are drawn',
    name: 'Effects',
    Icon: Sparkles,
    what: 'Canvases redraw the falling code matrix, the water reveal and the cursor trail up to 60 times a second, lighter on phones.',
    file: 'src/components/codeMatrix.js',
    lesson: 'canvas',
    mock: 'effects',
  },
  {
    id: 'python',
    cta: 'How Python runs here',
    name: 'Python',
    Icon: SquareTerminal,
    what: 'Real Python runs in your browser in a web worker, so the course can run your code and check it with tests.',
    file: 'src/learn/python/worker.js',
    lesson: 'python-browser',
    mock: 'python',
  },
  {
    id: 'live',
    cta: 'How the site goes live',
    name: 'The live site',
    Icon: Rocket,
    what: 'Every merge to main is built and published by GitHub Actions in under a minute. This page is the result.',
    file: '.github/workflows/deploy.yml',
    lesson: 'deploy',
    mock: 'live',
  },
];

/** Tiny illustrations drawn on each layer. */
function LayerMock({ kind }) {
  const line = (w, cls = 'bg-current') => <span className={`block h-1.5 rounded-full ${cls}`} style={{ width: w }} />;
  switch (kind) {
    case 'data':
      return (
        <pre className="m-0 font-mono text-[9px] sm:text-[10px] leading-snug text-[#fcd28d] [font-variant-ligatures:none]">
          {`{\n  title: 'Manager, Repayments',\n  cei: [50, 65],\n  dso: -12,\n}`}
        </pre>
      );
    case 'components':
      return (
        <div className="grid grid-cols-3 gap-1.5 text-[8px] sm:text-[9px] font-mono font-bold text-[#9196f6]">
          {['<Navbar/>', '<Hero/>', '<Metrics/>', '<Experience/>', '<Lab/>', '<Footer/>'].map((c) => (
            <span key={c} className="px-1 py-1.5 rounded border border-[#9196f6]/40 text-center truncate">
              {c}
            </span>
          ))}
        </div>
      );
    case 'styles':
      return (
        <div className="flex items-center gap-2">
          {['#0f8a7e', '#5b61d6', '#0c0d10', '#f7f7f5', '#3fd1bf'].map((c) => (
            <span key={c} className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-white/20" style={{ background: c }} />
          ))}
          <span className="ml-1 font-mono text-[9px] text-white/60">--accent</span>
        </div>
      );
    case 'effects':
      return (
        <div className="grid grid-cols-12 gap-0.5 font-mono text-[9px] leading-none text-[#3fd1bf]">
          {'SELECTSUM(dpd)cei=dso/arif>{}[]&&||=>SQL'.split('').slice(0, 36).map((ch, i) => (
            <span key={i} style={{ opacity: 0.25 + ((i * 7) % 10) / 13 }}>
              {ch}
            </span>
          ))}
        </div>
      );
    case 'python':
      return (
        <pre className="m-0 font-mono text-[9px] sm:text-[10px] leading-snug text-[#d6f5f0] [font-variant-ligatures:none]">
          <span className="text-[#9196f6]">def</span> bucket(dpd):{'\n'}    <span className="text-[#9196f6]">return</span>{' '}
          <span className="text-[#fcd28d]">"31-60"</span>
          {'\n'}
          <span className="text-[#3fd1bf]">✓ All tests passed</span>
        </pre>
      );
    default:
      return (
        <div className="space-y-1.5 text-white/80">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f57]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#febc2e]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-[8px] text-white/50 truncate">shivam1411-oss.github.io</span>
          </div>
          <div className="text-[11px] sm:text-xs font-extrabold text-white leading-tight">Collections that run on strategy and code</div>
          {line('70%', 'bg-white/25')}
          {line('45%', 'bg-[#3fd1bf]/70')}
        </div>
      );
  }
}

// Distance between layers when exploded (px of depth), and how far the stack shifts down to stay centred.
const SPREAD = { wide: { gap: 64, shift: 80 }, narrow: { gap: 46, shift: 56 } };

function ExplodedStack({ selected, onSelect, exploded }) {
  const reduce = useReducedMotion();
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 640px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const onChange = (e) => setWide(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const { gap, shift } = wide ? SPREAD.wide : SPREAD.narrow;
  const rx = useMotionValue(56);
  const rz = useMotionValue(-38);
  const srx = useSpring(rx, { stiffness: 120, damping: 18 });
  const srz = useSpring(rz, { stiffness: 120, damping: 18 });

  const tilt = (clientX, clientY, el) => {
    if (reduce) return;
    const r = el.getBoundingClientRect();
    const px = (clientX - r.left) / r.width - 0.5;
    const py = (clientY - r.top) / r.height - 0.5;
    rz.set(-38 + px * 26);
    rx.set(56 - py * 18);
  };
  const resetTilt = () => {
    rx.set(56);
    rz.set(-38);
  };

  return (
    <div
      className="relative h-[24rem] sm:h-[30rem] flex items-center justify-center select-none touch-pan-y"
      style={{ perspective: 1400 }}
      onPointerMove={(e) => tilt(e.clientX, e.clientY, e.currentTarget)}
      onPointerLeave={resetTilt}
      aria-label="The portfolio, split into its layers"
    >
      <motion.div
        className="relative w-[15rem] h-[10rem] sm:w-[19rem] sm:h-[12.5rem]"
        style={{ rotateX: srx, rotateZ: srz, transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ y: exploded ? shift : 0 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20 }}
      >
        {LAYERS.map((layer, i) => {
          const active = selected === layer.id;
          const z = (exploded ? i * gap : i * 3) + (active && exploded ? 24 : 0);
          return (
            <motion.button
              key={layer.id}
              type="button"
              onClick={() => onSelect(layer.id)}
              aria-label={`${layer.name} layer`}
              aria-pressed={active}
              initial={false}
              animate={{ z }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 140, damping: 18, delay: exploded ? i * 0.05 : (LAYERS.length - i) * 0.03 }}
              className={`absolute inset-0 rounded-2xl p-3 sm:p-4 text-left cursor-pointer transition-[border-color,box-shadow] duration-300 border ${
                active ? 'border-[#3fd1bf] shadow-[0_0_40px_-6px_rgba(63,209,191,0.7)]' : 'border-white/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)]'
              }`}
              style={{
                // Slightly see-through, so the layers underneath stay visible
                background: layer.id === 'live' ? 'linear-gradient(135deg, rgba(16,32,29,0.94), rgba(22,26,44,0.94))' : 'rgba(13,16,20,0.8)',
                transformStyle: 'preserve-3d',
              }}
            >
              <span className="flex items-center gap-1.5 mb-2 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-white/60">
                <layer.Icon size={12} className={active ? 'text-[#3fd1bf]' : 'text-white/50'} /> {layer.name}
              </span>
              <LayerMock kind={layer.mock} />
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

export default function Landing({ progress }) {
  const [selected, setSelected] = useState('python');
  const [exploded, setExploded] = useState(false);
  const touched = useRef(false);
  const reduce = useReducedMotion();
  const layer = LAYERS.find((l) => l.id === selected);

  const lessons = courses.reduce((s, c) => s + c.lessons.length, 0);
  const exercises = courses.reduce((s, c) => s + c.lessons.reduce((n, l) => n + (l.exercises?.length || 0), 0), 0);
  const started = Object.values(progress.done).some(Boolean);

  // Assemble, then burst apart once; then walk through the layers until the visitor takes over.
  useEffect(() => {
    const t = setTimeout(() => setExploded(true), reduce ? 0 : 700);
    return () => clearTimeout(t);
  }, [reduce]);
  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => {
      if (touched.current) return;
      setSelected((cur) => LAYERS[(LAYERS.findIndex((l) => l.id === cur) + 1) % LAYERS.length].id);
    }, 3200);
    return () => clearInterval(id);
  }, [reduce]);

  const pick = (id) => {
    touched.current = true;
    setSelected(id);
    setExploded(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-16 pb-10">
      <div className="grid lg:grid-cols-[1fr_1.05fr] gap-6 lg:gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <div className="eyebrow text-accent mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-accent/60" /> Learning Lab
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-fg leading-[1.05]">
            Want to learn from a <span className="text-gradient">real-world project</span>?
          </h1>
          <p className="mt-5 text-lg text-muted leading-relaxed max-w-xl">
            No toy examples. This portfolio is the project. Take it apart layer by layer, from the data to the live site, see the real code behind each piece, and learn
            the Python that powers the analysis, by writing and testing it yourself.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#/courses" className={btnPrimary}>
              {started ? 'Continue learning' : 'Start learning'} <ArrowRight size={15} />
            </a>
            <a href={`#/c/site/${layer.lesson}`} className={btn}>
              <BookOpen size={15} /> {layer.cta}
            </a>
          </div>
          <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
            {[
              [courses.length, 'courses'],
              [lessons, 'lessons'],
              [exercises, 'coding exercises'],
              [timeline.length, 'real changes'],
            ].map(([n, label]) => (
              <div key={label} className="p-3 rounded-2xl bg-surface border border-line text-center">
                <dt className="sr-only">{label}</dt>
                <dd className="text-2xl font-extrabold text-fg tabular-nums">{n}</dd>
                <div className="text-[11px] font-semibold text-muted">{label}</div>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease, delay: 0.1 }}>
          <ExplodedStack selected={selected} onSelect={pick} exploded={exploded} />
          <div className="-mt-6 sm:-mt-10 relative">
            <div role="tablist" aria-label="Layers" className="flex flex-wrap justify-center gap-1.5">
              {LAYERS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="tab"
                  aria-selected={selected === l.id}
                  onClick={() => pick(l.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    selected === l.id ? 'bg-accent text-bg border-accent' : 'bg-surface border-line text-muted hover:text-fg'
                  }`}
                >
                  <l.Icon size={12} /> {l.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  touched.current = true;
                  setExploded((e) => !e);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-line bg-surface text-muted hover:text-fg"
              >
                <Layers size={12} /> {exploded ? 'Put it back together' : 'Take it apart'}
              </button>
            </div>
            <motion.div
              key={layer.id}
              role="tabpanel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
              className="mt-4 p-4 rounded-2xl bg-surface border border-line shadow-soft"
            >
              <div className="flex items-center gap-2 font-extrabold text-fg">
                <layer.Icon size={16} className="text-accent" /> {layer.name}
              </div>
              <p className="mt-1 text-sm text-muted leading-relaxed">{layer.what}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-2 border border-line font-mono text-fg">
                  <Code2 size={12} className="text-accent" /> {layer.file}
                </span>
                <a href={`#/c/site/${layer.lesson}`} className="inline-flex items-center gap-1 font-bold text-accent hover:underline">
                  Lesson: {lessonTitle(layer.lesson)} <ArrowRight size={12} />
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
