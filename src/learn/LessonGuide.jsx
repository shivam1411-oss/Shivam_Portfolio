import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookMarked, CheckCircle2, ChevronDown, CircleHelp, Lightbulb, RotateCw, TriangleAlert } from 'lucide-react';
import { glossary } from './glossary';

// Beginner scaffolding shown on every lesson that has a guide (see guides/): the big idea in one
// sentence, words to know as flip cards, common mistakes, questions beginners ask, and a recap.

export function BigIdea({ text }) {
  return (
    <div className="mt-6 flex gap-3 p-5 rounded-2xl bg-[color-mix(in_oklab,var(--accent)_10%,var(--surface))] border border-accent/25">
      <Lightbulb size={20} className="text-accent shrink-0 mt-0.5" />
      <div>
        <div className="eyebrow text-accent mb-1">The big idea</div>
        <p className="text-fg font-semibold leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function FlipCard({ term, def }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={flipped ? `${term}: ${def}` : `${term}. Tap to see what it means`}
      className="relative h-36 text-left [perspective:900px]"
    >
      <motion.span
        className="absolute inset-0 block [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="absolute inset-0 flex flex-col justify-between p-4 rounded-2xl bg-surface border border-line shadow-soft [backface-visibility:hidden]">
          <span className="text-lg font-extrabold text-fg">{term}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-subtle">
            <RotateCw size={11} /> Tap to see what it means
          </span>
        </span>
        <span className="absolute inset-0 overflow-auto p-4 rounded-2xl bg-fg text-bg text-[13px] leading-snug font-medium [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="block font-extrabold mb-1">{term}</span>
          {def}
        </span>
      </motion.span>
    </button>
  );
}

export function WordsToKnow({ ids }) {
  const entries = ids.map((id) => glossary[id]).filter(Boolean);
  if (!entries.length) return null;
  return (
    <section className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <BookMarked size={16} className="text-accent" />
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-fg">Words to know</h2>
        <span className="text-xs text-subtle">tap a card to flip it</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {entries.map((e) => (
          <FlipCard key={e.term} term={e.term} def={e.def} />
        ))}
      </div>
    </section>
  );
}

export function Mistakes({ items }) {
  return (
    <section className="mt-12 p-5 md:p-6 rounded-2xl border border-amber-400/40 bg-[color-mix(in_oklab,#f59e0b_10%,var(--surface))]">
      <div className="flex items-center gap-2">
        <TriangleAlert size={18} className="text-amber-500" />
        <h2 className="text-lg font-extrabold text-fg">Common beginner mistakes</h2>
      </div>
      <ul className="mt-3 space-y-3">
        {items.map(([mistake, fix]) => (
          <li key={mistake} className="text-sm leading-relaxed">
            <span className="block font-bold text-fg">✗ {mistake}</span>
            <span className="block text-muted">✓ {fix}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Question({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full flex items-center justify-between gap-3 py-3.5 text-left">
        <span className="font-bold text-fg">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-subtle transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-4 text-sm text-muted leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Questions({ items }) {
  return (
    <section className="mt-6 p-5 md:p-6 rounded-2xl bg-surface border border-line">
      <div className="flex items-center gap-2">
        <CircleHelp size={18} className="text-accent" />
        <h2 className="text-lg font-extrabold text-fg">Questions beginners ask</h2>
      </div>
      <div className="mt-2">
        {items.map(([q, a]) => (
          <Question key={q} q={q} a={a} />
        ))}
      </div>
    </section>
  );
}

export function Recap({ items }) {
  return (
    <section className="mt-6 p-5 md:p-6 rounded-2xl bg-surface border border-line shadow-soft">
      <div className="eyebrow text-accent mb-3">Remember</div>
      <ul className="space-y-2">
        {items.map((r) => (
          <li key={r} className="flex gap-2.5 text-sm text-fg leading-relaxed">
            <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> {r}
          </li>
        ))}
      </ul>
    </section>
  );
}
