import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { randomGlyph } from '../../components/codeMatrix';
import { Choice, Playground, Slider, btn } from '../ui';

const CODE = 'SELECTbucket,SUM(balance)FROMar_bookWHEREdpdBETWEEN30AND150cei=(opening_ar+sales-closing_ar)/(opening_ar+sales-current_ar)*100';

const isDark = () => document.documentElement.classList.contains('dark');

/** Measures frames per second of whatever is running, updated twice a second. */
function useFps(running) {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    if (!running) return undefined;
    let frames = 0;
    let start = performance.now();
    let id;
    const loop = (t) => {
      frames++;
      if (t - start >= 500) {
        setFps(Math.round((frames * 1000) / (t - start)));
        frames = 0;
        start = t;
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [running]);
  return fps;
}

/** A small version of the code matrix, with its knobs exposed. */
export function MatrixMini() {
  const canvasRef = useRef(null);
  const [cell, setCell] = useState(16);
  const [speed, setSpeed] = useState(0.35);
  const [trail, setTrail] = useState(14);
  const [halfRate, setHalfRate] = useState(false);
  const [running, setRunning] = useState(true);
  const [frames, setFrames] = useState(0);
  const settings = useRef({});
  settings.current = { speed, trail, halfRate };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const heads = Array.from({ length: cols }, () => Math.random() * rows);
    let frame = 0;
    let count = 0;

    const draw = () => {
      const { speed: sp, trail: tr } = settings.current;
      const dark = isDark();
      ctx.fillStyle = dark ? '#0d1614' : '#e9efed';
      ctx.fillRect(0, 0, w, h);
      ctx.font = `600 ${Math.round(cell * 0.72)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let c = 0; c < cols; c++) {
        heads[c] += sp;
        if (heads[c] - tr > rows) heads[c] = -Math.random() * rows * 0.5;
        for (let r = 0; r < rows; r++) {
          const d = heads[c] - r;
          const lit = d >= 0 && d < tr ? 1 - d / tr : 0;
          const base = dark ? '63,209,191' : '15,138,126';
          ctx.fillStyle = d >= 0 && d < 1 ? (dark ? '#e8fffb' : '#0c3b36') : `rgba(${base},${0.18 + lit * 0.82})`;
          ctx.fillText(CODE[(c * 7 + r) % CODE.length], c * cell + cell / 2, r * cell + cell / 2);
        }
      }
    };

    const tick = () => {
      count++;
      if (!settings.current.halfRate || count % 2 === 0) {
        draw();
        setFrames((f) => f + 1);
      }
      frame = requestAnimationFrame(tick);
    };
    if (running) frame = requestAnimationFrame(tick);
    else draw();
    return () => cancelAnimationFrame(frame);
  }, [cell, running]);

  const fps = useFps(running);
  return (
    <Playground
      title="Drive a mini code matrix"
      hint="Each frame the loop moves every column's bright 'head' down by the speed, then redraws every character. Lower frame rate = less work, which is what the welcome screen does on purpose."
    >
      <canvas ref={canvasRef} className="w-full h-56 rounded-xl border border-line" aria-label="Animated code matrix demo" />
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <Slider label="Cell size" value={cell} min={10} max={28} onChange={setCell} format={(v) => `${v}px`} />
        <Slider label="Speed (rows per frame)" value={speed} min={0.05} max={1.5} step={0.05} onChange={setSpeed} format={(v) => v.toFixed(2)} />
        <Slider label="Trail length" value={trail} min={2} max={40} onChange={setTrail} format={(v) => `${v} cells`} />
        <div className="flex items-end gap-3">
          <Choice label="Frame rate" options={[{ value: false, label: 'Every frame' }, { value: true, label: 'Every other frame' }]} value={halfRate} onChange={setHalfRate} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
        <button type="button" className={btn} onClick={() => setRunning((r) => !r)}>
          {running ? <Pause size={14} /> : <Play size={14} />} {running ? 'Pause loop' : 'Run loop'}
        </button>
        <span>
          Screen refresh: <b className="font-mono text-fg">{running ? fps : 0} fps</b>
        </span>
        <span>
          Frames drawn: <b className="font-mono text-fg">{frames}</b>
        </span>
      </div>
    </Playground>
  );
}

export function DecodeDemo() {
  const [text, setText] = useState('SHIVAM SONI');
  const [speed, setSpeed] = useState(28);
  const [out, setOut] = useState('');
  const [run, setRun] = useState(0);

  useEffect(() => {
    let step = 0;
    const id = setInterval(() => {
      step++;
      setOut(
        text
          .split('')
          .map((c, i) => (c === ' ' ? ' ' : i < step ? c : i < step + 6 ? randomGlyph() : ''))
          .join('')
      );
      if (step >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, run]);

  return (
    <Playground title="The decoding name" hint="Every tick, one more real letter is revealed; the next six positions show random code symbols. Type your own text.">
      <div className="rounded-xl bg-[#0d1014] p-6 text-center">
        <div className="font-mono text-2xl md:text-4xl font-extrabold tracking-widest text-[#3fd1bf] min-h-[1.5em] break-all">{out || ' '}</div>
      </div>
      <div className="mt-4 grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
        <label className="block text-xs font-semibold text-muted">
          Text
          <input
            value={text}
            maxLength={30}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-2 border border-line text-sm text-fg focus:outline-none focus:border-accent"
          />
        </label>
        <Slider label="Milliseconds per letter" value={speed} min={10} max={200} onChange={setSpeed} format={(v) => `${v}ms`} />
        <button type="button" className={btn} onClick={() => setRun((r) => r + 1)}>
          <RotateCcw size={14} /> Replay
        </button>
      </div>
    </Playground>
  );
}

const read = (store, key) => {
  try {
    return window[store].getItem(key);
  } catch {
    return 'unavailable';
  }
};

/** Shows and edits the two real keys the site stores in this browser. */
export function StorageInspector() {
  const [, refresh] = useState(0);
  const write = (store, key, value) => {
    try {
      if (value === null) window[store].removeItem(key);
      else window[store].setItem(key, value);
    } catch {
      /* storage blocked */
    }
    refresh((n) => n + 1);
  };
  const rows = [
    {
      store: 'localStorage',
      key: 'theme',
      why: 'Your chosen theme. Survives closing the browser.',
      actions: [
        ['Set "dark"', 'dark'],
        ['Set "light"', 'light'],
        ['Remove (follow device)', null],
      ],
    },
    {
      store: 'sessionStorage',
      key: 'intro-seen',
      why: 'Set to "1" when you enter the site, so the welcome screen is skipped until this browser session ends.',
      actions: [
        ['Set "1"', '1'],
        ['Remove (show welcome again)', null],
      ],
    },
  ];
  return (
    <Playground
      title="Look inside your browser's storage"
      hint="These are the real values stored for this website in your browser right now. This page shares storage with your portfolio, so changes here affect it too."
    >
      <div className="space-y-3">
        {rows.map((r) => {
          const v = read(r.store, r.key);
          return (
            <div key={r.key} className="rounded-xl bg-surface-2 border border-line p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-mono text-sm text-fg">
                  {r.store}.<span className="text-accent font-bold">{r.key}</span>
                </div>
                <div className="font-mono text-sm">
                  = <b className="text-fg">{v === null ? 'null' : `"${v}"`}</b>
                </div>
              </div>
              <p className="text-xs text-muted mt-1">{r.why}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.actions.map(([label, value]) => (
                  <button key={label} type="button" className={`${btn} !px-3 !py-1.5 !text-xs`} onClick={() => write(r.store, r.key, value)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-subtle">The page's own theme only changes when it next loads; the toggle button changes it instantly.</p>
    </Playground>
  );
}

/** Masking: paint soft blobs where the pointer goes, then keep the hidden layer only inside them. */
export function MaskDemo() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('result');
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mask = document.createElement('canvas');
    mask.width = w;
    mask.height = h;
    const mctx = mask.getContext('2d');
    const art = document.createElement('canvas');
    art.width = w;
    art.height = h;
    const actx = art.getContext('2d');
    let drops = [];
    let frame = 0;

    const paintArt = () => {
      const dark = isDark();
      actx.fillStyle = dark ? '#0d1614' : '#e9efed';
      actx.fillRect(0, 0, w, h);
      actx.font = '600 13px "JetBrains Mono", monospace';
      actx.fillStyle = dark ? '#3fd1bf' : '#0f8a7e';
      // Each row reads a stretch of the code left to right, like the real matrix reads down columns.
      for (let row = 0, y = 14; y < h; row++, y += 16) {
        for (let col = 0, x = 4; x < w; col++, x += 10) actx.fillText(CODE[(row * 37 + col) % CODE.length], x, y);
      }
    };

    const tick = () => {
      paintArt();
      drops = drops.filter((d) => d.age < d.life);
      mctx.clearRect(0, 0, w, h);
      for (const d of drops) {
        d.age++;
        d.r += 0.6;
        const a = 1 - d.age / d.life;
        const g = mctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
        g.addColorStop(0, `rgba(0,0,0,${a})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        mctx.fillStyle = g;
        mctx.beginPath();
        mctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        mctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);
      const m = modeRef.current;
      if (m === 'mask') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(mask, 0, 0, w, h);
      } else if (m === 'hidden') {
        ctx.drawImage(art, 0, 0, w, h);
      } else {
        ctx.drawImage(mask, 0, 0, w, h);
        ctx.globalCompositeOperation = 'source-in'; // keep the art only where the mask has paint
        ctx.drawImage(art, 0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const add = (e) => {
      const r = canvas.getBoundingClientRect();
      drops.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 30, age: 0, life: 90 });
      if (drops.length > 80) drops.shift();
    };
    canvas.addEventListener('pointermove', add);
    canvas.addEventListener('pointerdown', add);
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('pointermove', add);
      canvas.removeEventListener('pointerdown', add);
    };
  }, []);

  return (
    <Playground
      title="Reveal hidden code with a mask"
      hint="Move your mouse (or drag a finger) over the box. Switch views to see the three layers the effect is built from."
    >
      <div className="mb-3">
        <Choice
          label="View"
          options={[
            { value: 'result', label: 'Result' },
            { value: 'mask', label: '1. The mask (droplets)' },
            { value: 'hidden', label: '2. The hidden matrix' },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>
      <canvas ref={canvasRef} className="w-full h-56 rounded-xl border border-line bg-surface touch-none cursor-crosshair" aria-label="Mask reveal demo: move the pointer over it" />
      <p className="mt-3 text-xs text-muted leading-relaxed">
        The result is <span className="font-mono text-fg">mask</span> drawn first, then the matrix drawn with{' '}
        <span className="font-mono text-fg">globalCompositeOperation = 'source-in'</span>, which keeps new pixels only where old ones already exist.
      </p>
    </Playground>
  );
}

const query = (q) => window.matchMedia(q).matches;

export function DeviceInspector() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    const update = () =>
      setInfo({
        pointer: query('(pointer: coarse)') ? 'coarse (touch screen)' : query('(pointer: fine)') ? 'fine (mouse / trackpad)' : 'none',
        touch: query('(pointer: coarse)'),
        scheme: query('(prefers-color-scheme: dark)') ? 'dark' : 'light',
        reduce: query('(prefers-reduced-motion: reduce)'),
        dpr: window.devicePixelRatio || 1,
        width: window.innerWidth,
      });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  if (!info) return null;
  const rows = [
    ['(pointer: …)', info.pointer, info.touch ? 'Phone settings: bigger cubes, fewer droplets/tokens, no glow, no frosted glass or grain, instant theme switch.' : 'Full effects: glow, frosted glass, grain, circular theme reveal.'],
    ['(prefers-color-scheme)', info.scheme, 'Starting theme until you pick one yourself.'],
    ['(prefers-reduced-motion)', info.reduce ? 'reduce' : 'no-preference', info.reduce ? 'Cursor trail and matrix animation are switched off.' : 'Animations play normally.'],
    ['devicePixelRatio', info.dpr.toFixed(2), `Canvases are capped at ${info.touch ? '1–1.5' : '1.5–2'}× so they are sharp but not too expensive.`],
    ['window.innerWidth', `${info.width}px`, info.width >= 1024 ? 'Desktop layout (lg:)' : info.width >= 768 ? 'Tablet layout (md:)' : 'Phone layout'],
  ];
  return (
    <Playground title="What your site sees about this device" hint="These are live readings from the browser you are using now, and what the site changes because of them.">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([q, v, effect]) => (
              <tr key={q} className="border-b border-line last:border-0 align-top">
                <td className="py-2.5 pr-3 font-mono text-xs text-subtle whitespace-nowrap">{q}</td>
                <td className="py-2.5 pr-3 font-mono text-xs font-bold text-accent whitespace-nowrap">{v}</td>
                <td className="py-2.5 text-xs text-muted leading-relaxed">{effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Playground>
  );
}

/** Animates many glows drawn two ways and measures the frame rate of each. */
export function BlurVsGradient() {
  const [kind, setKind] = useState('gradient');
  const [count, setCount] = useState(8);
  const [running, setRunning] = useState(false);
  const fps = useFps(running);
  const style =
    kind === 'blur'
      ? { background: 'var(--accent)', filter: 'blur(40px)' }
      : { background: 'radial-gradient(closest-side, color-mix(in oklab, var(--accent) 45%, transparent), transparent)' };
  return (
    <Playground
      title="Blur filter vs radial gradient"
      hint="Both make a soft coloured glow. Press Animate and compare the frame rate. On a phone the difference is often dramatic; on a fast laptop both may hit 60."
    >
      <div className="relative h-48 rounded-xl border border-line bg-surface-2 overflow-hidden">
        {Array.from({ length: count }, (_, i) => (
          <motion.div
            key={`${kind}-${i}`}
            className="absolute w-40 h-40 rounded-full opacity-70"
            style={{ ...style, left: `${(i * 73) % 85}%`, top: `${(i * 37) % 60}%` }}
            animate={running ? { x: [0, 40, -30, 0], y: [0, -20, 25, 0] } : { x: 0, y: 0 }}
            transition={running ? { duration: 3 + (i % 3), repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Choice label="Glow technique" options={[{ value: 'gradient', label: 'radial-gradient (now)' }, { value: 'blur', label: 'filter: blur (before)' }]} value={kind} onChange={setKind} />
        <button type="button" className={btn} onClick={() => setRunning((r) => !r)}>
          {running ? <Pause size={14} /> : <Play size={14} />} {running ? 'Stop' : 'Animate'}
        </button>
        <span className="text-sm text-muted">
          <b className="font-mono text-fg">{running ? fps : '–'}</b> fps
        </span>
      </div>
      <div className="mt-3 max-w-xs">
        <Slider label="Number of glows" value={count} min={1} max={24} onChange={setCount} />
      </div>
    </Playground>
  );
}

const PLANS = {
  before: [{ label: 'One bundle: welcome screen + whole site + PDF viewer + email', start: 0, size: 100, color: 'bg-amber-400' }],
  after: [
    { label: 'App chunk: welcome screen only', start: 0, size: 63, color: 'bg-accent' },
    { label: 'Site chunk (prefetched while welcome shows)', start: 63, size: 37, color: 'bg-accent-2' },
  ],
};

export function ChunkTimeline() {
  const [plan, setPlan] = useState('after');
  const [run, setRun] = useState(0);
  const bars = PLANS[plan];
  const firstPaint = plan === 'before' ? 100 : 63;
  return (
    <Playground
      title="Why the site loads as two pieces"
      hint="Bar length is how much JavaScript must arrive. The welcome screen can only appear once its own code has arrived. Splitting cut that by about 37%."
    >
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <Choice label="Bundle plan" options={[{ value: 'before', label: 'Before: one bundle' }, { value: 'after', label: 'After: split' }]} value={plan} onChange={(p) => { setPlan(p); setRun((r) => r + 1); }} />
        <button type="button" className={btn} onClick={() => setRun((r) => r + 1)}>
          <RotateCcw size={14} /> Replay
        </button>
      </div>
      <div className="space-y-3" key={`${plan}-${run}`}>
        {bars.map((b) => (
          <div key={b.label}>
            <div className="text-xs font-semibold text-muted mb-1">{b.label}</div>
            <div className="relative h-6 rounded-md bg-surface-2 border border-line overflow-hidden">
              <motion.div
                className={`absolute top-0 bottom-0 ${b.color}`}
                style={{ left: `${b.start}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${b.size}%` }}
                transition={{ duration: b.size / 50, delay: b.start / 50, ease: 'linear' }}
              />
            </div>
          </div>
        ))}
        <div className="relative h-8">
          <motion.div
            className="absolute top-0 flex flex-col items-center -translate-x-1/2"
            style={{ left: `${firstPaint}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: firstPaint / 50 }}
          >
            <span className="w-px h-3 bg-fg" />
            <span className="text-[11px] font-bold text-fg whitespace-nowrap">welcome screen visible</span>
          </motion.div>
        </div>
      </div>
      <p className="mt-2 text-xs text-subtle">Proportions are illustrative, based on the ~37% reduction measured in the commit.</p>
    </Playground>
  );
}

/** Simulates the Hero layout at different widths, using the same breakpoints as Tailwind. */
export function BreakpointPreview() {
  const [width, setWidth] = useState(390);
  const md = width >= 768;
  const lg = width >= 1024;
  const scale = Math.min(1, 560 / width);
  return (
    <Playground
      title="Resize a pretend screen"
      hint="Tailwind classes like md:… and lg:… only apply from a certain width. Drag the slider to see how the hero rearranges, as it does on real devices."
    >
      <Slider label="Screen width" value={width} min={320} max={1400} step={10} onChange={setWidth} format={(v) => `${v}px ${lg ? '· lg' : md ? '· md' : '· phone'}`} />
      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface-2" style={{ height: 300 }}>
        <div style={{ width, transform: `scale(${scale})`, transformOrigin: 'top left' }} className="p-6">
          <div className={`flex gap-6 ${lg ? 'flex-row items-center' : 'flex-col'}`}>
            <div className={`${lg ? 'order-1 flex-1' : 'order-2'}`}>
              <div className="eyebrow text-accent">Collection Strategy Leader</div>
              <div className={`font-extrabold text-fg leading-tight mt-2 ${md ? 'text-5xl' : 'text-3xl'}`}>Collections that run on strategy and code</div>
              <div className="mt-4 flex gap-2">
                <span className="px-4 py-2 rounded-lg bg-fg text-bg text-sm font-bold">Connect</span>
                <span className="px-4 py-2 rounded-lg border border-line text-sm font-bold text-fg">Resume</span>
              </div>
            </div>
            <div className={`relative ${lg ? 'order-2 w-72' : 'order-1 w-56 self-center'}`}>
              <div className="aspect-square rounded-full bg-gradient-to-br from-accent to-accent-2 p-1">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-subtle text-sm font-bold">photo</div>
              </div>
              {lg ? (
                <>
                  <span className="absolute -left-10 top-6 px-3 py-2 rounded-lg bg-surface shadow-soft text-xs font-bold text-fg">CEI 65%</span>
                  <span className="absolute -right-6 bottom-6 px-3 py-2 rounded-lg bg-surface shadow-soft text-xs font-bold text-fg">DSO −12d</span>
                </>
              ) : (
                <div className="mt-3 flex gap-2 justify-center">
                  <span className="px-3 py-2 rounded-lg bg-surface shadow-soft text-xs font-bold text-fg">CEI 65%</span>
                  <span className="px-3 py-2 rounded-lg bg-surface shadow-soft text-xs font-bold text-fg">DSO −12d</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted leading-relaxed">
        On phones the photo comes first and the stat cards sit in a row under it, so they never cover the face. From <span className="font-mono">lg</span> (1024px)
        they float around the photo.
      </p>
    </Playground>
  );
}
