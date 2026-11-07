import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ExternalLink, GitCommitHorizontal, GraduationCap } from 'lucide-react';
import { categories, changelog, commitUrl, phases, totalCommits } from '../data/changelog';
import { Counter, Reveal, SectionHeading, Spotlight, ease } from './motion';

const fmt = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const DAY = 24 * 60 * 60 * 1000;
const PREVIEW = 6; // entries shown before "Show all"

const CATEGORY_STYLE = {
  design: 'bg-violet-500/12 text-violet-700 dark:text-violet-300',
  feature: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  learning: 'bg-accent/12 text-accent',
  performance: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  app: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  privacy: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
  infra: 'bg-slate-500/12 text-slate-700 dark:text-slate-300',
};

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
        active ? 'bg-fg text-bg border-fg' : 'bg-surface border-line text-muted hover:text-fg hover:border-accent/40'
      }`}
    >
      {children}
    </button>
  );
}

function Entry({ entry, latest, index }) {
  const phase = phases.find((p) => p.id === entry.phase);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.45, ease, delay: Math.min(index, 6) * 0.04 }}
      className="relative pl-9 md:pl-11 pb-7 last:pb-0"
    >
      <span className={`absolute left-[-7px] top-1.5 w-4 h-4 rounded-full border-4 border-bg ${latest ? 'bg-accent' : 'bg-line-strong'}`}>
        {latest && <span className="absolute inset-[-6px] rounded-full bg-accent/30 animate-ping" />}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <time dateTime={entry.date} className={`eyebrow ${latest ? 'text-accent' : 'text-subtle'}`}>
          {fmt(entry.date)}
        </time>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${CATEGORY_STYLE[entry.category]}`}>{categories[entry.category]}</span>
        {latest && <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-extrabold uppercase tracking-widest">Latest</span>}
        <span className="text-[11px] font-semibold text-subtle hidden sm:inline">· {phase.title}</span>
      </div>
      <Spotlight className="mt-2.5 rounded-2xl bg-surface border border-line p-5 shadow-soft hover:border-line-strong transition-colors">
        <h3 className="text-lg font-extrabold text-fg leading-snug">{entry.title}</h3>
        <p className="mt-1.5 text-sm text-muted leading-relaxed">{entry.plain}</p>
        {(entry.commits.length > 0 || entry.lessons?.length > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {entry.commits.slice(0, 4).map((h) => (
              <a
                key={h}
                href={commitUrl(h)}
                target="_blank"
                rel="noreferrer"
                title="View this change on GitHub"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 border border-line font-mono text-[11px] text-muted hover:text-fg hover:border-accent/40"
              >
                <GitCommitHorizontal size={11} /> {h}
              </a>
            ))}
            {entry.commits.length > 4 && <span className="text-[11px] font-semibold text-subtle">+{entry.commits.length - 4} more</span>}
            {entry.lessons?.length > 0 && (
              <a
                href={`learn.html#/c/site/${entry.lessons[0]}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-accent/30 text-[11px] font-bold text-accent hover:border-accent/60"
              >
                <GraduationCap size={12} /> How it works
              </a>
            )}
          </div>
        )}
      </Spotlight>
    </motion.li>
  );
}

/** "Site updates": every change to the website since the first page, newest first. */
export default function Updates() {
  const [phase, setPhase] = useState('all');
  const [category, setCategory] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const newestFirst = useMemo(() => changelog.map((e, i) => ({ ...e, order: i })).reverse(), []);
  const latestOrder = changelog.length - 1;
  const filtered = newestFirst.filter((e) => (phase === 'all' || e.phase === phase) && (category === 'all' || e.category === category));
  const visible = showAll ? filtered : filtered.slice(0, PREVIEW);
  const first = changelog[0].date;
  const last = changelog[changelog.length - 1].date;
  const days = Math.round((new Date(last) - new Date(first)) / DAY) + 1;
  const usedCategories = Object.keys(categories).filter((c) => changelog.some((e) => e.category === c));

  return (
    <section id="updates" className="relative py-28 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <SectionHeading eyebrow="Changelog" title="How this site evolved" className="mb-10">
          Every change since the first page went up in July 2026, newest first: what changed and why, in plain words, with links to the code on GitHub.
        </SectionHeading>

        <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            [changelog.length, 'updates'],
            [totalCommits, 'commits'],
            [phases.length, 'major versions'],
            [days, 'days since the first page'],
          ].map(([n, label]) => (
            <div key={label} className="p-4 rounded-2xl bg-surface border border-line shadow-soft">
              <div className="text-3xl font-extrabold text-fg tabular-nums">
                <Counter value={n} />
              </div>
              <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-subtle">{label}</div>
            </div>
          ))}
        </Reveal>

        <Reveal className="grid md:grid-cols-3 gap-3 mb-6">
          {phases.map((p, i) => {
            const count = changelog.filter((e) => e.phase === p.id).length;
            const active = phase === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setPhase(active ? 'all' : p.id);
                  setShowAll(false);
                }}
                className={`text-left p-4 rounded-2xl border transition-colors ${active ? 'border-accent bg-accent/5 shadow-soft' : 'border-line bg-surface hover:border-accent/40'}`}
              >
                <span className="flex items-center justify-between">
                  <span className="eyebrow text-accent">
                    {i + 1}. {p.period}
                  </span>
                  <span className="text-[11px] font-bold text-subtle">{count} updates</span>
                </span>
                <span className="mt-1.5 block font-extrabold text-fg">{p.title}</span>
                <span className="mt-1 block text-xs text-muted leading-snug">{p.blurb}</span>
              </button>
            );
          })}
        </Reveal>

        <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter by type of change">
          <Chip
            active={category === 'all'}
            onClick={() => {
              setCategory('all');
              setShowAll(false);
            }}
          >
            All types
          </Chip>
          {usedCategories.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => {
                setCategory(category === c ? 'all' : c);
                setShowAll(false);
              }}
            >
              {categories[c]}
            </Chip>
          ))}
        </div>

        <ol className="relative border-l-2 border-line ml-1.5">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((e, i) => (
              <Entry key={e.order} entry={e} latest={e.order === latestOrder} index={i} />
            ))}
          </AnimatePresence>
        </ol>
        {!filtered.length && <p className="text-muted">No updates of this type in this period.</p>}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {filtered.length > PREVIEW && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fg text-bg text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {showAll ? 'Show fewer' : `Show all ${filtered.length} updates`}
              <ChevronDown size={16} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>
          )}
          <a
            href="learn.html#/timeline"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-line bg-surface text-sm font-bold text-muted hover:text-fg hover:border-accent/40 transition-colors"
          >
            <GraduationCap size={16} /> Learn how each change was made
          </a>
          <a
            href="https://github.com/shivam1411-oss/Shivam_Portfolio/commits/main"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-subtle hover:text-fg"
          >
            Full history on GitHub <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
