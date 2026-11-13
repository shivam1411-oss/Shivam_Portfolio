import { Suspense, lazy, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Lock, Check, CheckCircle2, ChevronDown, Circle, Globe2, Lightbulb, RotateCcw, Search, Sparkles, XCircle } from 'lucide-react';
import { Code, btn } from '../ui';
import PyRunner from '../python/PyRunner';
import ReactRunner from '../react/LazyReactRunner';
import { LEVELS } from './util';
import { kbLoaders } from './data';
import { kbCatalog } from '../catalog';
import { getAccessVersion, subscribeAccess } from '../access';
import { UnlockCard } from '../Paywall';

const Editor = lazy(() => import('../python/Editor'));
// The Jira and Kubernetes playgrounds load only when a topic that uses them is opened.
const JqlSandbox = lazy(() => import('../jira/widgets').then((m) => ({ default: m.JqlSandbox })));
const ClusterLab = lazy(() => import('../k8s/widgets').then((m) => ({ default: m.ClusterLab })));

// ---------------------------------------------------------------- progress ("I understand this")

const STORE = 'kb-understood';
const readUnderstood = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE) || '{}');
  } catch {
    return {};
  }
};
function useUnderstood() {
  const [map, setMap] = useState(readUnderstood);
  const toggle = (key) =>
    setMap((m) => {
      const next = { ...m };
      if (next[key]) delete next[key];
      else next[key] = true;
      try {
        localStorage.setItem(STORE, JSON.stringify(next));
      } catch {
        /* storage blocked: keep it for this visit only */
      }
      return next;
    });
  return [map, toggle];
}

// ---------------------------------------------------------------- small pieces

/** Text with **bold** and `code`. */
function Rich({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <b key={i} className="text-fg">{p.slice(2, -2)}</b>;
    if (p.startsWith('`') && p.endsWith('`'))
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-surface-2 border border-line font-mono text-[0.85em] text-fg">
          {p.slice(1, -1)}
        </code>
      );
    return <span key={i}>{p}</span>;
  });
}

const LEVEL_STYLE = {
  beginner: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  intermediate: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  advanced: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  expert: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
};
const levelTitle = (id) => LEVELS.find((l) => l.id === id)?.title;

function LevelBadge({ level }) {
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${LEVEL_STYLE[level]}`}>{levelTitle(level)}</span>;
}

const LANG_LABEL = { python: 'Python', jsx: 'React (JSX)', html: 'HTML · CSS · JavaScript', js: 'JavaScript', sql: 'SQL', yaml: 'YAML', bash: 'Terminal', toml: 'pyproject.toml', jql: 'JQL', text: 'Example' };

/** A live HTML page: edit on the left, see it render in a sandboxed frame. */
function HtmlRunner({ code }) {
  const [src, setSrc] = useState(code);
  const [shown, setShown] = useState(code);
  useEffect(() => {
    const t = setTimeout(() => setShown(src), 400);
    return () => clearTimeout(t);
  }, [src]);
  const doc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:system-ui,sans-serif;margin:12px;color:#111;background:#fff}</style></head><body>${shown}</body></html>`;
  return (
    <div className="my-4 rounded-2xl border border-line bg-surface shadow-soft overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-line bg-surface-2/60">
        <span className="eyebrow text-accent">Live page · edit and watch</span>
        <button type="button" className={`${btn} !px-3 !py-1 !text-xs`} onClick={() => setSrc(code)}>
          <RotateCcw size={12} /> Reset
        </button>
      </div>
      <div className="grid lg:grid-cols-2">
        <div className="min-w-0 border-b lg:border-b-0 lg:border-r border-line">
          <Suspense fallback={<pre className="m-0 p-3 bg-[#0d1014] text-[#d6f5f0] font-mono text-[12px] whitespace-pre-wrap">{src}</pre>}>
            <Editor value={src} onChange={setSrc} language="jsx" label="HTML code" />
          </Suspense>
        </div>
        <iframe title="Live preview" sandbox="allow-scripts" srcDoc={doc} className="w-full h-72 lg:h-auto lg:min-h-[18rem] bg-white" />
      </div>
    </div>
  );
}

