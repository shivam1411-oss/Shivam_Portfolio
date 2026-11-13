// What learners see when a lesson or knowledge base is part of a paid course they do not own yet.
import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Lock, Sparkles } from 'lucide-react';
import { FALLBACK_PRICES } from './paywall.config';
import { formatRupees, loadPrices } from './access';
import { btn, btnPrimary } from './ui';

/** Live prices from Supabase, falling back to the defaults if they cannot be loaded. */
export function usePrices() {
  const [prices, setPrices] = useState(null);
  useEffect(() => {
    let live = true;
    loadPrices().then((p) => live && setPrices(p));
    return () => {
      live = false;
    };
  }, []);
  return {
    course: (id) => prices?.[id] ?? FALLBACK_PRICES.course,
    all: prices?.all ?? FALLBACK_PRICES.all,
  };
}

/**
 * Ask to buy a product ('python', … or 'all'). The account and payment code answers the `lab:unlock`
 * event; until it exists, explain that purchases open soon.
 */
function requestUnlock(product, setNote) {
  const event = new CustomEvent('lab:unlock', { detail: { product, say: setNote }, cancelable: true });
  const handled = !window.dispatchEvent(event);
  if (!handled) setNote('Sign-in and payments are being set up. Paid lessons will open here very soon.');
}

export function UnlockCard({ course, compact = false }) {
  const prices = usePrices();
  const [note, setNote] = useState('');
  return (
    <div className={`rounded-[1.5rem] border border-accent/40 bg-surface shadow-soft ${compact ? 'p-5' : 'p-6 md:p-7'}`}>
      <div className="flex items-center gap-2 eyebrow text-accent">
        <Sparkles size={14} /> Unlock the full course
      </div>
      <p className="mt-2 text-sm text-muted leading-relaxed">
        The first module of {course.title} is free. Unlock every lesson, exercise and quiz in the course, plus its beginner-to-expert knowledge base. One-time
        payment, yours to keep.
      </p>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <button type="button" onClick={() => requestUnlock(course.id, setNote)} className={`${btnPrimary} justify-center`}>
          <Lock size={15} /> Unlock {course.title} · {formatRupees(prices.course(course.id))}
        </button>
        <button type="button" onClick={() => requestUnlock('all', setNote)} className={`${btn} justify-center`}>
          All 7 courses · {formatRupees(prices.all)}
        </button>
      </div>
      <p className="mt-3 text-[11px] text-subtle leading-relaxed">
        Secure payment by Razorpay. 7-day refund if it is not for you. By unlocking you agree to the{' '}
        <a href="./terms.html" target="_blank" rel="noreferrer" className="underline hover:text-fg">
          terms
        </a>{' '}
        and{' '}
        <a href="./refund.html" target="_blank" rel="noreferrer" className="underline hover:text-fg">
          refund policy
        </a>
        .
      </p>
      {note && (
        <p className="mt-3 text-sm text-fg" role="status">
          {note}
        </p>
      )}
    </div>
  );
}

/** Shown instead of a paid lesson's content. `lesson` is the catalogue entry (title, goals, module). */
export function LockedLesson({ course, lesson }) {
  const firstFree = course.lessons.find((l) => l.free);
  const mod = course.modules.find((m) => m.id === lesson.module);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <a href={`#/c/${course.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-fg">
        <ArrowLeft size={15} /> {course.title}
      </a>
      <div className="mt-6 eyebrow text-accent flex items-center gap-2">
        <Lock size={13} /> {mod?.title} · part of the full course
      </div>
      <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight text-fg leading-tight">{lesson.title}</h1>
      {lesson.goals?.length > 0 && (
        <div className="mt-6 p-5 rounded-2xl bg-surface border border-line">
          <div className="eyebrow text-subtle mb-2">In this lesson you will</div>
          <ul className="space-y-1.5">
            {lesson.goals.map((g) => (
              <li key={g} className="flex gap-2 text-sm text-fg leading-snug">
                <Check size={15} className="text-accent shrink-0 mt-0.5" /> {g}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6">
        <UnlockCard course={course} />
      </div>
      {firstFree && (
        <p className="mt-6 text-sm text-muted">
          New here?{' '}
          <a href={`#/c/${course.id}/${firstFree.id}`} className="font-bold text-fg underline underline-offset-2">
            Start with the free lessons
          </a>{' '}
          first.
        </p>
      )}
    </div>
  );
}

/** Small marker for lesson lists. */
export function LessonAccessBadge({ free }) {
  return free ? (
    <span className="px-1.5 py-0.5 rounded-md bg-accent/12 text-accent text-[10px] font-extrabold uppercase tracking-wider">Free</span>
  ) : (
    <Lock size={12} className="text-subtle" aria-label="Part of the full course" />
  );
}
