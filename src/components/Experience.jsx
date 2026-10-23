import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { ChevronRight, GraduationCap } from 'lucide-react';
import { competencies, education, experience, techStack } from '../data/content';
import { Reveal, SectionHeading, Spotlight, ease, fadeUp, stagger } from './motion';

function ChipGroup({ title, items }) {
  return (
    <Spotlight className="p-6 rounded-2xl bg-surface border border-line shadow-soft">
      <h4 className="eyebrow text-subtle mb-4">{title}</h4>
      <motion.div variants={stagger(0.05)} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-wrap gap-2">
        {items.map((item) => (
          <motion.span
            key={item}
            variants={{ hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease } } }}
            whileHover={{ y: -2 }}
            className="px-3 py-1.5 rounded-lg bg-surface-2 border border-line text-xs font-bold text-muted hover:text-fg hover:border-accent/40 transition-colors cursor-default"
          >
            {item}
          </motion.span>
        ))}
      </motion.div>
    </Spotlight>
  );
}

function TimelineItem({ job, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease, delay: 0.05 * index }}
      className="relative pl-10 md:pl-12"
    >
      {/* Node */}
      <motion.span
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}
        className={`absolute left-[-7px] top-1.5 w-4 h-4 rounded-full border-4 border-bg ${job.current ? 'bg-accent' : 'bg-line-strong'}`}
      >
        {job.current && <span className="absolute inset-[-6px] rounded-full bg-accent/30 animate-ping" />}
      </motion.span>

      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`eyebrow ${job.current ? 'text-accent' : 'text-subtle'}`}>{job.period}</span>
          {job.current && (
            <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] font-extrabold uppercase tracking-widest">Current</span>
          )}
        </div>
        <h3 className="text-2xl font-extrabold text-fg mt-2">{job.title}</h3>
        <p className="text-subtle font-bold text-xs uppercase tracking-widest mt-1">{job.company}</p>
      </div>

      <Spotlight className="rounded-2xl bg-surface border border-line p-6 shadow-soft hover:border-line-strong transition-colors">
        {job.points ? (
          <motion.ul
            variants={stagger(0.06, 0.15)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-muted"
          >
            {job.points.map((p) => (
              <motion.li key={p} variants={fadeUp} className="flex items-start gap-2 leading-relaxed">
                <ChevronRight size={16} className="text-accent shrink-0 mt-0.5" />
                {p}
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <p className="text-sm text-muted leading-relaxed">{job.summary}</p>
        )}
      </Spotlight>
    </motion.div>
  );
}

export default function Experience() {
  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ['start 70%', 'end 60%'] });
  const lineScale = useSpring(scrollYProgress, { stiffness: 100, damping: 24 });

  return (
    <section id="experience" className="py-28 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeading eyebrow="Timeline" title="Professional Narrative">
              <span className="italic">A transition from traditional banking frameworks to high-growth fintech environments.</span>
            </SectionHeading>

            <div className="space-y-4 mt-10">
              <Reveal>
                <ChipGroup title="Core Competencies" items={competencies} />
              </Reveal>
              <Reveal delay={0.05}>
                <ChipGroup title="Technical Stack" items={techStack} />
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {education.map((ed, i) => (
                  <Reveal key={ed.degree} delay={0.08 * (i + 1)}>
                    <Spotlight className="h-full p-6 rounded-2xl bg-surface border border-line shadow-soft flex gap-4">
                      <span className="w-10 h-10 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                        <GraduationCap size={18} />
                      </span>
                      <div>
                        <h4 className="text-sm font-extrabold uppercase tracking-widest text-fg mb-1">{ed.degree}</h4>
                        <p className="text-xs text-muted">
                          {ed.school} ({ed.year})
                        </p>
                      </div>
                    </Spotlight>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div ref={timelineRef} className="lg:col-span-8 relative">
          {/* Track + scroll-linked progress line */}
          <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-line rounded-full" />
          <motion.div
            style={{ scaleY: lineScale }}
            className="absolute left-0 top-2 bottom-2 w-[2px] origin-top rounded-full bg-gradient-to-b from-accent via-accent-2 to-accent/0"
          />
          <div className="space-y-14">
            {experience.map((job, i) => (
              <TimelineItem key={job.period} job={job} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
