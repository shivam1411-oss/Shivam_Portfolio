import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Code2,
  FlaskConical,
  GitCommitHorizontal,
  GraduationCap,
  History,
  Layers,
  LibraryBig,
  ListTree,
  RotateCcw,
  Search,
  Sparkles,
  SquareTerminal,
  Target,
  XCircle,
} from 'lucide-react';
import CodeTrail from '../components/CodeTrail';
import CursorReveal from '../components/CursorReveal';
import ThemeToggle from '../components/ThemeToggle';
import { ease } from '../components/motion';
import { courseById, courses, lessonHash, lessonKey } from './courses';
import { glossary } from './glossary';
import Landing from './Landing';
import PyRunner from './python/PyRunner';
import { warmUp } from './python/runtime';
import { timeline } from './timeline';
import { btn, btnPrimary } from './ui';

const courseIcons = { site: Code2, python: SquareTerminal };
const allLessons = courses.flatMap((c) => c.lessons.map((l) => ({ course: c, lesson: l })));

// ---------------------------------------------------------------- routing and progress

const parseHash = () => {
  const [view, a, b] = window.location.hash.replace(/^#\/?/, '').split('/');
  if (view === 'c' && courseById[a]) {
    const course = courseById[a];
    const lesson = course.lessons.find((l) => l.id === b);
    return lesson ? { view: 'lesson', course, lesson } : { view: 'course', course };
  }
  // Links from before there were several courses: #/lesson/<id> was a "Learn the Code" lesson.
  if (view === 'lesson') {
    const lesson = courseById.site.lessons.find((l) => l.id === a);
    if (lesson) return { view: 'lesson', course: courseById.site, lesson };
  }
  if (view === 'timeline' || view === 'glossary' || view === 'playground') return { view };
  if (view === 'courses') return { view: 'hub' };
  return { view: 'landing' };
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
// Progress from the single-course version used bare lesson ids; those belong to "Learn the Code".
const withCourse = (obj = {}) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.includes('/') ? k : `site/${k}`, v]));
const loadProgress = () => {
  try {
    const p = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    return { done: withCourse(p.done), answers: withCourse(p.answers), solved: p.solved || {} };
  } catch {
    return { done: {}, answers: {}, solved: {} };
  }
};

/** Completed lessons, quiz answers and solved exercises, remembered in this browser. */
function useProgress() {
  const [progress, setProgress] = useState(loadProgress);
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(progress));
    } catch {
      /* storage unavailable: progress lasts for this visit only */
    }
  }, [progress]);

  const setDone = useCallback((key, done = true) => setProgress((p) => ({ ...p, done: { ...p.done, [key]: done } })), []);
  const answer = useCallback(
    (key, qi, choice) => setProgress((p) => ({ ...p, answers: { ...p.answers, [key]: { ...p.answers[key], [qi]: choice } } })),
    []
  );
  const solve = useCallback((key) => setProgress((p) => (p.solved[key] ? p : { ...p, solved: { ...p.solved, [key]: true } })), []);
  const resetQuiz = useCallback((key) => setProgress((p) => ({ ...p, answers: { ...p.answers, [key]: {} } })), []);
  const resetCourse = useCallback(
    (course) =>
      setProgress((p) => {
        const keep = (obj) => Object.fromEntries(Object.entries(obj).filter(([k]) => !k.startsWith(`${course.id}/`)));
        return { done: keep(p.done), answers: keep(p.answers), solved: keep(p.solved) };
      }),
    []
  );
  return { progress, setDone, answer, solve, resetQuiz, resetCourse };
}

const go = (hash) => {
  window.location.hash = hash;
};

const courseStats = (course, progress) => {
  const done = course.lessons.filter((l) => progress.done[lessonKey(course, l)]).length;
  const minutes = course.lessons.reduce((s, l) => s + l.minutes, 0);
  const exercises = course.lessons.reduce((s, l) => s + (l.exercises?.length || 0), 0);
  const next = course.lessons.find((l) => !progress.done[lessonKey(course, l)]);
  return { done, total: course.lessons.length, minutes, exercises, next };
};

const roundMinutes = (m) => (m >= 60 ? `about ${Math.round(m / 30) / 2} hours` : `about ${Math.round(m / 10) * 10} minutes`);

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

function Eyebrow({ children }) {
  return (
    <div className="eyebrow text-accent mb-4 flex items-center gap-3">
      <span className="h-px w-8 bg-accent/60" /> {children}
    </div>
  );
}

