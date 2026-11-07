import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, CircleAlert, Eye, Lightbulb, Play, RotateCcw, Search, XCircle } from 'lucide-react';
import { Playground, btn, btnPrimary } from '../ui';
import { CURRENT_USER, STATUSES, TODAY, workItems } from './data';
import { runJql } from './jql';

const TYPE_ICON = { Epic: '⚡', Story: '📗', Task: '☑️', Bug: '🐞', 'Sub-task': '↳' };
const PRIORITY_COLOUR = { Highest: '#dc2626', High: '#ea580c', Medium: '#ca8a04', Low: '#2563eb', Lowest: '#64748b' };

function Results({ items }) {
  if (!items.length) return <p className="px-4 py-6 text-sm text-subtle text-center">No work items match this query.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-subtle border-b border-line">
            {['Key', 'Type', 'Summary', 'Status', 'Priority', 'Assignee', 'Sprint', 'Points'].map((h) => (
              <th key={h} className="px-3 py-2 font-bold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.key} className="border-b border-line last:border-0 align-top">
              <td className="px-3 py-1.5 font-mono font-bold text-accent whitespace-nowrap">{i.key}</td>
              <td className="px-3 py-1.5 whitespace-nowrap">
                {TYPE_ICON[i.type]} {i.type}
              </td>
              <td className="px-3 py-1.5 text-fg min-w-[14rem]">{i.summary}</td>
              <td className="px-3 py-1.5 whitespace-nowrap">
                <span className="px-1.5 py-0.5 rounded bg-surface-2 border border-line text-[11px] font-bold">{i.status}</span>
              </td>
              <td className="px-3 py-1.5 whitespace-nowrap font-semibold" style={{ color: PRIORITY_COLOUR[i.priority] }}>
                {i.priority}
              </td>
              <td className="px-3 py-1.5 whitespace-nowrap text-muted">{i.assignee || 'Unassigned'}</td>
              <td className="px-3 py-1.5 whitespace-nowrap text-muted">{i.sprint || '—'}</td>
              <td className="px-3 py-1.5 text-muted">{i.points ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function useJql(initial) {
  const [query, setQuery] = useState(initial);
  const result = useMemo(() => {
    try {
      return { items: runJql(query), error: null };
    } catch (e) {
      return { items: [], error: e.message };
    }
  }, [query]);
  return [query, setQuery, result];
}

/** A JQL search box over the sample site, with example queries to try. */
export function JqlSandbox({ initial = 'project = COLL AND status = "In Progress"', examples = [] }) {
  const [draft, setDraft] = useState(initial);
  const [query, setQuery, { items, error }] = useJql(initial);
  const run = (q) => {
    setDraft(q);
    setQuery(q);
  };
  return (
    <Playground title="JQL search" hint={`A sample Jira site: projects COLL (Collections Revamp) and PORT (Portfolio), ${workItems.length} work items. You are ${CURRENT_USER}; today is ${TODAY}.`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(draft);
        }}
        className="flex gap-2"
      >
        <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1014] border border-white/10 focus-within:border-accent">
          <Search size={15} className="text-white/40 shrink-0" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
            aria-label="JQL query"
            className="flex-1 bg-transparent outline-none font-mono text-[13px] text-[#d6f5f0] [font-variant-ligatures:none]"
          />
        </label>
        <button type="submit" className={btnPrimary}>
          <Play size={14} /> Search
        </button>
      </form>
      {examples.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {examples.map((q) => (
            <button key={q} type="button" onClick={() => run(q)} className="px-2.5 py-1 rounded-lg bg-surface-2 border border-line font-mono text-[11px] text-muted hover:text-fg text-left">
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 rounded-xl border border-line overflow-hidden">
        {error ? (
          <p className="flex gap-2 p-3 text-sm bg-amber-400/10 text-fg">
            <CircleAlert size={16} className="text-amber-500 shrink-0 mt-0.5" /> {error}
          </p>
        ) : (
          <>
            <div className="px-3 py-2 border-b border-line text-xs font-bold text-muted">
              {items.length} work item{items.length === 1 ? '' : 's'} for <span className="font-mono text-fg">{query || '(everything)'}</span>
            </div>
            <Results items={items} />
          </>
        )}
      </div>
    </Playground>
  );
}

const readSaved = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const save = (key, v) => {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* storage unavailable */
  }
};

/**
 * A JQL exercise: the learner's query must return the same work items as `ex.expected`
 * (in the same order when `ex.ordered`), and match every rule in `ex.mustUse` ([regex, message]).
 */
export function JqlExercise({ ex, storageKey, passed, onPass }) {
  const [draft, setDraft] = useState(() => readSaved(storageKey) ?? ex.starter ?? '');
  const [checked, setChecked] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [, , preview] = useJql(draft);

  const check = () => {
    const results = [];
    let got = null;
    try {
      got = runJql(draft);
      results.push({ name: 'The query runs', passed: true });
    } catch (e) {
      results.push({ name: 'The query runs', passed: false, message: e.message });
    }
    if (got) {
      const want = runJql(ex.expected).map((i) => i.key);
      const have = got.map((i) => i.key);
      const sameSet = want.length === have.length && want.every((k) => have.includes(k));
      results.push({
        name: `Returns the right ${want.length} work items`,
        passed: sameSet,
        message: sameSet ? '' : `you got ${have.length}: ${have.join(', ') || 'none'}`,
      });
      if (ex.ordered) {
        const sameOrder = sameSet && want.every((k, i) => have[i] === k);
        results.push({ name: 'In the right order', passed: sameOrder, message: sameOrder ? '' : `order: ${have.join(', ')}` });
      }
      for (const [pattern, message] of ex.mustUse || []) {
        const ok = new RegExp(pattern, 'i').test(draft);
        results.push({ name: message, passed: ok });
      }
    }
    setChecked(results);
    if (results.every((r) => r.passed)) onPass?.();
  };

  const all = checked?.every((r) => r.passed);
  return (
    <div className="my-6 rounded-2xl border border-accent/40 bg-surface shadow-soft overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-surface-2/60">
        <span className="eyebrow text-accent">Exercise · JQL</span>
        {(passed || all) && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[11px] font-bold">
            <CheckCircle2 size={12} /> Solved
          </span>
        )}
      </div>
      <div className="p-4">
        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            save(storageKey, e.target.value);
            setChecked(null);
          }}
          rows={2}
          spellCheck={false}
          aria-label="Your JQL query"
          placeholder="Type your JQL here, e.g. project = COLL AND type = Bug"
          className="w-full px-3 py-2 rounded-xl bg-[#0d1014] border border-white/10 font-mono text-[13px] text-[#d6f5f0] focus:outline-none focus:border-accent [font-variant-ligatures:none]"
        />
        <p className="mt-1 text-xs text-subtle">
          {preview.error ? <span className="text-amber-600 dark:text-amber-300">{preview.error}</span> : `Live preview: ${preview.items.length} work items match.`}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={check} className={btnPrimary}>
            Check my query
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(ex.starter ?? '');
              setChecked(null);
            }}
            className={`${btn} !px-3`}
          >
            <RotateCcw size={13} /> Reset
          </button>
          {ex.hint && (
            <button type="button" onClick={() => setShowHint((s) => !s)} className={`${btn} !px-3`}>
              <Lightbulb size={13} /> Hint
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setDraft(ex.solution);
              setChecked(null);
            }}
            className={`${btn} !px-3`}
          >
            <Eye size={13} /> Show solution
          </button>
        </div>
        {showHint && <p className="mt-3 p-3 rounded-xl bg-accent/10 border border-accent/25 text-sm text-fg">{ex.hint}</p>}
        {!preview.error && preview.items.length > 0 && (
          <div className="mt-3 rounded-xl border border-line overflow-hidden max-h-64 overflow-y-auto">
            <Results items={preview.items} />
          </div>
        )}
        {checked && (
          <ul className="mt-3 space-y-1.5">
            {checked.map((r) => (
              <li key={r.name} className="flex items-start gap-2 text-sm">
                {r.passed ? <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> : <XCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />}
                <span>
                  <span className="font-semibold text-fg">{r.name}</span>
                  {!r.passed && r.message && <span className="block text-xs text-muted font-mono">{r.message}</span>}
                </span>
              </li>
            ))}
            <li className={`text-sm font-bold ${all ? 'text-accent' : 'text-amber-600 dark:text-amber-300'}`}>{all ? 'All checks passed. Well done!' : 'Not quite yet. Keep going.'}</li>
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- work item anatomy

const ANATOMY = [
  ['Key', 'COLL-13', 'A unique id: the project key (COLL) plus a number. Use it to refer to the work in chats, commits and links.'],
  ['Type', '🐞 Bug', 'What kind of work this is: Epic, Story, Task, Bug or Sub-task. Types can have different fields and workflows.'],
  ['Summary', 'Duplicate SMS sent to customers who already paid', 'One line saying what the work is. Write it so anyone can understand it in a list.'],
  ['Status', 'In Progress', 'Where the work is in its workflow (To Do → In Progress → In Review → Done).'],
  ['Priority', 'Highest', 'How urgent it is compared with other work: Highest, High, Medium, Low, Lowest.'],
  ['Assignee', 'Kiran', 'The one person responsible for moving it forward right now.'],
  ['Reporter', 'Neha', 'Who raised it. They are the person to ask for more detail.'],
  ['Sprint', 'Sprint 15', 'In Scrum, the time-box (usually 2 weeks) the team committed to doing it in.'],
  ['Story points', '3', 'A relative size estimate (often 1, 2, 3, 5, 8, 13). Not hours: a 2 is roughly twice a 1.'],
  ['Parent', 'COLL-1 Digital collections journey', 'The bigger piece of work it belongs to: stories belong to an epic; sub-tasks to a story.'],
  ['Labels', 'digital, sms', 'Free tags for grouping work across projects, handy in searches.'],
];

export function WorkItemAnatomy() {
  const [sel, setSel] = useState(0);
  return (
    <Playground title="Anatomy of a work item" hint="Click any field to see what it is for.">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-line bg-surface-2 p-4 space-y-1">
          {ANATOMY.map(([name, value], i) => (
            <button
              key={name}
              type="button"
              onClick={() => setSel(i)}
              className={`w-full flex gap-3 text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${i === sel ? 'bg-accent/15 ring-1 ring-accent/40' : 'hover:bg-surface'}`}
            >
              <span className="w-28 shrink-0 text-xs font-bold uppercase tracking-wide text-subtle pt-0.5">{name}</span>
              <span className="text-fg font-medium">{value}</span>
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-accent/30 p-4 self-start">
          <div className="eyebrow text-accent">{ANATOMY[sel][0]}</div>
          <p className="mt-2 text-sm text-fg leading-relaxed">{ANATOMY[sel][2]}</p>
        </div>
      </div>
    </Playground>
  );
}

// ---------------------------------------------------------------- board with a workflow

export const WORKFLOW = {
  'To Do': ['In Progress'],
  'In Progress': ['In Review', 'To Do'],
  'In Review': ['Done', 'In Progress'],
  Done: ['In Progress'],
};
const WIP_LIMIT = 2;

/**
 * A Kanban board for the current sprint. Cards move by drag and drop or the arrow menu, but only
 * along the workflow's transitions. In exercise mode, onPass fires when every card is Done.
 */
export function Board({ onPass, exercise = false }) {
  const start = useMemo(
    () => [
      { key: 'COLL-9', summary: 'Agency scorecard', status: 'To Do' },
      { key: 'COLL-11', summary: 'SQL for collections by agency', status: 'To Do' },
      { key: 'COLL-6', summary: 'Promise-to-pay screen', status: 'In Progress' },
      { key: 'COLL-13', summary: 'Duplicate SMS bug', status: 'In Progress' },
      { key: 'COLL-8', summary: 'Wrong CEI on dashboard', status: 'In Review' },
    ],
    []
  );
  const [cards, setCards] = useState(start);
  const [message, setMessage] = useState('');
  const [dragging, setDragging] = useState(null);

  const move = (key, to) => {
    const card = cards.find((c) => c.key === key);
    if (!card || card.status === to) return;
    if (!WORKFLOW[card.status].includes(to)) {
      setMessage(`✗ There is no transition from "${card.status}" to "${to}" in this workflow. Allowed: ${WORKFLOW[card.status].join(', ')}.`);
      return;
    }
    const next = cards.map((c) => (c.key === key ? { ...c, status: to } : c));
    setCards(next);
    const wip = next.filter((c) => c.status === 'In Progress').length;
    setMessage(
      `✓ ${key} moved to ${to}.${to === 'In Progress' && wip > WIP_LIMIT ? ` In Progress now has ${wip} items, over its WIP limit of ${WIP_LIMIT}: finish work before starting more.` : ''}`
    );
    if (exercise && next.every((c) => c.status === 'Done')) onPass?.();
  };

  return (
    <Playground
      title={exercise ? 'Exercise: finish the sprint' : 'A sprint board with a workflow'}
      hint={
        exercise
          ? 'Get every card to Done. Drag cards between columns (or use the → menu on a card). Only moves the workflow allows will work.'
          : 'Drag a card to another column, or use its → menu. Try dragging a To Do card straight to Done.'
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {STATUSES.map((s) => {
          const col = cards.filter((c) => c.status === s);
          const over = s === 'In Progress' && col.length > WIP_LIMIT;
          return (
            <div
              key={s}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragging && move(dragging, s)}
              className={`min-h-[10rem] rounded-xl border p-2 ${over ? 'border-amber-400 bg-amber-400/10' : 'border-line bg-surface-2'}`}
              aria-label={`${s} column`}
            >
              <div className="flex items-center justify-between px-1 mb-2 text-[11px] font-extrabold uppercase tracking-wider text-subtle">
                {s}
                <span className={over ? 'text-amber-600' : ''}>
                  {col.length}
                  {s === 'In Progress' ? ` / ${WIP_LIMIT}` : ''}
                </span>
              </div>
              {col.map((c) => (
                <div
                  key={c.key}
                  draggable
                  onDragStart={() => setDragging(c.key)}
                  onDragEnd={() => setDragging(null)}
                  className="mb-2 p-2.5 rounded-lg bg-surface border border-line shadow-soft cursor-grab active:cursor-grabbing"
                  data-card={c.key}
                >
                  <div className="font-mono text-[11px] font-bold text-accent">{c.key}</div>
                  <div className="text-[13px] text-fg leading-snug">{c.summary}</div>
                  <label className="mt-1.5 flex items-center gap-1 text-[11px] text-subtle">
                    <ArrowRight size={11} />
                    <select
                      value=""
                      onChange={(e) => move(c.key, e.target.value)}
                      aria-label={`Move ${c.key}`}
                      className="bg-transparent text-[11px] text-muted outline-none cursor-pointer"
                    >
                      <option value="">Move to…</option>
                      {STATUSES.filter((x) => x !== s).map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <p className={`mt-3 min-h-[1.5rem] text-sm ${message.startsWith('✗') ? 'text-amber-600 dark:text-amber-300' : 'text-accent'}`} aria-live="polite">
        {message}
      </p>
      <button
        type="button"
        onClick={() => {
          setCards(start);
          setMessage('');
        }}
        className={`${btn} !px-3 !text-xs`}
      >
        <RotateCcw size={13} /> Reset board
      </button>
    </Playground>
  );
}

export function BoardExercise({ passed, onPass }) {
  return (
    <div>
      {passed && <p className="text-sm font-bold text-accent">✓ Solved. You can play again below.</p>}
      <Board exercise onPass={onPass} />
    </div>
  );
}

// ---------------------------------------------------------------- sprint planning

const BACKLOG = [
  { key: 'COLL-12', summary: 'Champion-challenger split for SMS timing', points: 5, priority: 'Medium' },
  { key: 'COLL-15', summary: 'Roll-rate alert when 31-60 rolls above 25%', points: 5, priority: 'High' },
  { key: 'COLL-16', summary: 'Export to Excel drops the last row', points: 1, priority: 'Low' },
  { key: 'COLL-18', summary: 'Field visit route planner for 90+ accounts', points: 8, priority: 'Medium' },
  { key: 'COLL-19', summary: 'Customers on payment plans still get reminders', points: 3, priority: 'Highest' },
  { key: 'COLL-20', summary: 'Add agency name to the payments export', points: 2, priority: 'Medium' },
  { key: 'COLL-21', summary: 'Self-service payment plan page', points: null, priority: 'High' },
  { key: 'COLL-17', summary: 'Archive closed 2024 accounts', points: 2, priority: 'Lowest' },
];
const VELOCITY = [
  ['Sprint 12', 18],
  ['Sprint 13', 21],
  ['Sprint 14', 20],
];
export const CAPACITY = Math.round(VELOCITY.reduce((s, [, v]) => s + v, 0) / VELOCITY.length); // 20

export function sprintProblems(keys) {
  const chosen = BACKLOG.filter((b) => keys.includes(b.key));
  const total = chosen.reduce((s, b) => s + (b.points || 0), 0);
  const problems = [];
  if (chosen.some((b) => b.points == null)) problems.push('An item without an estimate is in the sprint: estimate it before committing.');
  if (BACKLOG.some((b) => b.priority === 'Highest' && !keys.includes(b.key))) problems.push('The Highest-priority item is not in the sprint.');
  if (total > CAPACITY) problems.push(`${total} points is more than the team's capacity of ${CAPACITY}.`);
  if (total < CAPACITY - 4) problems.push(`${total} points leaves a lot of capacity unused; aim for ${CAPACITY - 4}–${CAPACITY}.`);
  return { total, problems };
}

/** Pick backlog items for the next sprint against the team's average velocity. */
export function SprintPlanner({ exercise = false, passed, onPass }) {
  const [keys, setKeys] = useState([]);
  const { total, problems } = sprintProblems(keys);
  const toggle = (k) => setKeys((ks) => (ks.includes(k) ? ks.filter((x) => x !== k) : [...ks, k]));
  const [checked, setChecked] = useState(false);
  return (
    <Playground
      title={exercise ? 'Exercise: plan Sprint 16' : 'Sprint planning'}
      hint={`Velocity, the points the team finished in recent sprints: ${VELOCITY.map(([s, v]) => `${s} ${v}`).join(', ')}. Average capacity: ${CAPACITY} points.`}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="eyebrow text-subtle mb-2">Backlog</div>
          {BACKLOG.filter((b) => !keys.includes(b.key)).map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => toggle(b.key)}
              className="w-full mb-1.5 flex items-center gap-2 p-2 rounded-lg border border-line bg-surface text-left hover:border-accent/50"
              aria-label={`Add ${b.key} to the sprint`}
            >
              <span className="font-mono text-[11px] font-bold text-accent w-16 shrink-0">{b.key}</span>
              <span className="flex-1 text-[13px] text-fg leading-snug">{b.summary}</span>
              <span className="text-[11px] font-bold" style={{ color: PRIORITY_COLOUR[b.priority] }}>
                {b.priority}
              </span>
              <span className="w-7 text-center text-xs font-extrabold rounded bg-surface-2">{b.points ?? '?'}</span>
            </button>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow text-subtle">Sprint 16</span>
            <span className={`text-xs font-extrabold ${total > CAPACITY ? 'text-amber-600' : 'text-accent'}`}>
              {total} / {CAPACITY} points
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-2 overflow-hidden mb-2">
            <div className={`h-full ${total > CAPACITY ? 'bg-amber-500' : 'bg-accent'}`} style={{ width: `${Math.min(100, (total / CAPACITY) * 100)}%` }} />
          </div>
          {keys.length === 0 && <p className="text-sm text-subtle p-3 border border-dashed border-line rounded-lg">Click backlog items to add them.</p>}
          {BACKLOG.filter((b) => keys.includes(b.key)).map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => toggle(b.key)}
              className="w-full mb-1.5 flex items-center gap-2 p-2 rounded-lg border border-accent/40 bg-accent/5 text-left"
              aria-label={`Remove ${b.key} from the sprint`}
            >
              <span className="font-mono text-[11px] font-bold text-accent w-16 shrink-0">{b.key}</span>
              <span className="flex-1 text-[13px] text-fg leading-snug">{b.summary}</span>
              <span className="w-7 text-center text-xs font-extrabold rounded bg-surface-2">{b.points ?? '?'}</span>
            </button>
          ))}
        </div>
      </div>
      {exercise && (
        <div className="mt-3">
          <button
            type="button"
            className={btnPrimary}
            onClick={() => {
              setChecked(true);
              if (!problems.length) onPass?.();
            }}
          >
            Check my plan
          </button>
          {(checked || passed) && (
            <ul className="mt-3 space-y-1 text-sm">
              {problems.length === 0 ? (
                <li className="font-bold text-accent">✓ A realistic sprint: {total} points, the urgent item included, everything estimated.</li>
              ) : (
                problems.map((p) => (
                  <li key={p} className="text-amber-600 dark:text-amber-300">
                    ✗ {p}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </Playground>
  );
}

export function SprintExercise({ passed, onPass }) {
  return <SprintPlanner exercise passed={passed} onPass={onPass} />;
}

// ---------------------------------------------------------------- burndown

export function Burndown() {
  const committed = 46;
  const actual = [46, 46, 44, 41, 41, 36, 35, 27, 26];
  const days = 10;
  const W = 520;
  const H = 220;
  const x = (d) => 36 + (d / days) * (W - 50);
  const y = (v) => 14 + (1 - v / committed) * (H - 40);
  const [hover, setHover] = useState(null);
  return (
    <Playground title="Sprint 15 burndown" hint="Points still to do, day by day. Hover a point. Above the dashed ideal line means the team is behind.">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Burndown chart">
        <line x1={x(0)} y1={y(committed)} x2={x(days)} y2={y(0)} stroke="var(--subtle)" strokeDasharray="5 4" />
        <polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" points={actual.map((v, d) => `${x(d)},${y(v)}`).join(' ')} />
        {actual.map((v, d) => (
          <circle key={d} cx={x(d)} cy={y(v)} r={hover === d ? 6 : 4} fill="var(--accent)" onMouseEnter={() => setHover(d)} onMouseLeave={() => setHover(null)} />
        ))}
        {[0, 10, 20, 30, 40].map((v) => (
          <text key={v} x="4" y={y(v) + 4} fontSize="10" fill="var(--subtle)">
            {v}
          </text>
        ))}
        <text x={x(days) - 4} y={H - 4} fontSize="10" fill="var(--subtle)" textAnchor="end">
          day {days}
        </text>
      </svg>
      <p className="text-sm text-muted min-h-[1.5rem]">
        {hover === null
          ? `Day 9: ${actual[8]} of ${committed} points left; the ideal line says ${Math.round(committed * (1 - 8 / days))}.`
          : `Day ${hover + 1}: ${actual[hover]} points left (ideal ${Math.round(committed * (1 - hover / days))}).`}
      </p>
    </Playground>
  );
}

// ---------------------------------------------------------------- automation

const TRIGGERS = {
  created: 'a work item is created',
  done: 'a work item moves to Done',
  priority: 'the priority changes',
};
const CONDITIONS = { none: 'always', bug: 'type is Bug', highest: 'priority is Highest' };
const ACTIONS = { assign: 'assign it to Neha', comment: 'add a comment "Thanks, the team has been notified"', label: 'add the label "urgent"', parent: 'move the parent epic to In Progress' };
const EVENTS = [
  { name: 'Kiran creates a Highest-priority Bug', trigger: 'created', type: 'Bug', priority: 'Highest' },
  { name: 'Amit creates a Medium Story', trigger: 'created', type: 'Story', priority: 'Medium' },
  { name: 'COLL-8 (Bug) moves to Done', trigger: 'done', type: 'Bug', priority: 'Highest' },
  { name: 'COLL-12 priority raised to Highest', trigger: 'priority', type: 'Story', priority: 'Highest' },
];

export function AutomationBuilder() {
  const [rule, setRule] = useState({ trigger: 'created', condition: 'highest', action: 'label' });
  const [ran, setRan] = useState(false);
  const set = (k) => (e) => {
    setRule({ ...rule, [k]: e.target.value });
    setRan(false);
  };
  const fires = (ev) =>
    ev.trigger === rule.trigger && (rule.condition === 'none' || (rule.condition === 'bug' ? ev.type === 'Bug' : ev.priority === 'Highest'));
  const select = 'px-2 py-1.5 rounded-lg bg-surface border border-line text-sm text-fg';
  return (
    <Playground title="Build an automation rule" hint="Jira automation rules have three parts: a trigger (when), optional conditions (if) and actions (then).">
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-xs font-bold text-subtle">
          WHEN
          <select value={rule.trigger} onChange={set('trigger')} className={`${select} w-full mt-1`}>
            {Object.entries(TRIGGERS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-subtle">
          IF
          <select value={rule.condition} onChange={set('condition')} className={`${select} w-full mt-1`}>
            {Object.entries(CONDITIONS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-subtle">
          THEN
          <select value={rule.action} onChange={set('action')} className={`${select} w-full mt-1`}>
            {Object.entries(ACTIONS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-4 p-3 rounded-xl bg-surface-2 border border-line text-sm text-fg">
        <b>When</b> {TRIGGERS[rule.trigger]}, <b>if</b> {CONDITIONS[rule.condition]}, <b>then</b> {ACTIONS[rule.action]}.
      </p>
      <button type="button" className={`${btn} mt-3`} onClick={() => setRan(true)}>
        <Play size={14} /> Test on 4 sample events
      </button>
      {ran && (
        <ul className="mt-3 space-y-1 text-sm">
          {EVENTS.map((ev) => (
            <li key={ev.name} className={fires(ev) ? 'text-accent font-semibold' : 'text-muted'}>
              {fires(ev) ? '⚡ Runs' : '· Skipped'}: {ev.name}
            </li>
          ))}
        </ul>
      )}
    </Playground>
  );
}
