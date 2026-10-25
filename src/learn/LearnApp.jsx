import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  GitCommitHorizontal,
  GraduationCap,
  History,
  ListTree,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { ease } from '../components/motion';
import { glossary } from './glossary';
import { lessonById, lessons, modules } from './lessons';
import { timeline } from './timeline';
import { btn, btnPrimary } from './ui';

// ---------------------------------------------------------------- routing and progress

const parseHash = () => {
  const [view, id] = window.location.hash.replace(/^#\/?/, '').split('/');
  if (view === 'lesson' && lessonById[id]) return { view, id };
  if (view === 'timeline' || view === 'glossary') return { view };
  return { view: 'home' };
};

function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

const STORE_KEY = 'learn-progress';
const loadProgress = () => {
  try {
    return { done: {}, answers: {}, ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') };
  } catch {
    return { done: {}, answers: {} };
  }
};

/** Completed lessons and quiz answers, remembered in this browser. */
function useProgress() {
  const [progress, setProgress] = useState(loadProgress);
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(progress));
    } catch {
      /* storage unavailable: progress lasts for this visit only */
    }
  }, [progress]);

  const setDone = useCallback((id, done = true) => setProgress((p) => ({ ...p, done: { ...p.done, [id]: done } })), []);
  const answer = useCallback(
    (id, qi, choice) => setProgress((p) => ({ ...p, answers: { ...p.answers, [id]: { ...p.answers[id], [qi]: choice } } })),
    []
  );
  const resetQuiz = useCallback((id) => setProgress((p) => ({ ...p, answers: { ...p.answers, [id]: {} } })), []);
  const resetAll = useCallback(() => setProgress({ done: {}, answers: {} }), []);
  return { progress, setDone, answer, resetQuiz, resetAll };
}

const go = (hash) => {
  window.location.hash = hash;
};

// ---------------------------------------------------------------- shared pieces

function ProgressRing({ value, size = 64 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-strong)" strokeWidth="6" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={false}
        animate={{ strokeDashoffset: c * (1 - value) }}
        transition={{ duration: 0.8, ease }}
      />
    </svg>
  );
}