function Header({ route, progress }) {
  const done = allLessons.filter(({ course, lesson }) => progress.done[lessonKey(course, lesson)]).length;
  const links = [
    { hash: '#/courses', label: 'Courses', Icon: LibraryBig, active: ['hub', 'course', 'lesson', 'timeline'].includes(route.view) },
    { hash: '#/playground', label: 'Playground', Icon: SquareTerminal, active: route.view === 'playground' },
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
            <span className="block font-extrabold text-fg text-sm">Learning Lab</span>
            <span className="block text-[11px] text-subtle font-semibold">Interactive courses</span>
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
        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold" title="Lessons completed, all courses">
          <CheckCircle2 size={13} /> {done}/{allLessons.length}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- hub

function CourseCard({ course, progress, index }) {
  const s = courseStats(course, progress);
  const Icon = courseIcons[course.icon] || BookOpen;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: 0.1 + index * 0.08 }}
      className="flex flex-col p-6 md:p-7 rounded-[1.75rem] bg-surface border border-line shadow-soft"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="w-12 h-12 rounded-2xl bg-accent/12 text-accent flex items-center justify-center">
          <Icon size={24} />
        </span>
        <div className="relative">
          <ProgressRing value={s.done / s.total} size={52} />
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-fg">{Math.round((s.done / s.total) * 100)}%</span>
        </div>
      </div>
      <div className="mt-4 eyebrow text-subtle">{course.levels}</div>
      <h2 className="mt-1 text-2xl font-extrabold text-fg">{course.title}</h2>
      <p className="mt-1 text-sm font-semibold text-fg/80">{course.tagline}</p>
      <p className="mt-3 text-sm text-muted leading-relaxed flex-1">{course.blurb}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-muted">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-line">
          <Layers size={12} /> {course.modules.length} modules
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-line">
          <BookOpen size={12} /> {s.total} lessons
        </span>
        {s.exercises > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-line">
            <FlaskConical size={12} /> {s.exercises} coding exercises
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-line">
          <Clock size={12} /> {roundMinutes(s.minutes)}
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <a href={`#/c/${course.id}`} className={btn}>
          Course outline
        </a>
        {s.next && (
          <a href={lessonHash(course, s.next)} className={btnPrimary}>
            {s.done ? 'Continue' : 'Start'} <ArrowRight size={15} />
          </a>
        )}
      </div>
    </motion.div>
  );
}

