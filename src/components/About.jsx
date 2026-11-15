import { Briefcase, FlaskConical, GraduationCap, MapPin, Plane, TrendingUp, UserRound, Workflow } from 'lucide-react';
import { about, education, experience, heroPillars, profile } from '../data/content';
import { Reveal, SectionHeading, Spotlight } from './motion';

const pillarIcons = { automation: Workflow, testing: FlaskConical, results: TrendingUp };

/** A short professional summary and the facts a recruiter looks for first. */
export default function About() {
  const facts = [
    { Icon: UserRound, label: 'Current role', value: `${experience[0].title}, ${experience[0].company.split(',')[0]}` },
    { Icon: Briefcase, label: 'Experience', value: about.experience },
    { Icon: MapPin, label: 'Based in', value: profile.location },
    { Icon: Plane, label: 'Relocation', value: profile.relocation.replace(/^Open to relocation: /, 'Open to ') },
    { Icon: GraduationCap, label: 'Education', value: `${education[0].degree}, ${education[0].year}` },
  ];
  return (
    <section id="about" className="py-28 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHeading eyebrow="About" title="Professional summary" />
          <div className="space-y-5 max-w-2xl">
            {about.paragraphs.map((p, i) => (
              <Reveal key={p} delay={0.05 * (i + 1)} as="p" className="text-base sm:text-lg text-muted leading-relaxed">
                {p}
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.1} className="lg:col-span-5">
          <Spotlight className="rounded-2xl bg-surface border border-line shadow-soft p-6 md:p-8">
            <h3 className="eyebrow text-subtle mb-5">At a glance</h3>
            <dl className="space-y-5">
              {facts.map(({ Icon, label, value }) => (
                <div key={label} className="flex gap-4">
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <dt className="eyebrow text-subtle mb-0.5">{label}</dt>
                    <dd className="text-sm font-bold text-fg leading-snug">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Spotlight>
        </Reveal>
      </div>

      {/* The idea behind the work, then the three ways it shows up */}
      <Reveal as="blockquote" className="mt-20 max-w-4xl text-3xl md:text-5xl font-extrabold tracking-tight text-fg leading-[1.1]">
        <span className="text-accent">“</span>
        {about.quote.map((part) => (
          <span key={part.t} className={part.hl ? 'text-gradient' : undefined}>
            {part.t}
          </span>
        ))}
        <span className="text-accent">”</span>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        {heroPillars.map((p, i) => {
          const Icon = pillarIcons[p.key];
          return (
            <Reveal key={p.key} delay={0.06 * i} className="h-full">
              <Spotlight className="h-full p-6 md:p-7 rounded-2xl bg-surface border border-line shadow-soft hover:border-line-strong transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <Icon size={18} />
                  </span>
                  <span className="eyebrow text-subtle">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-fg">{p.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{p.body}</p>
              </Spotlight>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
