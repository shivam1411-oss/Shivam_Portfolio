import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, ChevronDown, CircleAlert, Code2, RotateCcw } from 'lucide-react';
import { playbook } from '../data/playbook';
import { SectionHeading, ease, fadeUp, stagger } from './motion';

const defaultsFor = (method) => Object.fromEntries(method.inputs.map((i) => [i.id, i.value]));

const formatInput = (input, v) => (input.unit === '₹ Cr' ? `₹${v} Cr` : input.unit ? `${v} ${input.unit}` : v.toLocaleString('en-IN'));

/** Formula shown as chips: names in white, operators in teal. */
function Formula({ parts }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[13px] md:text-sm leading-snug">
      {parts.map((p, i) => {
        const op = /^[=÷×·]/.test(p) || p === '=';
        return op ? (
          <span key={i} className="text-[#5eead4] font-bold">
            {p}
          </span>
        ) : (
          <span key={i} className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-white/90">
            {p}
          </span>
        );
      })}
    </div>
  );
}

function Calculator({ method, values, onChange, onReset }) {
  const result = useMemo(() => method.compute(values), [method, values]);
  const good = result.tone === 'good';
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
      <div className="md:col-span-3 space-y-4">
        {method.inputs.map((input) => (
          <label key={input.id} className="block">
            <span className="flex items-baseline justify-between gap-3 text-xs font-semibold text-white/60 mb-1.5">
              <span>{input.label}</span>
              <span className="font-mono text-white tabular-nums whitespace-nowrap">{formatInput(input, values[input.id])}</span>
            </span>
            <input
              type="range"
              min={input.min}
              max={input.max}
              step={input.step}
              value={values[input.id]}
              onChange={(e) => onChange(input.id, Number(e.target.value))}
              className="w-full h-1.5 cursor-pointer"
              style={{ accentColor: '#3fd1bf' }}
            />
          </label>
        ))}
      </div>

      <div className="md:col-span-2 flex flex-col justify-center rounded-2xl bg-black/40 border border-white/10 p-5 text-center">
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/50">{result.label}</div>
        <div className="mt-2 text-4xl md:text-5xl font-extrabold text-white tabular-nums">{result.format(result.value)}</div>
        <div
          className={`mt-3 inline-flex items-center justify-center gap-1.5 self-center px-3 py-1 rounded-full text-xs font-bold ${
            good ? 'bg-[#3fd1bf]/15 text-[#5eead4]' : 'bg-amber-400/15 text-amber-300'
          }`}
        >
          {good ? <CheckCircle2 size={13} /> : <CircleAlert size={13} />}
          {result.verdict}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex items-center justify-center gap-1.5 self-center text-[11px] font-semibold text-white/50 hover:text-white transition-colors"
        >
          <RotateCcw size={12} /> Reset example
        </button>
      </div>
    </div>
  );
}

export default function Lab() {
  const [activeKey, setActiveKey] = useState(playbook[0].key);
  const [values, setValues] = useState(() => Object.fromEntries(playbook.map((m) => [m.key, defaultsFor(m)])));
  const [sqlOpen, setSqlOpen] = useState(false);
  const active = playbook.find((m) => m.key === activeKey);

  const select = (key) => {
    setActiveKey(key);
    setSqlOpen(false);
  };
  const setValue = (id, v) => setValues((all) => ({ ...all, [activeKey]: { ...all[activeKey], [id]: v } }));
  const reset = () => setValues((all) => ({ ...all, [activeKey]: defaultsFor(active) }));

  return (
    <section id="lab" className="relative py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-50 -z-10" />
      <div className="glow-accent absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70rem] h-[50rem] opacity-60 -z-10" />

      <div className="max-w-7xl mx-auto">
        <SectionHeading eyebrow="The Collections Playbook" title="The Analytical Lab" className="mb-12">
          The five measures I use to run a collections book, with the formula behind each, a live calculator you can try, and where I applied
          it. Drag the sliders to see how each number moves.
        </SectionHeading>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Method picker: a scrollable row on phones, a list on desktop */}
          <motion.div
            variants={stagger(0.06)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:col-span-4 flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible -mx-6 px-6 lg:mx-0 lg:px-0 pb-1 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Collection methods"
          >
            {playbook.map((m, i) => {
              const isActive = m.key === activeKey;
              return (
                <motion.button
                  key={m.key}
                  variants={fadeUp}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => select(m.key)}
                  className={`group relative shrink-0 snap-start text-left px-4 py-3.5 lg:p-5 rounded-xl border transition-colors ${
                    isActive ? 'border-accent/40' : 'border-line hover:border-line-strong'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="lab-active"
                      className="absolute inset-0 rounded-xl bg-surface shadow-soft"
                      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                    />
                  )}
                  <span className="relative flex items-center gap-3">
                    <span
                      className={`hidden lg:flex w-8 h-8 shrink-0 rounded-lg items-center justify-center text-xs font-extrabold ${
                        isActive ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-subtle'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <span className={`block eyebrow mb-0.5 ${isActive ? 'text-accent' : 'text-subtle'}`}>{m.category}</span>
                      <span className="block font-bold text-fg whitespace-nowrap lg:whitespace-normal">{m.label}</span>
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Method panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease }}
            className="lg:col-span-8 relative rounded-[2rem] p-6 md:p-10 overflow-hidden bg-[#0d1014] text-white border border-white/5 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-accent-2/20 pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={active.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
                className="relative space-y-7"
                role="tabpanel"
              >
                <div>
                  <div className="inline-block px-3 py-1 bg-white/10 border border-white/10 text-white/90 text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-4">
                    {active.category}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-3">{active.label}</h3>
                  <p className="text-lg text-white/90 font-semibold leading-snug">{active.question}</p>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">{active.explain}</p>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-3">Formula</div>
                  <Formula parts={active.formula} />
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-3">Try it</div>
                  <Calculator method={active} values={values[active.key]} onChange={setValue} onReset={reset} />
                </div>

                <div className="flex gap-3 p-4 rounded-2xl bg-[#3fd1bf]/10 border border-[#3fd1bf]/25">
                  <CheckCircle2 size={18} className="text-[#5eead4] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[#5eead4] mb-1">Where I applied it</div>
                    <p className="text-sm text-white/90 leading-relaxed">{active.applied}</p>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setSqlOpen((o) => !o)}
                    aria-expanded={sqlOpen}
                    className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors"
                  >
                    <Code2 size={16} /> {sqlOpen ? 'Hide' : 'Show'} the SQL behind it
                    <ChevronDown size={16} className={`transition-transform ${sqlOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {sqlOpen && (
                      <motion.pre
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease }}
                        className="mt-3 overflow-x-auto rounded-2xl bg-black/50 border border-white/10 p-4 text-[12px] md:text-[13px] leading-relaxed font-mono text-[#a7f3e8]"
                      >
                        <code>{active.sql}</code>
                      </motion.pre>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
