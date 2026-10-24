import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { labItems } from '../data/content';
import { SectionHeading, ease, fadeUp, stagger } from './motion';

function Typewriter({ text }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 32);
    return () => clearInterval(id);
  }, [text]);
  return <span className="caret">{text.slice(0, count)}</span>;
}

export default function Lab() {
  const [activeKey, setActiveKey] = useState(labItems[0].key);
  const active = labItems.find((i) => i.key === activeKey);

  return (
    <section id="lab" className="relative py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-50 -z-10" />
      <div className="glow-accent absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70rem] h-[50rem] opacity-60 -z-10" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow="Methods" title="The Analytical Lab">
            Collection strategy runs on structured data. I write <span className="text-fg font-bold">SQL</span> to pull and analyze portfolio data
            directly, and use Advanced Excel and Power BI to test treatment logic and catch early-warning signals in delinquency.
          </SectionHeading>

          <motion.div
            variants={stagger(0.07, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-2.5 mt-10"
            role="tablist"
            aria-label="Analytical methods"
          >
            {labItems.map((item) => {
              const isActive = item.key === activeKey;
              return (
                <motion.button
                  key={item.key}
                  variants={fadeUp}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveKey(item.key)}
                  className={`group relative w-full text-left p-5 rounded-xl border flex justify-between items-center transition-colors ${
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
                  <span className="relative block">
                    <span className={`block eyebrow mb-1 ${isActive ? 'text-accent' : 'text-subtle'}`}>{item.category}</span>
                    <span className="block font-bold text-fg">{item.label}</span>
                  </span>
                  <ArrowRight
                    size={18}
                    className={`relative transition-all ${isActive ? 'text-accent translate-x-0' : 'text-subtle -translate-x-1 group-hover:translate-x-0'}`}
                  />
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease }}
          className="lg:col-span-7 relative rounded-[2.5rem] p-8 md:p-14 overflow-hidden flex flex-col justify-center min-h-[30rem] bg-[#0d1014] text-white border border-white/5 shadow-2xl"
        >
          {/* Panel decor */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/25 via-transparent to-accent-2/25" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-28 -right-28 w-80 h-80 rounded-full border border-white/10"
          >
            <span className="absolute top-1/2 -left-1 w-2 h-2 rounded-full bg-accent" />
          </motion.div>
          <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-white/[0.03]" />

          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease }}
              className="relative"
              role="tabpanel"
            >
              <div className="inline-block px-3 py-1 bg-white/10 border border-white/10 text-white/90 text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-6">
                {active.badge}
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold mb-6">{active.title}</h3>
              <p className="text-white/70 mb-10 text-base md:text-lg font-medium leading-relaxed">{active.desc}</p>
              <div className="bg-black/40 p-8 md:p-10 rounded-2xl border border-white/10 font-mono text-base md:text-xl text-center shadow-inner min-h-[7rem] flex items-center justify-center">
                <span className="text-[#5eead4] break-words">
                  <Typewriter text={active.math} />
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="relative mt-8 flex items-center">
            <span className="relative flex h-2 w-2 mr-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#5eead4] opacity-70 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5eead4]" />
            </span>
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Active Metric Integration</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
