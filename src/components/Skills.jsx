import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';
import { competencies, education, techStack } from '../data/content';
import { Reveal, SectionHeading, Spotlight, ease, stagger } from './motion';

function ChipGroup({ title, items }) {
  return (
    <Spotlight className="h-full p-6 md:p-8 rounded-2xl bg-surface border border-line shadow-soft">
      <h3 className="eyebrow text-subtle mb-4">{title}</h3>
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

/** What Shivam does and with which tools, followed by education. */
export default function Skills() {
  return (
    <section id="skills" className="relative py-28 px-6 bg-surface-2/50">
      <div className="max-w-7xl mx-auto">
        <SectionHeading eyebrow="Capabilities" title="Skills & Education" className="mb-12">
          The collection-strategy skills I use every day, the tools I use them with, and my formal training in finance.
        </SectionHeading>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Reveal>
            <ChipGroup title="Core Competencies" items={competencies} />
          </Reveal>
          <Reveal delay={0.05}>
            <ChipGroup title="Technical Stack" items={techStack} />
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
          {education.map((ed, i) => (
            <Reveal key={ed.degree} delay={0.05 * (i + 2)}>
              <Spotlight className="h-full p-6 md:p-8 rounded-2xl bg-surface border border-line shadow-soft flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <GraduationCap size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-fg mb-1">{ed.degree}</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {ed.school} ({ed.year})
                  </p>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
