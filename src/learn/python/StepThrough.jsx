import { useEffect, useMemo, useState } from 'react';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Footprints, X } from 'lucide-react';
import { btn } from '../ui';

const describe = (step, error) => {
  if (step.event === 'end') return error ? `The program stopped with an error on line ${error.line ?? '?'}.` : 'The program has finished.';
  const where = step.scope === '<module>' ? '' : ` (inside ${step.scope}())`;
  if (step.event === 'return' && step.scope !== '<module>') return `${step.scope}() is finished and gives back ${step.returned}.`;
  return `Line ${step.line} is about to run${where}.`;
};

/**
 * Shows a traced run one step at a time: what happens next, every variable (changed ones highlighted)
 * and the output so far. Reports the current line so the editor can highlight it.
 */
export default function StepThrough({ trace, onLine, onClose }) {
  const { steps, error, truncated } = trace;
  const [i, setI] = useState(0);
  const step = steps[i];
  const last = steps.length - 1;

  useEffect(() => {
    onLine(step.event === 'end' ? null : step.line);
  }, [step, onLine]);

  // Which variables are new or changed since the previous step.
  const changed = useMemo(() => {
    if (i === 0) return new Set();
    const before = new Map(steps[i - 1].vars.map(([n, v]) => [n, v]));
    return new Set(step.vars.filter(([n, v]) => before.get(n) !== v).map(([n]) => n));
  }, [i, step, steps]);

  const go = (n) => setI(Math.max(0, Math.min(last, n)));
  const onKey = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(i + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(i - 1);
    }
  };

  return (
    <div className="border-t border-line bg-[#fcd28d]/[0.06]" onKeyDown={onKey}>
      <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
        <Footprints size={15} className="text-amber-600 dark:text-amber-300" />
        <span className="text-sm font-extrabold text-fg">Step through</span>
        <span className="text-xs font-mono text-muted tabular-nums">
          step {i + 1} of {steps.length}
        </span>
        <button type="button" onClick={onClose} className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-fg" aria-label="Close step through">
          <X size={14} /> Close
        </button>
      </div>

      <p className="px-4 mt-2 text-sm font-semibold text-fg" aria-live="polite">
        {describe(step, error)}
      </p>

      <div className="px-4 mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={`${btn} !px-2.5`} onClick={() => go(0)} disabled={i === 0} aria-label="First step">
          <ChevronFirst size={15} />
        </button>
        <button type="button" className={`${btn} !px-3`} onClick={() => go(i - 1)} disabled={i === 0}>
          <ChevronLeft size={15} /> Back
        </button>
        <button type="button" className={`${btn} !px-3 !border-amber-400/60`} onClick={() => go(i + 1)} disabled={i === last} autoFocus>
          Next <ChevronRight size={15} />
        </button>
        <button type="button" className={`${btn} !px-2.5`} onClick={() => go(last)} disabled={i === last} aria-label="Last step">
          <ChevronLast size={15} />
        </button>
        <input
          type="range"
          min={0}
          max={last}
          value={i}
          onChange={(e) => go(Number(e.target.value))}
          aria-label="Choose a step"
          className="flex-1 min-w-[8rem] accent-[#d97706]"
        />
      </div>
      <p className="px-4 mt-1 text-[11px] text-subtle">Tip: the arrow keys ← → move between steps. The highlighted line in the editor is the one about to run.</p>

      <div className="grid md:grid-cols-2 gap-3 p-4">
        <div className="rounded-xl border border-line bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-line text-[11px] font-bold uppercase tracking-wider text-subtle">
            Variables {step.scope !== '<module>' && step.event !== 'end' ? `in ${step.scope}()` : ''}
          </div>
          {step.vars.length ? (
            <table className="w-full text-[12.5px]">
              <tbody>
                {step.vars.map(([name, value, kind]) => {
                  const isNew = changed.has(name);
                  return (
                    <tr key={name} className={`border-b border-line last:border-0 align-top ${isNew ? 'bg-amber-400/15' : ''}`}>
                      <td className="px-3 py-1.5 font-mono font-bold text-fg whitespace-nowrap">{name}</td>
                      <td className="px-3 py-1.5 font-mono text-fg break-all [font-variant-ligatures:none]">{value}</td>
                      <td className="px-3 py-1.5 text-[11px] text-subtle whitespace-nowrap">
                        {kind}
                        {isNew && <span className="ml-1.5 font-bold text-amber-600 dark:text-amber-300">changed</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="px-3 py-3 text-xs text-subtle">No variables yet.</p>
          )}
        </div>
        <div className="rounded-xl border border-line overflow-hidden">
          <div className="px-3 py-2 border-b border-line bg-surface text-[11px] font-bold uppercase tracking-wider text-subtle">Output so far</div>
          <pre className="m-0 max-h-56 overflow-auto px-3 py-2 bg-[#0a0c0f] text-[#d6f5f0] font-mono text-[12.5px] whitespace-pre-wrap [font-variant-ligatures:none] min-h-[4rem]">
            {step.out || <span className="text-white/40 italic">(nothing printed yet)</span>}
          </pre>
        </div>
      </div>
      {(truncated || (error && step.event === 'end')) && (
        <p className="px-4 pb-3 text-xs text-muted">
          {truncated && 'Showing the first 300 steps; the rest of the program was not stepped through. '}
          {error && step.event === 'end' && `${error.text}`}
        </p>
      )}
    </div>
  );
}
