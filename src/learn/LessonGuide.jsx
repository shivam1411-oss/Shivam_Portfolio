import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookMarked, CheckCircle2, ChevronDown, Circle, CircleHelp, Eye, Flag, Footprints, Lightbulb, ListOrdered, RotateCw, TriangleAlert, Workflow } from 'lucide-react';
import { glossary } from './glossary';

// Beginner scaffolding shown on every lesson that has a guide (see guides/): the big idea in one
// sentence, words to know as flip cards, common mistakes, questions beginners ask, and a recap.
//
// Lessons in the step-by-step format (their guide has `steps`) also get: a checklist of the lesson's
// stages (LessonPath), every keyword defined in the open with an everyday comparison (KeyWords), the
// process in numbered stages (Process), and a hands-on walkthrough with tick boxes (StepByStep).

// ---------------------------------------------------------------- ticks kept in this browser

const CHECKS_KEY = 'learn-checks';
const readChecks = () => {
  try {
    return JSON.parse(localStorage.getItem(CHECKS_KEY)) || {};
  } catch {
    return {};
  }
};
/** Tick boxes for one lesson (`lessonKey`), remembered in this browser: [ticks, toggle(id)]. */
export function useChecks(lessonKey) {
  const [all, setAll] = useState(readChecks);
  const toggle = useCallback(
    (id) => {
      // Read the saved ticks afresh so ticks made in another tab are kept.
      const next = readChecks();
      const mine = { ...(next[lessonKey] || {}) };
      if (mine[id]) delete mine[id];
      else mine[id] = true;
      next[lessonKey] = mine;
      try {
        localStorage.setItem(CHECKS_KEY, JSON.stringify(next));
      } catch {
        /* storage blocked: ticks last until the page closes */
      }
      setAll(next);
    },
    [lessonKey]
  );
  return [all[lessonKey] || {}, toggle];
}

function Tick({ done, onClick, label, locked }) {
  const Icon = done ? CheckCircle2 : Circle;
  if (locked) return <Icon size={20} className={`shrink-0 ${done ? 'text-accent' : 'text-subtle'}`} aria-hidden />;
  return (
    <button type="button" onClick={onClick} aria-pressed={done} aria-label={`${done ? 'Untick' : 'Tick'}: ${label}`} className="shrink-0 rounded-full hover:scale-110 transition-transform">
      <Icon size={20} className={done ? 'text-accent' : 'text-subtle hover:text-fg'} />
    </button>
  );
}

/**
 * The lesson's stages as a checklist. `items`: { id, label, note, target, done } where `target` is the id of
 * the section to scroll to and `done` is set for
 * stages the Lab checks itself (exercises, quiz); the others are ticked by the learner.
 */
