import { Suspense, lazy, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, CircleAlert, Eye, FlaskConical, Keyboard, Lightbulb, Loader2, Play, RotateCcw, Square, Terminal, XCircle } from 'lucide-react';
import { getStatus, getStatusError, run, stop, subscribe, warmUp } from './runtime';
import { btn, btnPrimary } from '../ui';

const Editor = lazy(() => import('./Editor'));

// What each common error usually means, for beginners.
const ERROR_HINTS = {
  SyntaxError: 'Python could not read this line. Look for a missing colon (:), bracket or quote.',
  IndentationError: 'The spacing at the start of a line is off. Code inside if/for/def must be indented by 4 spaces.',
  NameError: 'A name is used before it was created, or it is misspelt. Python is case-sensitive.',
  TypeError: 'A value of the wrong type was used, e.g. adding text to a number. Convert with int() or str().',
  ValueError: 'The type was right but the value was not, e.g. int("abc").',
  ZeroDivisionError: 'Something was divided by zero.',
  IndexError: 'A list position that does not exist. Positions start at 0 and stop at len(list) - 1.',
  KeyError: 'That key is not in the dictionary. Use .get(key) to avoid the error.',
  AttributeError: 'That value has no such method or attribute. Check the spelling and the type.',
  EOFError: 'The program asked for input() but the Input box ran out of lines. Add a line per input().',
  RecursionError: 'A function kept calling itself without stopping. Check its base case.',
  ModuleNotFoundError: 'Only Python\'s built-in standard library is available here (math, random, datetime, csv, json, …).',
  TimeoutError: 'Press Run again once you have fixed the loop.',
};

const usePythonStatus = () => useSyncExternalStore(subscribe, getStatus);

function StatusBadge() {
  const status = usePythonStatus();
  if (status === 'loading')
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted">
        <Loader2 size={12} className="animate-spin" /> Loading Python…
      </span>
    );
  if (status === 'error')
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-300" title={getStatusError()}>
        <CircleAlert size={12} /> Python failed to load
      </span>
    );
  if (status === 'ready')
    return <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent">● Python ready</span>;
  return <span className="text-[11px] font-semibold text-subtle">Python loads on first run</span>;
}

