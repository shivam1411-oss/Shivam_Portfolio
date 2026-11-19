// Playgrounds for the lessons added in November 2026: readable text over the effects, the tilting shine, and
// the stag hidden in the code matrix.
import { useEffect, useRef, useState } from 'react';
import { deerMask } from '../../components/deerMask';
import { Choice, Playground, Slider } from '../ui';

const CODE_BG =
  'SELECT bucket, SUM(balance) FROM ar_book WHERE dpd > 30 GROUP BY bucket; cei = (open + sales - close) / (open + sales) * 100; dso = ar / credit_sales * days; ';

const THEMES = {
  light: { bg: '#f7f7f5', fg: '#14171c', code: 'rgba(15,138,126,0.55)' },
  dark: { bg: '#0a0b0e', fg: '#eef1f4', code: 'rgba(63,209,191,0.5)' },
};

/** Text over a busy code background, with and without the halo, on the page or on a dark panel. */
export function HaloDemo() {
  const [theme, setTheme] = useState('light');
  const [halo, setHalo] = useState('on');
  const [place, setPlace] = useState('page');
  const t = THEMES[theme];
  const onPanel = place === 'panel';
  // The site's rule: the halo is the page colour; solid panels switch it off (the fix). "Old rule" keeps it on the panel.
  const shadow = halo === 'off' || (onPanel && halo === 'on') ? 'none' : `0 0 4px ${t.bg}, 0 0 10px ${t.bg}, 0 0 18px ${t.bg}`;
  return (
    <Playground title="The text halo" hint="Switch the halo on and off, then put the text on a dark panel in the light theme.">
      <div className="flex flex-wrap gap-3 mb-4">
        <Choice label="Theme" options={['light', 'dark']} value={theme} onChange={setTheme} />
        <Choice
          label="Halo"
          options={[
            { value: 'off', label: 'No halo' },
            { value: 'on', label: 'Halo' },
            { value: 'old', label: 'Halo, old rule' },
          ]}
          value={halo}
          onChange={setHalo}
        />
        <Choice
          label="Where"
          options={[
            { value: 'page', label: 'On the page' },
            { value: 'panel', label: 'On a dark panel' },
          ]}
          value={place}
          onChange={setPlace}
        />
      </div>
      <div className="relative rounded-xl overflow-hidden border border-line" style={{ background: t.bg }}>
        <div aria-hidden className="absolute inset-0 p-2 font-mono text-[13px] leading-5 break-all select-none" style={{ color: t.code }}>
          {CODE_BG.repeat(6)}
        </div>
        <div className="relative p-5">
          <div className={onPanel ? 'rounded-xl p-5 bg-[#0d1014]/95' : ''} style={{ textShadow: shadow, color: onPanel ? '#fff' : t.fg }}>
            <div className="text-2xl font-extrabold">Collection Efficiency Index</div>
            <p className="mt-2 text-sm font-medium" style={{ opacity: 0.85 }}>
              Of everything that could have been collected this cycle, how much actually was?
            </p>
          </div>
        </div>
      </div>
      <pre className="mt-3 p-3 rounded-lg bg-[#0d1014] text-[#d6f5f0] font-mono text-[12px] overflow-x-auto">{`text-shadow: ${shadow};`}</pre>
    </Playground>
  );
}

/** The welcome-screen shine, driven by a pretend phone tilt. */
export function ShineDemo() {
  const [tilt, setTilt] = useState(0);
  const [base, setBase] = useState(0);
  const shine = Math.max(-20, Math.min(120, 50 + (tilt - base) * 2));
  return (
    <Playground title="Tilt the phone" hint="Move the tilt slider. Then press 'Hold it like this' to make the current tilt the new middle.">
      <div className="rounded-xl bg-bg border border-line p-6 text-center">
        <span className="shine-text text-4xl md:text-5xl font-extrabold tracking-tight" style={{ '--shine': `${shine}%` }}>
          SHIVAM SONI
        </span>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-4 items-end">
        <Slider label="Left/right tilt (gamma)" value={tilt} min={-45} max={45} onChange={setTilt} format={(v) => `${v}°`} />
        <button type="button" onClick={() => setBase(tilt)} className="px-3 py-2 rounded-lg border border-line text-sm font-bold text-fg hover:border-accent/50">
          Hold it like this (baseline = {base}°)
        </button>
      </div>
      <pre className="mt-3 p-3 rounded-lg bg-[#0d1014] text-[#d6f5f0] font-mono text-[12px] overflow-x-auto">{`--shine = 50 + (${tilt} - ${base}) × 2 = ${shine.toFixed(0)}%`}</pre>
    </Playground>
  );
}

/** The stag as the matrix sees it: one value per cube, drawn as coverage or in each theme's colours. */
export function StagGrid() {
  const ref = useRef(null);
  const [view, setView] = useState('dark');
  const [cell, setCell] = useState(14);
  useEffect(() => {
    const canvas = ref.current;
    const w = canvas.clientWidth;
    const h = Math.round(w * 0.62);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const m = deerMask(cols, rows, cell);
    const dark = view !== 'light';
    ctx.fillStyle = dark ? '#0a0b0e' : '#f7f7f5';
    ctx.fillRect(0, 0, w, h);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const wgt = m.weight[i];
        if (view === 'coverage') {
          const v = Math.round(wgt * 255);
          ctx.fillStyle = `rgb(${v},${v},${v})`;
        } else if (wgt > 0 && m.rgb[i]) {
          ctx.fillStyle = `rgba(${view === 'dark' ? m.rgbDark[i] : m.rgb[i]},${wgt})`;
        } else {
          ctx.fillStyle = dark ? '#11161a' : '#e9efed';
        }
        ctx.fillRect(c * cell, r * cell, cell - 1, cell - 1);
      }
    }
  }, [view, cell]);
  return (
    <Playground title="See the stag the way the matrix does" hint="The matrix never draws the stag itself. It asks one question per cube: how much of this cube does the stag cover, and in what colour?">
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <Choice
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: 'coverage', label: 'Coverage only' },
            { value: 'light', label: 'Light theme' },
            { value: 'dark', label: 'Dark theme' },
          ]}
        />
        <div className="w-48">
          <Slider label="Cube size" value={cell} min={8} max={28} onChange={setCell} format={(v) => `${v}px`} />
        </div>
      </div>
      <canvas ref={ref} className="w-full rounded-xl border border-line block" aria-label="The stag head drawn as a grid of cubes" />
    </Playground>
  );
}