function Example({ topic, courseId }) {
  const { code, lang, run, note } = topic;
  if (!code) return null;
  if (run && lang === 'python') return <PyRunner code={code} title="Try it" storageKey={`kb-code:${courseId}/${topic.id}`} />;
  if (run && lang === 'jsx') return <ReactRunner code={code} title="Try it" storageKey={`kb-code:${courseId}/${topic.id}`} />;
  if (run && lang === 'html') return <HtmlRunner code={code} />;
  const loading = <div className="my-4 p-6 rounded-2xl border border-line bg-surface text-sm text-muted">Loading the playground…</div>;
  if (run && lang === 'jql')
    return (
      <Suspense fallback={loading}>
        <JqlSandbox initial={code} />
      </Suspense>
    );
  if (run && lang === 'yaml')
    return (
      <Suspense fallback={loading}>
        {topic.setup ? (
      <ClusterLab title="Practice cluster" setup={code} suggestions={topic.suggestions || []} hint="This cluster already runs the YAML shown in the lesson. Type a command or click a suggestion." />
    ) : (
      <ClusterLab title="Practice cluster" yaml={code} suggestions={topic.suggestions || []} hint="Edit the manifest, then run kubectl apply -f manifest.yaml." />
        )}
      </Suspense>
    );
  return <Code file={LANG_LABEL[lang] || 'Example'} note={note}>{code}</Code>;
}