export function LessonPath({ items, checks, toggle }) {
  const isDone = (it) => (it.done === undefined ? !!checks[it.id] : it.done);
  const count = items.filter(isDone).length;
  return (
    <section className="mt-6 p-5 rounded-2xl bg-surface border border-line shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListOrdered size={16} className="text-accent" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-fg">Your path through this lesson</h2>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${count === items.length ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-muted'}`}>
          {count} of {items.length} done
        </span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${(count / items.length) * 100}%` }} />
      </div>
      <ol className="mt-4 space-y-2.5">
        {items.map((it, i) => (
          <li key={it.id} className="flex items-start gap-3">
            <Tick done={isDone(it)} locked={it.done !== undefined} onClick={() => toggle(it.id)} label={it.label} />
            <div className="min-w-0 text-sm leading-snug">
              <button
                type="button"
                onClick={() => document.getElementById(it.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className={`text-left font-bold hover:text-accent ${isDone(it) ? 'text-muted line-through decoration-accent/50' : 'text-fg'}`}
              >
                Step {i + 1}: {it.label}
              </button>
              <span className="block text-xs text-subtle">{it.done !== undefined ? `${it.note} Ticks itself.` : it.note}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Every keyword defined in the open: what it means, and an everyday comparison. */
export function KeyWords({ ids }) {
  const entries = ids.map((id) => glossary[id]).filter(Boolean);
  if (!entries.length) return null;
  return (
    <section id="words" className="mt-6 scroll-mt-24">
      <div className="flex items-center gap-2 mb-3">
        <BookMarked size={16} className="text-accent" />
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-fg">Words to know</h2>
        <span className="text-xs text-subtle">read these first; every one is used below</span>
      </div>
      <dl className="grid sm:grid-cols-2 gap-3">
        {entries.map((e) => (
          <div key={e.term} className="p-4 rounded-2xl bg-surface border border-line">
            <dt className="font-extrabold text-fg">{e.term}</dt>
            <dd className="mt-1 text-sm text-muted leading-relaxed">{e.def}</dd>
            {e.like && (
              <dd className="mt-2 flex gap-2 text-sm text-fg leading-relaxed">
                <Lightbulb size={15} className="text-accent shrink-0 mt-0.5" />
                <span>
                  <span className="font-bold">Think of it as: </span>
                  {e.like}
                </span>
              </dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}

/** What happens, in order: numbered stages. `process`: { title, stages: [[name, what happens], …] } */
export function Process({ process }) {
  return (
    <section className="mt-6 p-5 md:p-6 rounded-2xl bg-surface border border-line">
      <div className="flex items-center gap-2">
        <Workflow size={18} className="text-accent" />
        <h2 className="text-lg font-extrabold text-fg">{process.title}</h2>
      </div>
      <ol className="mt-4 space-y-0">
        {process.stages.map(([name, text], i) => (
          <li key={name} className="relative flex gap-4 pb-5 last:pb-0">
            {i < process.stages.length - 1 && <span className="absolute left-[15px] top-8 bottom-0 w-px bg-line" aria-hidden />}
            <span className="relative w-8 h-8 shrink-0 rounded-full bg-accent/15 text-accent text-sm font-extrabold flex items-center justify-center">{i + 1}</span>
            <div className="min-w-0 pt-1">
              <div className="font-bold text-fg leading-snug">{name}</div>
              <p className="mt-0.5 text-sm text-muted leading-relaxed">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * A hands-on walkthrough: one small action per step, what to type, and what you should see.
 * `steps`: { do, code?, see? }. `children` is the practice box the steps are done in; `intro` replaces the
 * opening sentence for lessons that have no practice box.
 */
export function StepByStep({ steps, checks, toggle, intro, children }) {
  const done = steps.filter((_, i) => checks[`s${i}`]).length;
  return (
    <section id="steps" className="mt-12 scroll-mt-24 rounded-2xl border border-accent/40 bg-surface shadow-soft overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line bg-accent/5">
        <div className="flex items-center gap-2">
          <Footprints size={18} className="text-accent" />
          <h2 className="text-lg font-extrabold text-fg">Do it yourself, step by step</h2>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${done === steps.length ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-muted'}`}>
          {done} of {steps.length}
        </span>
      </div>
      <div className="p-5 md:p-6">
        <p className="text-sm text-muted leading-relaxed">
          {intro || 'Do one step at a time in the practice box below. Type the code yourself instead of copying it: typing is how it sticks. Tick each step when what you see matches.'}
        </p>
        {children}
        <ol className="mt-5 space-y-4">
          {steps.map((s, i) => {
            const ticked = !!checks[`s${i}`];
            return (
              <li key={s.do} className={`flex gap-3 p-4 rounded-xl border transition-colors ${ticked ? 'border-accent/40 bg-accent/5' : 'border-line bg-surface-2'}`}>
                <Tick done={ticked} onClick={() => toggle(`s${i}`)} label={`step ${i + 1}`} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-fg leading-snug">
                    <span className="text-accent">Step {i + 1}. </span>
                    {s.do}
                  </div>
                  {s.code && (
                    <pre className="mt-2 p-3 rounded-lg bg-[#0d1014] text-[#d6f5f0] font-mono text-[12.5px] leading-relaxed overflow-x-auto whitespace-pre [font-variant-ligatures:none]">{s.code}</pre>
                  )}
                  {s.see && (
                    <p className="mt-2 flex gap-2 text-sm text-muted leading-relaxed">
                      <Eye size={15} className="text-accent shrink-0 mt-0.5" />
                      <span>
                        <span className="font-bold text-fg">You should see: </span>
                        {s.see}
                      </span>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {done === steps.length && (
          <p className="mt-4 flex items-center gap-2 text-sm font-bold text-fg">
            <CheckCircle2 size={16} className="text-accent" /> Every step done. Now try the exercises on your own.
          </p>
        )}
      </div>
    </section>
  );
}

/** First page of a course: what you need, how a lesson works, and the order to follow. */
export function StartHere({ start, firstHref }) {
  return (
    <section className="mt-10 p-6 md:p-8 rounded-[1.75rem] bg-surface border border-accent/30 shadow-soft">
      <div className="flex items-center gap-2">
        <Flag size={18} className="text-accent" />
        <h2 className="text-xl font-extrabold text-fg">Start here</h2>
      </div>
      <p className="mt-2 text-muted leading-relaxed max-w-3xl">{start.intro}</p>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div>
          <div className="eyebrow text-subtle mb-3">Before you begin</div>
          <ul className="space-y-2">
            {start.need.map((n) => (
              <li key={n} className="flex gap-2.5 text-sm text-fg leading-relaxed">
                <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> {n}
              </li>
            ))}
          </ul>
          <div className="eyebrow text-subtle mt-6 mb-3">The order to follow</div>
          <ol className="space-y-2">
            {start.order.map((o, i) => (
              <li key={o} className="flex gap-2.5 text-sm text-fg leading-relaxed">
                <span className="w-5 h-5 shrink-0 rounded-full bg-surface-2 border border-line text-[11px] font-extrabold flex items-center justify-center mt-0.5">{i + 1}</span> {o}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <div className="eyebrow text-subtle mb-3">How every lesson works</div>
          <ol className="space-y-3">
            {start.lesson.map(([name, text], i) => (
              <li key={name} className="flex gap-3">
                <span className="w-7 h-7 shrink-0 rounded-full bg-accent/15 text-accent text-xs font-extrabold flex items-center justify-center">{i + 1}</span>
                <div className="text-sm leading-relaxed">
                  <span className="font-bold text-fg">{name}. </span>
                  <span className="text-muted">{text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {start.tip && (
        <p className="mt-6 flex gap-2.5 p-4 rounded-xl bg-accent/5 border border-accent/25 text-sm text-fg leading-relaxed">
          <Lightbulb size={16} className="text-accent shrink-0 mt-0.5" /> {start.tip}
        </p>
      )}
      {firstHref && (
        <a href={firstHref} className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-bg text-sm font-extrabold hover:opacity-90">
          Open lesson 1
        </a>
      )}
    </section>
  );
}

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