function Header({ route, doneCount }) {
  const links = [
    { hash: '#/', label: 'Lessons', Icon: BookOpen, active: route.view === 'home' || route.view === 'lesson' },
    { hash: '#/timeline', label: 'What changed', Icon: History, active: route.view === 'timeline' },
    { hash: '#/glossary', label: 'Glossary', Icon: ListTree, active: route.view === 'glossary' },
  ];
  return (
    <header className="sticky top-0 z-30 glass border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
        <a href="#/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-9 h-9 rounded-xl bg-fg text-bg flex items-center justify-center">
            <GraduationCap size={18} />
          </span>
          <span className="hidden sm:block leading-tight">
            <span className="block font-extrabold text-fg text-sm">Learn the Code</span>
            <span className="block text-[11px] text-subtle font-semibold">How your portfolio was built</span>
          </span>
        </a>
        <nav className="flex-1 flex justify-center gap-1">
          {links.map(({ hash, label, Icon, active }) => (
            <a
              key={hash}
              href={hash}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${active ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg'}`}
            >
              <Icon size={15} className="hidden sm:block" />
              {label}
            </a>
          ))}
        </nav>
        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold">
          <CheckCircle2 size={13} /> {doneCount}/{lessons.length}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}

const moduleOf = (lesson) => modules.find((m) => m.id === lesson.module);

// ---------------------------------------------------------------- home

function Home({ progress, resetAll }) {
  const done = lessons.filter((l) => progress.done[l.id]).length;
  const next = lessons.find((l) => !progress.done[l.id]);
  const totalMinutes = lessons.reduce((s, l) => s + l.minutes, 0);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <section className="relative">
        <div className="glow-accent absolute -top-24 -left-24 w-[36rem] h-[36rem] opacity-70 -z-10" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <div className="eyebrow text-accent mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-accent/60" /> For beginners · {lessons.length} lessons · about {Math.round(totalMinutes / 10) * 10} minutes
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-fg max-w-3xl leading-[1.05]">
            Learn how your portfolio <span className="text-gradient">actually works</span>
          </h1>
          <p className="mt-5 text-lg text-muted max-w-2xl leading-relaxed">
            Every change made to your site, explained from zero with the real code, playgrounds you can poke at, and a short quiz at the end of each lesson. No experience
            needed: underlined words open a plain-English definition.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="mt-8 flex flex-wrap items-center gap-5 p-5 rounded-2xl bg-surface border border-line shadow-soft max-w-2xl"
        >
          <div className="relative">
            <ProgressRing value={done / lessons.length} />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-fg">{Math.round((done / lessons.length) * 100)}%</span>
          </div>
          <div className="flex-1 min-w-[12rem]">
            <div className="font-extrabold text-fg">{done === lessons.length ? 'All lessons complete. Nicely done!' : next && done ? 'Pick up where you left off' : 'Start with the big picture'}</div>
            <div className="text-sm text-muted">{next ? `Next: ${next.title}` : 'Try the glossary or the change timeline to review.'}</div>
          </div>
          <div className="flex gap-2">
            {next && (
              <a href={`#/lesson/${next.id}`} className={btnPrimary}>
                {done ? 'Continue' : 'Start learning'} <ArrowRight size={15} />
              </a>
            )}
            {done > 0 && (
              <button type="button" onClick={resetAll} className={btn} title="Clear progress">
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </motion.div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        {modules.map((m, mi) => {
          const items = lessons.filter((l) => l.module === m.id);
          const moduleDone = items.filter((l) => progress.done[l.id]).length;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease, delay: (mi % 2) * 0.06 }}
              className="p-6 rounded-[1.75rem] bg-surface border border-line shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="eyebrow text-subtle">Module {mi + 1}</div>
                  <h2 className="mt-1 text-xl font-extrabold text-fg">{m.title}</h2>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${moduleDone === items.length ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-muted'}`}>
                  {moduleDone}/{items.length}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{m.blurb}</p>
              <ul className="mt-4 space-y-1">
                {items.map((l) => (
                  <li key={l.id}>
                    <a href={`#/lesson/${l.id}`} className="group flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-xl hover:bg-surface-2 transition-colors">
                      {progress.done[l.id] ? <CheckCircle2 size={18} className="text-accent shrink-0" /> : <Circle size={18} className="text-subtle shrink-0" />}
                      <span className="flex-1 text-sm font-semibold text-fg">{l.title}</span>
                      <span className="text-[11px] text-subtle font-semibold whitespace-nowrap">{l.minutes} min</span>
                      <ArrowRight size={14} className="text-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <a href="#/timeline" className="group p-6 rounded-[1.75rem] border border-line hover:border-accent/40 transition-colors">
          <History className="text-accent" size={22} />
          <div className="mt-3 font-extrabold text-fg">What changed, in order</div>
          <p className="mt-1 text-sm text-muted">All {timeline.length} changes to your site in plain words, each linked to the lessons that explain it.</p>
        </a>
        <a href="#/glossary" className="group p-6 rounded-[1.75rem] border border-line hover:border-accent/40 transition-colors">
          <ListTree className="text-accent" size={22} />
          <div className="mt-3 font-extrabold text-fg">Glossary</div>
          <p className="mt-1 text-sm text-muted">{Object.keys(glossary).length} terms like props, state, canvas and CORS, explained without jargon.</p>
        </a>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- lesson

function Quiz({ lesson, answers = {}, onAnswer, onReset, onPassed }) {
  const total = lesson.quiz.length;
  const correct = lesson.quiz.filter((q, i) => answers[i] === q.answer).length;
  const passed = correct === total;

  useEffect(() => {
    if (passed) onPassed();
  }, [passed, onPassed]);

  return (
    <section className="mt-14 p-6 md:p-8 rounded-[1.75rem] bg-surface border border-line shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-accent" />
          <h2 className="text-xl font-extrabold text-fg">Check your understanding</h2>
        </div>
        <span className="text-sm font-bold text-muted">
          {correct}/{total} correct
        </span>
      </div>
      <div className="mt-6 space-y-8">
        {lesson.quiz.map((q, qi) => {
          const chosen = answers[qi];
          const answered = chosen !== undefined;
          const right = chosen === q.answer;
          return (
            <div key={qi}>
              <div className="font-bold text-fg">
                {qi + 1}. {q.q}
              </div>
              <div className="mt-3 grid gap-2">
                {q.options.map((o, oi) => {
                  const isChosen = chosen === oi;
                  const state = !answered || !isChosen ? 'idle' : right ? 'right' : 'wrong';
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={right}
                      onClick={() => onAnswer(qi, oi)}
                      className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                        state === 'right'
                          ? 'border-accent bg-accent/10 text-fg'
                          : state === 'wrong'
                            ? 'border-amber-400/60 bg-amber-400/10 text-fg'
                            : 'border-line text-muted hover:border-line-strong hover:text-fg disabled:hover:border-line disabled:hover:text-muted'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[11px] font-extrabold ${
                          state === 'right' ? 'bg-accent text-bg' : state === 'wrong' ? 'bg-amber-400 text-black' : 'bg-surface-2 text-subtle'
                        }`}
                      >
                        {state === 'right' ? <Check size={13} /> : state === 'wrong' ? <XCircle size={13} /> : String.fromCharCode(65 + oi)}
                      </span>
                      {o}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {answered && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-3 text-sm leading-relaxed ${right ? 'text-accent' : 'text-amber-600 dark:text-amber-300'}`}
                  >
                    {right ? `Correct. ${q.why}` : 'Not quite. Have another go: re-read the section above if you need to.'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <AnimatePresence>
        {passed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-accent/10 border border-accent/30"
          >
            <Sparkles size={18} className="text-accent" />
            <span className="flex-1 font-bold text-fg">All correct. Lesson complete!</span>
            <button type="button" onClick={onReset} className={`${btn} !text-xs`}>
              <RotateCcw size={13} /> Retake quiz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function LessonNav({ currentId, progress, onPick }) {
  return (
    <nav aria-label="All lessons" className="space-y-5">
      {modules.map((m) => (
        <div key={m.id}>
          <div className="eyebrow text-subtle mb-2 px-3">{m.title}</div>
          <ul className="space-y-0.5">
            {lessons
              .filter((l) => l.module === m.id)
              .map((l) => {
                const active = l.id === currentId;
                return (
                  <li key={l.id}>
                    <a
                      href={`#/lesson/${l.id}`}
                      onClick={onPick}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                        active ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg'
                      }`}
                    >
                      {progress.done[l.id] ? <CheckCircle2 size={15} className="text-accent shrink-0" /> : <Circle size={15} className="text-subtle shrink-0" />}
                      {l.title}
                    </a>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Lesson({ id, progress, setDone, answer, resetQuiz }) {
  const lesson = lessonById[id];
  const index = lessons.indexOf(lesson);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const mod = moduleOf(lesson);
  const done = !!progress.done[id];
  const [navOpen, setNavOpen] = useState(false);
  const onPassed = useCallback(() => setDone(id), [id, setDone]);
  const Body = lesson.body;

  useEffect(() => setNavOpen(false), [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 grid lg:grid-cols-[17rem_1fr] gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6 pr-1">
          <LessonNav currentId={id} progress={progress} />
        </div>
      </aside>

      <article className="min-w-0 max-w-3xl">
        <div className="lg:hidden mb-6">
          <button type="button" onClick={() => setNavOpen((o) => !o)} className={`${btn} w-full justify-between`} aria-expanded={navOpen}>
            <span className="flex items-center gap-2">
              <BookOpen size={15} /> Lesson {index + 1} of {lessons.length}
            </span>
            <ChevronDown size={16} className={`transition-transform ${navOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {navOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 rounded-2xl bg-surface-2 border border-line">
                  <LessonNav currentId={id} progress={progress} onPick={() => setNavOpen(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div key={id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
          <div className="eyebrow text-accent flex items-center gap-3">
            <span className="h-px w-8 bg-accent/60" /> {mod.title} · Lesson {index + 1}
          </div>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight text-fg leading-tight">{lesson.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-line">
              <Clock size={12} /> {lesson.minutes} min
            </span>
            {lesson.commits.map((c) => (
              <a
                key={c}
                href="#/timeline"
                title={timeline.find((t) => t.hash === c)?.title}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-line font-mono hover:text-fg"
              >
                <GitCommitHorizontal size={12} /> {c}
              </a>
            ))}
            {done && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent">
                <CheckCircle2 size={12} /> Completed
              </span>
            )}
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-surface border border-line">
            <div className="eyebrow text-subtle mb-3">In this lesson you will learn</div>
            <ul className="space-y-2">
              {lesson.goals.map((g) => (
                <li key={g} className="flex gap-2.5 text-sm text-fg font-medium">
                  <Check size={16} className="text-accent shrink-0 mt-0.5" /> {g}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <Body />
          </div>

          <Quiz
            key={id}
            lesson={lesson}
            answers={progress.answers[id]}
            onAnswer={(qi, oi) => answer(id, qi, oi)}
            onReset={() => resetQuiz(id)}
            onPassed={onPassed}
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            {prev ? (
              <a href={`#/lesson/${prev.id}`} className={btn}>
                <ArrowLeft size={15} /> <span className="max-w-[12rem] truncate">{prev.title}</span>
              </a>
            ) : (
              <a href="#/" className={btn}>
                <ArrowLeft size={15} /> All lessons
              </a>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setDone(id, !done)} className={btn}>
                {done ? <RotateCcw size={14} /> : <Check size={14} />} {done ? 'Mark as not done' : 'Mark as done'}
              </button>
              {next ? (
                <button
                  type="button"
                  onClick={() => {
                    setDone(id);
                    go(`#/lesson/${next.id}`);
                  }}
                  className={btnPrimary}
                >
                  Next: <span className="max-w-[12rem] truncate">{next.title}</span> <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDone(id);
                    go('#/');
                  }}
                  className={btnPrimary}
                >
                  Finish <Sparkles size={15} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </article>
    </div>
  );
}

// ---------------------------------------------------------------- timeline and glossary

function Timeline() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="eyebrow text-accent mb-4 flex items-center gap-3">
        <span className="h-px w-8 bg-accent/60" /> {timeline.length} changes
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-fg">What changed, in order</h1>
      <p className="mt-4 text-muted leading-relaxed">
        Each item is one <b className="text-fg">commit</b> in your repository, from the React rebuild to the latest fix. The short code (like <span className="font-mono">d1fd86a</span>)
        is its id; you can find it on GitHub under Commits.
      </p>
      <ol className="mt-10 relative border-l-2 border-line ml-2">
        {timeline.map((t, i) => (
          <motion.li
            key={t.hash}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, ease }}
            className="relative pl-8 pb-10 last:pb-0"
          >
            <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-bg border-2 border-accent" />
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-subtle">
              <span className="font-mono text-accent">{t.hash}</span>
              <span>·</span>
              <span>{new Date(`${t.date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span>·</span>
              <span>Change {i + 1}</span>
            </div>
            <h2 className="mt-1 font-extrabold text-fg">{t.title}</h2>
            <p className="mt-1.5 text-sm text-muted leading-relaxed">{t.plain}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.lessons.map((id) => (
                <a
                  key={id}
                  href={`#/lesson/${id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border border-line text-[11px] font-bold text-fg hover:border-accent/50"
                >
                  <BookOpen size={11} className="text-accent" /> {lessonById[id].title}
                </a>
              ))}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function Glossary() {
  const [q, setQ] = useState('');
  const entries = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return Object.values(glossary)
      .filter((e) => !needle || e.term.toLowerCase().includes(needle) || e.def.toLowerCase().includes(needle))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [q]);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-fg">Glossary</h1>
      <p className="mt-4 text-muted">Every technical word used in the lessons, in plain English.</p>
      <label className="mt-8 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-line focus-within:border-accent">
        <Search size={16} className="text-subtle" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms…" className="flex-1 bg-transparent outline-none text-fg text-sm" />
      </label>
      <dl className="mt-6 grid gap-3">
        {entries.map((e) => (
          <div key={e.term} className="p-4 rounded-2xl bg-surface border border-line">
            <dt className="font-extrabold text-fg">{e.term}</dt>
            <dd className="mt-1 text-sm text-muted leading-relaxed">{e.def}</dd>
          </div>
        ))}
        {!entries.length && <p className="text-sm text-muted">No terms match “{q}”.</p>}
      </dl>
    </div>
  );
}

// ---------------------------------------------------------------- app

export default function LearnApp() {
  const route = useRoute();
  const { progress, setDone, answer, resetQuiz, resetAll } = useProgress();
  const doneCount = lessons.filter((l) => progress.done[l.id]).length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-bg">
        <Header route={route} doneCount={doneCount} />
        {/* Not <main>: the site's dark-mode text halo (.dark main …) is only meant for text over the code matrix */}
        <div role="main">
          {route.view === 'home' && <Home progress={progress} resetAll={resetAll} />}
          {route.view === 'lesson' && <Lesson id={route.id} progress={progress} setDone={setDone} answer={answer} resetQuiz={resetQuiz} />}
          {route.view === 'timeline' && <Timeline />}
          {route.view === 'glossary' && <Glossary />}
        </div>
        <footer className="border-t border-line mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-3 text-xs text-subtle">
            <span>Progress is saved in this browser only.</span>
            <a href="./index.html" className="font-bold text-muted hover:text-fg">
              ← Back to the portfolio
            </a>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
