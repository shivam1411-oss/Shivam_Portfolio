import { motion } from 'motion/react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { careerScope, impactLevers, impactMetrics } from '../data/impact';
import { Counter, Reveal, SectionHeading, Spotlight, ease, fadeUp, stagger } from './motion';

/** Before → after bar on a real scale; the "after" fill animates in when scrolled into view. */
function BeforeAfterBar({ from, to, max, caption, lowerIsBetter }) {
  return (
    <div className="mt-5">
      <div className="relative h-2.5 rounded-full bg-surface-2 overflow-hidden">
        {/* Before */}
        <div className="absolute inset-y-0 left-0 rounded-full bg-line-strong" style={{ width: `${(from / max) * 100}%` }} />
        {/* After */}
        <motion.div
          initial={{ width: `${(from / max) * 100}%` }}
          whileInView={{ width: `${(to / max) * 100}%` }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.4, ease, delay: 0.3 }}
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${lowerIsBetter ? 'from-accent-2 to-accent' : 'from-accent to-accent-2'}`}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-semibold text-subtle">
        <span>{caption}</span>
        <span className="tabular-nums whitespace-nowrap ml-3">
          {from} → <span className="text-fg">{to}</span>
        </span>
      </div>
    </div>
  );
}

function MetricCard({ m, index }) {
  const Down = m.prefix === '−';
  const Trend = Down ? ArrowDownRight : ArrowUpRight;
  return (
    <Reveal delay={index * 0.08} className="h-full">
      <Spotlight className="h-full flex flex-col p-6 md:p-7 rounded-[1.75rem] bg-surface border border-line shadow-soft hover:border-line-strong transition-colors">
        <div className="flex items-start justify-between gap-3">
          <span className="eyebrow text-subtle">{m.label}</span>
          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-[11px] font-extrabold whitespace-nowrap">
            <Trend size={13} />
            {m.change}
          </span>
        </div>

        <div className="mt-4 text-5xl md:text-6xl font-extrabold tracking-tight text-gradient leading-none">
          <Counter value={m.value} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} />
          {m.unit && <span className="ml-2 text-2xl md:text-3xl">{m.unit}</span>}
        </div>
        {m.before !== 'Baseline' && <div className="mt-2 text-sm font-semibold text-subtle">up from {m.before}</div>}

        <p className="mt-4 text-sm text-muted leading-relaxed">{m.meaning}</p>

        <div className="mt-auto">{m.bar && <BeforeAfterBar {...m.bar} />}</div>
      </Spotlight>
    </Reveal>
  );
}

export default function Metrics() {
  return (
    <section id="impact" className="relative py-28 px-6 bg-surface-2/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <SectionHeading eyebrow="Impact" title="Impact by the numbers">
            What changed on the OneCard credit card book once segmentation, tested treatment and automation went live.
          </SectionHeading>
          <Reveal delay={0.15}>
            <a
              href="#lab"
              className="group inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-fg transition-colors whitespace-nowrap"
            >
              See how each is measured
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </Reveal>
        </div>

        {/* Headline results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {impactMetrics.map((m, i) => (
            <MetricCard key={m.key} m={m} index={i} />
          ))}
        </div>

        {/* How the results were produced */}
        <Reveal className="mt-16">
          <h3 className="eyebrow text-subtle mb-5">How the results were delivered</h3>
        </Reveal>
        <motion.ol
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-0"
        >
          {impactLevers.map((l, i) => (
            <motion.li key={l.step} variants={fadeUp} className="relative flex md:block items-start gap-4 md:pr-6">
              <div className="flex md:items-center gap-3 md:mb-4">
                <span className="w-9 h-9 shrink-0 rounded-full border border-accent/40 bg-accent/10 text-accent text-sm font-extrabold flex items-center justify-center">
                  {i + 1}
                </span>
                {i < impactLevers.length - 1 && (
                  <span className="hidden md:block flex-1 h-px bg-gradient-to-r from-accent/50 to-line" aria-hidden />
                )}
              </div>
              <div>
                <div className="font-extrabold text-fg flex items-center gap-1">
                  {l.step}
                  {i < impactLevers.length - 1 && <ChevronRight size={14} className="md:hidden text-subtle" />}
                </div>
                <p className="text-sm text-muted leading-relaxed mt-1">{l.detail}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>

        {/* Career scope */}
        <motion.dl
          variants={stagger(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-16 grid grid-cols-2 md:grid-cols-5 rounded-[1.75rem] border border-line bg-surface shadow-soft overflow-hidden"
        >
          {careerScope.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className={`p-5 md:p-6 border-line ${i % 2 === 0 ? 'border-r' : ''} md:border-r ${i === careerScope.length - 1 ? 'md:border-r-0 col-span-2 md:col-span-1' : ''} ${
                i < careerScope.length - 1 ? 'border-b md:border-b-0' : ''
              }`}
            >
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-2xl md:text-3xl font-extrabold text-fg tabular-nums">{s.value}</dd>
              <dd className="mt-1 text-xs font-semibold text-subtle leading-snug">{s.label}</dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