function Hub({ progress }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <section className="relative">
        <div className="glow-accent absolute -top-24 -left-24 w-[36rem] h-[36rem] opacity-70 -z-10" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <Eyebrow>
            Learning Lab · {courses.length} courses · {allLessons.length} lessons
          </Eyebrow>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-fg max-w-3xl leading-[1.05]">
            Learn by <span className="text-gradient">doing</span>
          </h1>
          <p className="mt-5 text-lg text-muted max-w-2xl leading-relaxed">
            Short lessons with playgrounds you can poke at, code you can run and test right in the browser, and a quiz at the end of each one. Pick a course; your
            progress is saved as you go.
          </p>
        </motion.div>
      </section>

      <section aria-label="Courses" className="mt-12 grid gap-6 md:grid-cols-2">
        {courses.map((c, i) => (
          <CourseCard key={c.id} course={c} progress={progress} index={i} />
        ))}
      </section>

      <section aria-label="Tools and reference" className="mt-6 grid gap-6 md:grid-cols-3">
        <a href="#/playground" className="p-6 rounded-[1.75rem] border border-line hover:border-accent/40 transition-colors">
          <SquareTerminal className="text-accent" size={22} />
          <div className="mt-3 font-extrabold text-fg">Python playground</div>
          <p className="mt-1 text-sm text-muted">A blank editor to try anything in Python. Your code is kept in this browser.</p>
        </a>
        <a href="#/glossary" className="p-6 rounded-[1.75rem] border border-line hover:border-accent/40 transition-colors">
          <ListTree className="text-accent" size={22} />
          <div className="mt-3 font-extrabold text-fg">Glossary</div>
          <p className="mt-1 text-sm text-muted">{Object.keys(glossary).length} terms from every course, explained without jargon.</p>
        </a>
        <a href="#/timeline" className="p-6 rounded-[1.75rem] border border-line hover:border-accent/40 transition-colors">
          <History className="text-accent" size={22} />
          <div className="mt-3 font-extrabold text-fg">What changed on the site</div>
          <p className="mt-1 text-sm text-muted">All {timeline.length} changes to the portfolio in plain words, linked to lessons.</p>
        </a>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- course home

function CourseHome({ course, progress, resetCourse }) {
  const s = courseStats(course, progress);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <a href="#/courses" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-fg">
        <ArrowLeft size={15} /> All courses
      </a>
      <section className="relative mt-6">
        <div className="glow-accent absolute -top-24 -left-24 w-[36rem] h-[36rem] opacity-70 -z-10" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <Eyebrow>
            {course.levels} · {s.total} lessons · {roundMinutes(s.minutes)}
          </Eyebrow>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-fg max-w-3xl leading-[1.05]">{course.title}</h1>
          <p className="mt-3 text-xl font-semibold text-gradient inline-block">{course.tagline}</p>
          <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">{course.blurb}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="mt-8 flex flex-wrap items-center gap-5 p-5 rounded-2xl bg-surface border border-line shadow-soft max-w-2xl"
        >
          <div className="relative">
            <ProgressRing value={s.done / s.total} />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-fg">{Math.round((s.done / s.total) * 100)}%</span>
          </div>
          <div className="flex-1 min-w-[12rem]">
            <div className="font-extrabold text-fg">{!s.next ? 'Course complete. Nicely done!' : s.done ? 'Pick up where you left off' : 'Start with lesson 1'}</div>
            <div className="text-sm text-muted">{s.next ? `Next: ${s.next.title}` : 'Revisit any lesson, or try another course.'}</div>
          </div>
          <div className="flex gap-2">
            {s.next && (
              <a href={lessonHash(course, s.next)} className={btnPrimary}>
                {s.done ? 'Continue' : 'Start learning'} <ArrowRight size={15} />
              </a>
            )}
            {s.done > 0 && (
              <button type="button" onClick={() => resetCourse(course)} className={btn} title="Clear progress for this course">
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </motion.div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        {course.modules.map((m, mi) => {
          const items = course.lessons.filter((l) => l.module === m.id);
          const moduleDone = items.filter((l) => progress.done[lessonKey(course, l)]).length;
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
                  <div className="eyebrow text-subtle">
                    Module {mi + 1}
                    {m.level ? ` · ${m.level}` : ''}
                  </div>
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
                    <a href={lessonHash(course, l)} className="group flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-xl hover:bg-surface-2 transition-colors">
                      {progress.done[lessonKey(course, l)] ? <CheckCircle2 size={18} className="text-accent shrink-0" /> : <Circle size={18} className="text-subtle shrink-0" />}
                      <span className="flex-1 text-sm font-semibold text-fg">{l.title}</span>
                      {l.exercises?.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-subtle font-semibold" title="Coding exercises">
                          <FlaskConical size={11} /> {l.exercises.length}
                        </span>
                      )}
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

      {course.extras?.length > 0 && (
        <section className="mt-6 flex flex-wrap gap-3">
          {course.extras.map((x) => (
            <a key={x.hash} href={x.hash} className={btn}>
              <History size={15} /> {x.label}
            </a>
          ))}
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- lesson

function Quiz({ quiz, answers = {}, onAnswer, onReset }) {
  const total = quiz.length;
  const correct = quiz.filter((q, i) => answers[i] === q.answer).length;
  const passed = correct === total;

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
        {quiz.map((q, qi) => {
          const chosen = answers[qi];
          const answered = chosen !== undefined;
          const right = chosen === q.answer;
          return (
            <div key={qi}>
              <div className="font-bold text-fg whitespace-pre-line">
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
            <span className="flex-1 font-bold text-fg">All correct!</span>
            <button type="button" onClick={onReset} className={`${btn} !text-xs`}>
              <RotateCcw size={13} /> Retake quiz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Practice({ course, lesson, progress, solve }) {
  const key = lessonKey(course, lesson);
  const solvedCount = lesson.exercises.filter((e) => progress.solved[`${key}/${e.id}`]).length;
  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FlaskConical size={18} className="text-accent" />
          <h2 className="text-xl font-extrabold text-fg">Practice</h2>
        </div>
        <span className="text-sm font-bold text-muted">
          {solvedCount}/{lesson.exercises.length} solved
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">
        Write your code, then press <b className="text-fg">Check my answer</b> to run the tests. Your code is saved in this browser.
      </p>
      {lesson.exercises.map((ex, i) => {
        const exKey = `${key}/${ex.id}`;
        return (
          <div key={exKey} className="mt-8">
            <div className="font-extrabold text-fg">
              {i + 1}. {ex.title}
            </div>
            <p className="mt-1 text-sm text-muted leading-relaxed">{ex.prompt}</p>
            <PyRunner
              code={ex.starter}
              tests={ex.tests}
              stdin={ex.stdin}
              hint={ex.hint}
              solution={ex.solution}
              storageKey={`py-code:${exKey}`}
              passed={!!progress.solved[exKey]}
              onPass={() => solve(exKey)}
            />
          </div>
        );
      })}
    </section>
  );
}

function LessonNav({ course, currentId, progress, onPick }) {
  return (
    <nav aria-label={`${course.title} lessons`} className="space-y-5">
      <a href={`#/c/${course.id}`} onClick={onPick} className="flex items-center gap-2 px-3 font-extrabold text-fg hover:text-accent">
        <ArrowLeft size={14} /> {course.title}
      </a>
      {course.modules.map((m) => (
        <div key={m.id}>
          <div className="eyebrow text-subtle mb-2 px-3">{m.title}</div>
          <ul className="space-y-0.5">
            {course.lessons
              .filter((l) => l.module === m.id)
              .map((l) => {
                const active = l.id === currentId;
                return (
                  <li key={l.id}>
                    <a
                      href={lessonHash(course, l)}
                      onClick={onPick}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                        active ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg'
                      }`}
                    >
                      {progress.done[lessonKey(course, l)] ? <CheckCircle2 size={15} className="text-accent shrink-0" /> : <Circle size={15} className="text-subtle shrink-0" />}
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

function Lesson({ course, lesson, progress, setDone, answer, solve, resetQuiz }) {
  const key = lessonKey(course, lesson);
  const index = course.lessons.indexOf(lesson);
  const prev = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const mod = course.modules.find((m) => m.id === lesson.module);
  const done = !!progress.done[key];
  const [navOpen, setNavOpen] = useState(false);
  const Body = lesson.body;
  const quiz = lesson.quiz || [];
  const exercises = lesson.exercises || [];

  // The lesson completes itself the moment every quiz answer is right and every exercise is solved.
  const complete =
    (quiz.length > 0 || exercises.length > 0) &&
    quiz.every((q, i) => progress.answers[key]?.[i] === q.answer) &&
    exercises.every((e) => progress.solved[`${key}/${e.id}`]);
  const wasComplete = useRef(complete);
  useEffect(() => {
    if (complete && !wasComplete.current) setDone(key);
    wasComplete.current = complete;
  }, [complete, key, setDone]);

  useEffect(() => {
    setNavOpen(false);
    wasComplete.current = complete;
    // Start loading Python in the background so the first Run is quick.
    if (course.usesPython) {
      const t = setTimeout(warmUp, 1500);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 grid lg:grid-cols-[17rem_1fr] gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6 pr-1">
          <LessonNav course={course} currentId={lesson.id} progress={progress} />
        </div>
      </aside>

      <article className="min-w-0 max-w-3xl">
        <div className="lg:hidden mb-6">
          <button type="button" onClick={() => setNavOpen((o) => !o)} className={`${btn} w-full justify-between`} aria-expanded={navOpen}>
            <span className="flex items-center gap-2">
              <BookOpen size={15} /> {course.title} · Lesson {index + 1} of {course.lessons.length}
            </span>
            <ChevronDown size={16} className={`transition-transform ${navOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {navOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-2 p-3 rounded-2xl bg-surface-2 border border-line">
                  <LessonNav course={course} currentId={lesson.id} progress={progress} onPick={() => setNavOpen(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
          <div className="eyebrow text-accent flex items-center gap-3">
            <span className="h-px w-8 bg-accent/60" /> {course.title} · {mod.title} · Lesson {index + 1}
          </div>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight text-fg leading-tight">{lesson.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-line">
              <Clock size={12} /> {lesson.minutes} min
            </span>
            {mod.level && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-line">{mod.level}</span>}
            {exercises.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-line">
                <FlaskConical size={12} /> {exercises.length} exercise{exercises.length > 1 ? 's' : ''}
              </span>
            )}
            {lesson.commits?.map((c) => (
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

          {exercises.length > 0 && <Practice course={course} lesson={lesson} progress={progress} solve={solve} />}

          {quiz.length > 0 && (
            <Quiz key={key} quiz={quiz} answers={progress.answers[key]} onAnswer={(qi, oi) => answer(key, qi, oi)} onReset={() => resetQuiz(key)} />
          )}

          <AnimatePresence>
            {complete && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-accent/10 border border-accent/30 font-bold text-fg"
              >
                <Sparkles size={18} className="text-accent" /> Lesson complete!
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            {prev ? (
              <a href={lessonHash(course, prev)} className={btn}>
                <ArrowLeft size={15} /> <span className="max-w-[12rem] truncate">{prev.title}</span>
              </a>
            ) : (
              <a href={`#/c/${course.id}`} className={btn}>
                <ArrowLeft size={15} /> Course outline
              </a>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setDone(key, !done)} className={btn}>
                {done ? <RotateCcw size={14} /> : <Check size={14} />} {done ? 'Mark as not done' : 'Mark as done'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDone(key);
                  go(next ? lessonHash(course, next) : `#/c/${course.id}`);
                }}
                className={btnPrimary}
              >
                {next ? (
                  <>
                    Next: <span className="max-w-[12rem] truncate">{next.title}</span> <ArrowRight size={15} />
                  </>
                ) : (
                  <>
                    Finish course <Sparkles size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </article>
    </div>
  );
}

// ---------------------------------------------------------------- playground, timeline and glossary

const PLAYGROUND_START = `# Python playground: write anything and press Run (Ctrl/⌘ + Enter).
# Your code is saved in this browser. Only the standard library is available.

from statistics import mean

collections = {"Mon": 42000, "Tue": 38500, "Wed": 51000}
for day, amount in collections.items():
    print(f"{day}: ₹{amount:,}")
print(f"Average: ₹{mean(collections.values()):,.0f}")
`;

function Playground() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <Eyebrow>Python · runs in your browser</Eyebrow>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-fg">Playground</h1>
      <p className="mt-4 text-muted leading-relaxed max-w-2xl">
        A scratchpad for trying ideas from the Python course. Programs that read <code className="font-mono text-fg">input()</code> get an Input box below the editor.
        Nothing you write leaves your device.
      </p>
      <PyRunner code={PLAYGROUND_START} storageKey="py-code:playground" title="Scratchpad" />
      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        {[
          ['Run', 'Ctrl/⌘ + Enter, or the Run button.'],
          ['Stop', 'Ends a program that is taking too long. Anything over 15 seconds stops by itself.'],
          ['Reset', 'Puts the example code back. Your own code is replaced.'],
        ].map(([t, d]) => (
          <div key={t} className="p-4 rounded-2xl bg-surface border border-line">
            <div className="font-extrabold text-fg">{t}</div>
            <div className="mt-1 text-muted">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Timeline() {
  const site = courseById.site;
  const lessonOf = (id) => site.lessons.find((l) => l.id === id);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <a href={`#/c/${site.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-fg">
        <ArrowLeft size={15} /> {site.title}
      </a>
      <div className="mt-6">
        <Eyebrow>{timeline.length} changes</Eyebrow>
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
                  href={lessonHash(site, lessonOf(id))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border border-line text-[11px] font-bold text-fg hover:border-accent/50"
                >
                  <BookOpen size={11} className="text-accent" /> {lessonOf(id).title}
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
      <p className="mt-4 text-muted">Every technical word used in the courses, in plain English.</p>
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
  const { progress, setDone, answer, solve, resetQuiz, resetCourse } = useProgress();

  return (
    <MotionConfig reducedMotion="user">
      {/* Same background as the portfolio: film grain, code-token cursor trail, and the code matrix the cursor reveals */}
      <div className="grain" aria-hidden />
      <CodeTrail />
      <CursorReveal />
      {/* No background here, so the matrix (drawn behind the page) shows through */}
      <div className="min-h-screen">
        <Header route={route} progress={progress} />
        {/* <main> also gets the site's dark-mode text halo, which keeps words readable over the matrix */}
        <main>
          {route.view === 'landing' && <Landing progress={progress} />}
          {route.view === 'hub' && <Hub progress={progress} />}
          {route.view === 'course' && <CourseHome course={route.course} progress={progress} resetCourse={resetCourse} />}
          {route.view === 'lesson' && (
            <Lesson
              course={route.course}
              lesson={route.lesson}
              progress={progress}
              setDone={setDone}
              answer={answer}
              solve={solve}
              resetQuiz={resetQuiz}
            />
          )}
          {route.view === 'playground' && <Playground />}
          {route.view === 'timeline' && <Timeline />}
          {route.view === 'glossary' && <Glossary />}
        </main>
        <footer className="border-t border-line mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-3 text-xs text-subtle">
            <span>Progress and code are saved in this browser only.</span>
            <a href="./index.html" className="font-bold text-muted hover:text-fg">
              ← Back to the portfolio
            </a>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
