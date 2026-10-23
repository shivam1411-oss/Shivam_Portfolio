import { Sparkle } from 'lucide-react';
import { competencies, techStack } from '../data/content';

const items = [...competencies, ...techStack.map((t) => t.split(' (')[0])];

export default function Marquee() {
  const row = items.map((item) => (
    <span key={item} className="flex items-center gap-6 shrink-0">
      <span className="text-sm md:text-base font-bold text-muted whitespace-nowrap">{item}</span>
      <Sparkle size={12} className="text-accent" />
    </span>
  ));

  return (
    <div
      className="marquee relative overflow-hidden border-y border-line bg-surface/50 py-5"
      style={{ maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}
    >
      <div className="marquee-track flex w-max gap-6">
        <div className="flex gap-6 pr-6">{row}</div>
        <div className="flex gap-6 pr-6" aria-hidden>
          {row}
        </div>
      </div>
    </div>
  );
}
