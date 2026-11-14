import { motion } from 'motion/react';
import { BadgeCheck, ChartNoAxesCombined, GraduationCap, Target, Wrench } from 'lucide-react';
import { education, skillGroups } from '../data/content';
import { Reveal, SectionHeading, Spotlight, ease, stagger } from './motion';

const groupIcons = { strategy: Target, data: ChartNoAxesCombined, tools: Wrench };

function SkillGroup({ group }) {
  const Icon = groupIcons[group.key];
  return (
    <Spotlight className="h-full flex flex-col p-6 md:p-8 rounded-[1.75rem] bg-surface border border-line shadow-soft hover:border-line-strong transition-colors">
      <span className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
        <Icon size={22} />
      </span>
      <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-fg">{group.title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{group.blurb}</p>

      <motion.div variants={stagger(0.05)} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-5 flex flex-wrap gap-2">
        {group.items.map((item) => (
          <motion.span
            key={item}
            variants={{ hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease } } }}
            whileHover={{ y: -2 }}
            className="px-3 py-1.5 rounded-lg bg-surface-2 border border-line text-xs font-bold text-fg hover:border-accent/40 transition-colors cursor-default"
          >
            {item}
          </motion.span>
        ))}
      </motion.div>

      <p className="mt-auto pt-6 flex gap-2 text-sm font-semibold text-fg leading-snug">
        <BadgeCheck size={17} className="text-accent shrink-0 mt-0.5" />
        {group.proof}
      </p>
    </Spotlight>
  );
}

/** What Shivam does and with which tools, each group backed by one line of evidence, then education. */
export default function Skills() {
  return (
    <section id="skills" className="relative py-28 px-6 bg-surface-2/50">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Capabilities"
          title={
            <>
              Skills, <span className="text-gradient">with proof</span>
            </>
          }
          className="mb-12"
        >
          Three kinds of skill, each with the result or the work that shows it, followed by my formal training in finance.
        </SectionHeading>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {skillGroups.map((group, i) => (
            <Reveal key={group.key} delay={0.06 * i} className="h-full">
              <SkillGroup group={group} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <h3 className="eyebrow text-subtle mb-5">Education</h3>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {education.map((ed, i) => (
            <Reveal key={ed.degree} delay={0.05 * (i + 1)}>
              <Spotlight className="h-full p-6 md:p-8 rounded-2xl bg-surface border border-line shadow-soft flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <GraduationCap size={18} />
                </span>
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-widest text-fg mb-1">{ed.degree}</h4>
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