function CheckYourself({ check }) {
  const [picked, setPicked] = useState(null);
  const right = picked === check.answer;
  return (
    <div className="mt-5 p-4 rounded-2xl bg-surface-2/70 border border-line">
      <div className="eyebrow text-accent mb-2">Check yourself</div>
      <p className="font-bold text-fg">{check.q}</p>
      <div className="mt-3 grid sm:grid-cols-2 gap-2">
        {check.options.map((o, i) => {
          const state = picked === null ? '' : i === check.answer ? '!border-accent bg-accent/10' : i === picked ? '!border-amber-500 bg-amber-500/10' : 'opacity-60';
          return (
            <button key={o} type="button" onClick={() => setPicked(i)} className={`text-left px-3 py-2 rounded-xl border border-line bg-surface text-sm text-fg hover:border-accent/50 transition-colors ${state}`}>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className={`mt-3 text-sm flex gap-2 ${right ? 'text-accent' : 'text-amber-700 dark:text-amber-300'}`} aria-live="polite">
          {right ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <XCircle size={16} className="shrink-0 mt-0.5" />}
          <span>
            <b>{right ? 'Correct.' : 'Not quite.'}</b> {check.why}
          </span>
        </p>
      )}
    </div>
  );
}

function Topic({ topic, course, open, onToggle, understood, onUnderstood }) {
  const ref = useRef(null);
  const lesson = topic.lesson && course.lessons.find((l) => l.id === topic.lesson);
  useEffect(() => {
    if (open && window.location.hash.endsWith(`/${topic.id}`)) ref.current?.scrollIntoView({ block: 'start' });
  }, [open, topic.id]);
  return (
    <article ref={ref} id={`kb-${topic.id}`} className={`scroll-mt-24 rounded-2xl border bg-surface transition-colors ${open ? 'border-accent/40 shadow-soft' : 'border-line hover:border-accent/30'}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="w-full text-left flex items-start gap-3 p-4 md:p-5">
        <span className="mt-0.5 shrink-0">{understood ? <CheckCircle2 size={20} className="text-accent" /> : <Circle size={20} className="text-subtle" />}</span>
        <span className="flex-1 min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <LevelBadge level={topic.level} />
            <span className="font-extrabold text-fg">{topic.title}</span>
          </span>
          <span className="mt-1 block text-sm text-muted leading-relaxed">{topic.summary}</span>
        </span>
        <ChevronDown size={18} className={`shrink-0 mt-1 text-subtle transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 md:px-5 pb-5 md:pl-12">
          {topic.body.map((p, i) => (
            <p key={i} className="my-3 leading-relaxed text-muted">
              <Rich text={p} />
            </p>
          ))}
          <Example topic={topic} courseId={course.id} />
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            <div className="p-4 rounded-2xl bg-surface-2/70 border border-line">
              <div className="eyebrow text-subtle mb-2 flex items-center gap-1.5">
                <Lightbulb size={13} /> Key points
              </div>
              <ul className="space-y-1.5">
                {topic.points.map((pt) => (
                  <li key={pt} className="flex gap-2 text-sm text-fg leading-snug">
                    <Check size={14} className="text-accent shrink-0 mt-0.5" /> <span><Rich text={pt} /></span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-2xl bg-surface-2/70 border border-line">
              <div className="eyebrow text-subtle mb-2 flex items-center gap-1.5">
                <Globe2 size={13} /> In the real world
              </div>
              <p className="text-sm text-fg leading-relaxed">{topic.realWorld}</p>
            </div>
          </div>
          {topic.check && <CheckYourself check={topic.check} />}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={onUnderstood} className={`${btn} ${understood ? '!border-accent !text-accent' : ''}`}>
              {understood ? <CheckCircle2 size={15} /> : <Circle size={15} />} {understood ? 'Understood' : 'Mark as understood'}
            </button>
            {lesson && (
              <a href={`#/c/${course.id}/${lesson.id}`} className={btn}>
                <BookOpen size={15} /> Practise in the lesson: {lesson.title}
              </a>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------- pages

function Progress({ value }) {
  return (
    <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}

function KbHub({ courses, icons, understood }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <section className="relative">
        <div className="glow-accent absolute -top-24 -left-24 w-[min(36rem,100vw)] h-[min(36rem,100vw)] opacity-70 -z-10" />
        <div className="eyebrow text-accent flex items-center gap-2">
          <span className="h-px w-8 bg-accent/60" /> Knowledge base
        </div>
        <h1 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight text-fg max-w-3xl leading-[1.05]">
          From <span className="text-gradient">beginner</span> to expert
        </h1>
        <p className="mt-5 text-lg text-muted max-w-2xl leading-relaxed">
          A reference for every course, in four levels. Start at Beginner, where nothing is assumed, and climb to Expert. Each topic explains the idea in plain words, gives an example you can run or read, a real-world use outside collections, and a quick question to check yourself.
        </p>
      </section>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {courses.map((c) => {
          const kb = kbCatalog[c.id];
          if (!kb) return null;
          const Icon = icons[c.icon] || BookOpen;
          const done = kb.topics.filter((t) => understood[`${c.id}/${t.id}`]).length;
          return (
            <a key={c.id} href={`#/kb/${c.id}`} className="group p-6 rounded-[1.75rem] bg-surface border border-line hover:border-accent/50 shadow-soft transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl bg-accent/12 text-accent flex items-center justify-center">
                  <Icon size={22} />
                </span>
                <span className="flex-1">
                  <span className="block font-extrabold text-lg text-fg group-hover:text-accent">{c.title}</span>
                  <span className="block text-xs text-subtle font-semibold">
                    {kb.topics.length} topics · {done} understood
                  </span>
                </span>
                <ArrowRight size={18} className="text-subtle group-hover:text-accent" />
              </div>
              <p className="mt-3 text-sm text-muted leading-relaxed">{kb.intro}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {LEVELS.map((l) => (
                  <LevelBadge key={l.id} level={l.id} />
                ))}
              </div>
              <div className="mt-4">
                <Progress value={done / kb.topics.length} />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function KbCourse({ course, topicId, understood, toggleUnderstood }) {
  const [kb, setKb] = useState(null);
  const [failed, setFailed] = useState(false);
  const [locked, setLocked] = useState(false);
  const access = useSyncExternalStore(subscribeAccess, getAccessVersion);
  useEffect(() => {
    let live = true;
    setKb(null);
    setFailed(false);
    setLocked(false);
    kbLoaders[course.id]().then(
      (data) => live && setKb(data),
      (e) => live && (e?.locked ? setLocked(true) : setFailed(true))
    );
    return () => {
      live = false;
    };
  }, [course.id, access]);
  if (locked) return <KbLocked course={course} />;
  if (failed)
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <p className="text-muted">The knowledge base could not be downloaded. Check your connection, or the site may have just been updated.</p>
        <button type="button" className={`${btn} mt-4`} onClick={() => window.location.reload()}>
          <RotateCcw size={15} /> Reload
        </button>
      </div>
    );
  if (!kb)
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16" aria-busy="true">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-fg">{course.title}</h1>
        <p className="mt-4 text-muted">Loading the knowledge base…</p>
      </div>
    );
  return <KbTopics course={course} kb={kb} topicId={topicId} understood={understood} toggleUnderstood={toggleUnderstood} />;
}

/** A paid course's knowledge base before purchase: what it covers, and how to unlock it. */
function KbLocked({ course }) {
  const meta = kbCatalog[course.id];
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <a href="#/kb" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-fg">
        <ArrowLeft size={15} /> All knowledge bases
      </a>
      <div className="mt-6 eyebrow text-accent flex items-center gap-2">
        <span className="h-px w-8 bg-accent/60" /> Knowledge base · {meta.topics.length} topics · included with the course
      </div>
      <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-fg">{course.title}</h1>
      <p className="mt-4 text-muted leading-relaxed max-w-3xl">{meta.intro}</p>
      <div className="mt-6 max-w-2xl">
        <UnlockCard course={course} compact />
      </div>
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {LEVELS.map((l) => (
          <section key={l.id} className="p-5 rounded-2xl bg-surface border border-line">
            <LevelBadge level={l.id} />
            <ul className="mt-3 space-y-1.5">
              {meta.topics
                .filter((t) => t.level === l.id)
                .map((t) => (
                  <li key={t.id} className="flex gap-2 text-sm text-muted leading-snug">
                    <Lock size={13} className="shrink-0 mt-0.5 text-subtle" /> {t.title}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function KbTopics({ course, kb, topicId, understood, toggleUnderstood }) {
  const [level, setLevel] = useState(() => kb.topics.find((t) => t.id === topicId)?.level || 'all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(() => new Set(topicId ? [topicId] : []));

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      kb.topics.filter(
        (t) => (level === 'all' || t.level === level) && (!q || [t.title, t.summary, ...t.body, ...t.points, t.realWorld].join(' ').toLowerCase().includes(q))
      ),
    [kb, level, q]
  );
  const toggleOpen = (id) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const key = (t) => `${course.id}/${t.id}`;
  const total = kb.topics.filter((t) => understood[key(t)]).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="flex flex-wrap gap-4">
        <a href="#/kb" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-fg">
          <ArrowLeft size={15} /> All knowledge bases
        </a>
        <a href={`#/c/${course.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-fg">
          <BookOpen size={15} /> {course.title} course
        </a>
      </div>
      <div className="mt-6 eyebrow text-accent flex items-center gap-2">
        <span className="h-px w-8 bg-accent/60" /> Knowledge base · {kb.topics.length} topics
      </div>
      <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-fg">{course.title}</h1>
      <p className="mt-4 text-muted leading-relaxed max-w-3xl">{kb.intro}</p>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {LEVELS.map((l, i) => {
          const items = kb.topics.filter((t) => t.level === l.id);
          const done = items.filter((t) => understood[key(t)]).length;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setLevel(level === l.id ? 'all' : l.id)}
              aria-pressed={level === l.id}
              className={`text-left p-4 rounded-2xl border bg-surface transition-colors ${level === l.id ? 'border-accent shadow-soft' : 'border-line hover:border-accent/40'}`}
            >
              <span className="flex items-center justify-between">
                <LevelBadge level={l.id} />
                <span className="text-[11px] font-bold text-subtle">Step {i + 1}</span>
              </span>
              <span className="mt-2 block text-xs text-muted leading-snug min-h-[2.5rem]">{l.blurb}</span>
              <span className="mt-2 block text-[11px] font-bold text-subtle">
                {done}/{items.length} understood
              </span>
              <span className="mt-1.5 block">
                <Progress value={done / items.length} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex-1 min-w-[14rem] flex items-center gap-2 px-3 py-2 rounded-xl border border-line bg-surface focus-within:border-accent">
          <Search size={15} className="text-subtle" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search the ${course.title} knowledge base`} className="flex-1 bg-transparent outline-none text-sm text-fg" aria-label="Search topics" />
        </label>
        <span className="text-sm text-muted">
          <Sparkles size={14} className="inline -mt-0.5 text-accent" /> {total} of {kb.topics.length} understood
        </span>
        {level !== 'all' && (
          <button type="button" className={`${btn} !py-1.5 !text-xs`} onClick={() => setLevel('all')}>
            Show all levels
          </button>
        )}
      </div>

      {LEVELS.filter((l) => visible.some((t) => t.level === l.id)).map((l) => (
        <section key={l.id} aria-label={`${l.title} topics`} className="mt-8">
          <h2 className="flex items-center gap-3 text-xl font-extrabold text-fg">
            <LevelBadge level={l.id} /> {l.title}
          </h2>
          <p className="mt-1 text-sm text-muted">{l.blurb}</p>
          <div className="mt-4 space-y-3">
            {visible
              .filter((t) => t.level === l.id)
              .map((t) => (
                <Topic
                  key={t.id}
                  topic={t}
                  course={course}
                  open={open.has(t.id)}
                  onToggle={() => toggleOpen(t.id)}
                  understood={!!understood[key(t)]}
                  onUnderstood={() => toggleUnderstood(key(t))}
                />
              ))}
          </div>
        </section>
      ))}
      {!visible.length && <p className="mt-10 text-muted">No topics match “{query}”.</p>}
    </div>
  );
}

/** #/kb lists every course's knowledge base; #/kb/<course>[/<topic>] shows one. */
export default function KnowledgeBase({ course, topicId, courses, icons }) {
  const [understood, toggle] = useUnderstood();
  if (course && kbLoaders[course.id]) return <KbCourse key={course.id} course={course} topicId={topicId} understood={understood} toggleUnderstood={toggle} />;
  return <KbHub courses={courses} icons={icons} understood={understood} />;
}