const readSaved = (key) => {
  try {
    return key ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
};
const writeSaved = (key, value) => {
  try {
    if (key) localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: edits last for this visit */
  }
};

/**
 * Editable, runnable Python.
 * - Example: just `code`.
 * - Exercise: `tests` ([{ name, code }] of Python asserts run after the learner's code; `OUTPUT` holds what was printed
 *   and `SOURCE` the code itself),
 *   plus `storageKey` to keep edits, and optional `hint`, `solution`, `onPass`.
 * - `stdin`: starting text for the Input box (one line per input() call). Shown automatically when the code uses input().
 */
export default function PyRunner({ code: initial, tests, stdin, storageKey, hint, solution, onPass, passed = false, title }) {
  const [code, setCode] = useState(() => readSaved(storageKey) ?? initial);
  const [input, setInput] = useState(stdin ?? '');
  const [lines, setLines] = useState([]); // { kind: 'out' | 'err', text }
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const outRef = useRef(null);
  const isExercise = !!tests?.length;
  const usesInput = stdin !== undefined || /\binput\s*\(/.test(code);

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [lines]);

  const change = (v) => {
    setCode(v);
    writeSaved(storageKey, v);
  };

  const execute = async (withTests) => {
    if (running) return;
    setRunning(true);
    setLines([]);
    setResult(null);
    const buffer = [];
    let flush = null;
    // Batch printed lines into one state update per frame so big outputs stay smooth.
    const onOut = (kind, text) => {
      buffer.push({ kind, text });
      if (!flush)
        flush = requestAnimationFrame(() => {
          flush = null;
          const add = buffer.splice(0);
          setLines((l) => [...l, ...add].slice(-500));
        });
    };
    const res = await run(code, { stdin: input, tests: withTests ? tests : [], onOut });
    if (flush) cancelAnimationFrame(flush);
    setLines((l) => [...l, ...buffer.splice(0)].slice(-500));
    setResult({ ...res, checked: withTests });
    setRunning(false);
    if (withTests && !res.error && res.results?.every((r) => r.passed)) onPass?.();
  };

  const reset = () => {
    change(initial);
    setLines([]);
    setResult(null);
  };

  const error = result?.error;
  const results = result?.checked ? result.results : null;
  const allPassed = results?.length && results.every((r) => r.passed);

  return (
    <div className={`my-6 rounded-2xl border overflow-hidden shadow-soft ${isExercise ? 'border-accent/40' : 'border-line'} bg-surface`}>
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-line bg-surface-2/60">
        {isExercise ? <FlaskConical size={15} className="text-accent" /> : <Terminal size={15} className="text-accent" />}
        <span className="eyebrow text-accent">{isExercise ? 'Exercise' : 'Run it'}</span>
        {title && <span className="text-sm font-bold text-fg">{title}</span>}
        {(passed || allPassed) && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[11px] font-bold">
            <CheckCircle2 size={12} /> Solved
          </span>
        )}
        <span className="ml-auto">
          <StatusBadge />
        </span>
      </div>

      <div onFocus={warmUp}>
        <Suspense fallback={<pre className="m-0 p-4 bg-[#0d1014] text-[#d6f5f0] font-mono [font-variant-ligatures:none] text-[13px] whitespace-pre-wrap">{code}</pre>}>
          <Editor value={code} onChange={change} onRun={() => execute(isExercise)} />
        </Suspense>
      </div>

      {usesInput && (
        <label className="block px-4 py-3 border-t border-line bg-surface-2/40">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-subtle mb-1.5">
            <Keyboard size={12} /> Input: one line for each input()
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={Math.min(4, Math.max(1, input.split('\n').length))}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-line font-mono text-[13px] text-fg focus:outline-none focus:border-accent"
          />
        </label>
      )}

      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-line">
        {running ? (
          <button type="button" onClick={() => stop()} className={btn}>
            <Square size={13} /> Stop
          </button>
        ) : (
          <button type="button" onClick={() => execute(false)} className={isExercise ? btn : btnPrimary} title="Ctrl/⌘ + Enter">
            <Play size={14} /> Run
          </button>
        )}
        {isExercise && !running && (
          <button type="button" onClick={() => execute(true)} className={btnPrimary} title="Ctrl/⌘ + Enter">
            <FlaskConical size={14} /> Check my answer
          </button>
        )}
        <button type="button" onClick={reset} className={`${btn} !px-3`} title="Put the starting code back">
          <RotateCcw size={13} /> Reset
        </button>
        {hint && (
          <button type="button" onClick={() => setShowHint((h) => !h)} className={`${btn} !px-3`}>
            <Lightbulb size={13} /> Hint
          </button>
        )}
        {solution && (
          <button type="button" onClick={() => change(solution)} className={`${btn} !px-3`}>
            <Eye size={13} /> Show solution
          </button>
        )}
        <span className="text-[11px] text-subtle ml-auto hidden sm:inline">Ctrl/⌘ + Enter {isExercise ? 'checks' : 'runs'}</span>
      </div>

      <AnimatePresence>
        {showHint && hint && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="mx-4 mb-3 p-3 rounded-xl bg-accent/10 border border-accent/25 text-sm text-fg leading-relaxed">{hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {(lines.length > 0 || result || running) && (
        <div className="border-t border-line">
          <pre
            ref={outRef}
            aria-live="polite"
            aria-label="Program output"
            className="m-0 max-h-64 overflow-auto px-4 py-3 bg-[#0a0c0f] font-mono [font-variant-ligatures:none] text-[12.5px] leading-relaxed whitespace-pre-wrap break-words"
          >
            {lines.map((l, i) => (
              <div key={i} className={l.kind === 'err' ? 'text-amber-300' : 'text-[#d6f5f0]'}>
                {l.text || ' '}
              </div>
            ))}
            {!lines.length && result && !error && <div className="text-white/40 italic">(nothing was printed)</div>}
            {running && !lines.length && <div className="text-white/40 italic">Running…</div>}
          </pre>

          {error && (
            <div className="px-4 py-3 border-t border-line bg-amber-400/10">
              <div className="flex items-start gap-2">
                <XCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-mono text-[12.5px] font-bold text-fg break-words">
                    {error.line ? `Line ${error.line}: ` : ''}
                    {error.text}
                  </div>
                  {ERROR_HINTS[error.type] && <p className="mt-1 text-xs text-muted leading-relaxed">{ERROR_HINTS[error.type]}</p>}
                </div>
              </div>
            </div>
          )}

          {results && (
            <ul className="px-4 py-3 border-t border-line space-y-1.5">
              {results.map((r) => (
                <li key={r.name} className="flex items-start gap-2 text-sm">
                  {r.passed ? <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> : <XCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />}
                  <span className="min-w-0">
                    <span className={`font-semibold ${r.passed ? 'text-fg' : 'text-fg'}`}>{r.name}</span>
                    {!r.passed && r.message && <span className="block text-xs text-muted font-mono break-words">{r.message}</span>}
                  </span>
                </li>
              ))}
              <li className={`pt-1 text-sm font-bold ${allPassed ? 'text-accent' : 'text-amber-600 dark:text-amber-300'}`}>
                {allPassed ? 'All tests passed. Well done!' : `${results.filter((r) => r.passed).length} of ${results.length} tests passed. Keep going.`}
              </li>
            </ul>
          )}
          {result && !error && result.checked === false && isExercise && (
            <p className="px-4 pb-3 text-xs text-subtle">Ran without errors. Press “Check my answer” to run the tests.</p>
          )}
          {result?.ms !== undefined && <p className="px-4 pb-2 text-[10px] text-subtle text-right">{result.ms} ms</p>}
        </div>
      )}
    </div>
  );
}
