import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { transform } from 'sucrase';
import { CheckCircle2, Eye, FlaskConical, Lightbulb, Monitor, RotateCcw, XCircle } from 'lucide-react';
import { btn, btnPrimary } from '../ui';

const Editor = lazy(() => import('../python/Editor'));

// Pretend network call used by the effects lessons: resolves with `data` after `ms`.
const fakeFetch = (data, ms = 400) => new Promise((resolve) => setTimeout(() => resolve(data), ms));

/**
 * Compile the learner's JSX and return their App component, plus anything they console.log.
 * Code runs with React's hooks in scope; it must define a component called App.
 */
function build(code, log) {
  const compiled = transform(code, { transforms: ['jsx'], jsxRuntime: 'classic', production: true }).code;
  const fakeConsole = { log: (...a) => log(a), info: (...a) => log(a), warn: (...a) => log(a), error: (...a) => log(a) };
  // eslint-disable-next-line no-new-func
  const factory = new Function(
    'React',
    'useState',
    'useEffect',
    'useMemo',
    'useRef',
    'useReducer',
    'useCallback',
    'fakeFetch',
    'console',
    `${compiled}\n;return typeof App === "function" ? App : null;`
  );
  const App = factory(React, useState, useEffect, useMemo, useRef, useReducer, useCallback, fakeFetch, fakeConsole);
  if (!App) throw new Error('Define a component called App, e.g. function App() { return <h1>Hello</h1>; }');
  return App;
}

const show = (v) => {
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

/** Catches errors thrown while rendering the learner's components. */
class Boundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    this.props.onError?.(error);
  }
  render() {
    return this.state.error ? null : this.props.children;
  }
}

/** Mount App in a container; returns an unmount function. */
function mount(App, container, onError) {
  const root = createRoot(container, { onUncaughtError: onError, onCaughtError: () => {} });
  root.render(
    <Boundary onError={onError}>
      <App />
    </Boundary>
  );
  return () => root.unmount();
}

const wait = (ms = 0) => new Promise((r) => setTimeout(r, ms));
const setNativeValue = (el, value) => {
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
};

/** Run one test: a fresh App in a hidden container, plus helpers to click, type and read. */
async function runTest(App, test, source) {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:600px';
  document.body.appendChild(host);
  let renderError = null;
  const unmount = mount(App, host, (e) => {
    renderError = e;
  });
  const h = {
    container: host,
    source, // the learner's code, for checks like "uses a key"
    $: (sel) => host.querySelector(sel),
    $$: (sel) => [...host.querySelectorAll(sel)],
    text: () => host.textContent.replace(/\s+/g, ' ').trim(),
    flush: async () => {
      await wait(0);
      await wait(0);
    },
    wait,
    async click(el) {
      if (!el) throw new Error('Nothing to click: the element was not found');
      el.click();
      await h.flush();
    },
    async type(el, value) {
      if (!el) throw new Error('No input found to type into');
      setNativeValue(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      await h.flush();
    },
    button: (label) => [...host.querySelectorAll('button')].find((b) => b.textContent.trim().toLowerCase() === label.toLowerCase()),
    assert(cond, message) {
      if (!cond) throw new Error(message || 'Assertion failed');
    },
  };
  try {
    await h.flush();
    if (renderError) throw renderError;
    // eslint-disable-next-line no-new-func
    const fn = new Function('h', `return (async () => { ${test.code}\n })();`);
    await fn(h);
    if (renderError) throw renderError;
    return { name: test.name, passed: true };
  } catch (e) {
    return { name: test.name, passed: false, message: e?.message || String(e) };
  } finally {
    unmount();
    host.remove();
  }
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
    /* storage unavailable */
  }
};

/**
 * Live React playground: edit JSX on the left, see it render on the right as you type.
 * Exercises add `tests`: JavaScript run against a fresh render, with helpers on `h`
 * (h.$, h.$$, h.text(), h.click(el), h.type(el, text), h.button(label), h.wait(ms), h.assert(cond, msg), h.source).
 */
export default function ReactRunner({ code: initial, tests, storageKey, hint, solution, onPass, passed = false, title, height = 'h-56' }) {
  const [code, setCode] = useState(() => readSaved(storageKey) ?? initial);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const preview = useRef(null);
  const isExercise = !!tests?.length;

  // Re-render the preview shortly after each edit. While the code is half-typed and does not
  // compile, the last working version stays on screen with the error underneath.
  const unmountPreview = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const collected = [];
      let App;
      try {
        App = build(code, (args) => collected.push(args.map(show).join(' ')));
      } catch (e) {
        setError(e?.message || String(e));
        return;
      }
      setError(null);
      unmountPreview.current?.();
      unmountPreview.current = mount(App, preview.current, (e) => setError(e?.message || String(e)));
      setLogs(collected);
    }, 350);
    return () => clearTimeout(t);
  }, [code]);
  useEffect(() => () => unmountPreview.current?.(), []);

  const change = (v) => {
    setCode(v);
    setResults(null);
    writeSaved(storageKey, v);
  };

  const check = async () => {
    setChecking(true);
    setResults(null);
    let out;
    try {
      const App = build(code, () => {});
      out = [];
      for (const t of tests) out.push(await runTest(App, t, code));
    } catch (e) {
      out = [{ name: 'Your code compiles', passed: false, message: e?.message || String(e) }];
    }
    setResults(out);
    setChecking(false);
    if (out.every((r) => r.passed)) onPass?.();
  };

  const allPassed = results?.length && results.every((r) => r.passed);

  return (
    <div className={`my-6 rounded-2xl border overflow-hidden shadow-soft ${isExercise ? 'border-accent/40' : 'border-line'} bg-surface`}>
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-line bg-surface-2/60">
        {isExercise ? <FlaskConical size={15} className="text-accent" /> : <Monitor size={15} className="text-accent" />}
        <span className="eyebrow text-accent">{isExercise ? 'Exercise' : 'Live React'}</span>
        {title && <span className="text-sm font-bold text-fg">{title}</span>}
        {(passed || allPassed) && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[11px] font-bold">
            <CheckCircle2 size={12} /> Solved
          </span>
        )}
        <span className="ml-auto text-[11px] font-semibold text-subtle">Updates as you type</span>
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="min-w-0 lg:border-r border-line">
          <Suspense fallback={<pre className="m-0 p-4 bg-[#0d1014] text-[#d6f5f0] font-mono text-[13px] whitespace-pre-wrap">{code}</pre>}>
            <Editor value={code} onChange={change} language="jsx" label="React code" onRun={isExercise ? check : undefined} />
          </Suspense>
        </div>
        <div className="min-w-0 flex flex-col">
          <div className="px-3 py-1.5 border-b border-line text-[11px] font-bold uppercase tracking-wider text-subtle">Preview</div>
          {/* A plain, light preview so learners' inline styles look the same in both site themes */}
          <div className={`react-preview relative flex-1 min-h-[8rem] ${height} overflow-auto p-4 bg-white text-[#111]`}>
            <div ref={preview} />
            {error && (
              <div className="absolute inset-x-3 bottom-3 p-3 rounded-lg bg-amber-50 border border-amber-300 text-[12px] text-amber-900 font-mono break-words">
                {error}
              </div>
            )}
          </div>
          {logs.length > 0 && (
            <pre className="m-0 max-h-28 overflow-auto px-3 py-2 border-t border-line bg-[#0a0c0f] text-[#d6f5f0] font-mono text-[12px] whitespace-pre-wrap">
              {logs.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </pre>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-line">
        {isExercise && (
          <button type="button" onClick={check} disabled={checking} className={btnPrimary}>
            <FlaskConical size={14} /> {checking ? 'Checking…' : 'Check my answer'}
          </button>
        )}
        <button type="button" onClick={() => change(initial)} className={`${btn} !px-3`} title="Put the starting code back">
          <RotateCcw size={13} /> Reset
        </button>
        {hint && (
          <button type="button" onClick={() => setShowHint((s) => !s)} className={`${btn} !px-3`}>
            <Lightbulb size={13} /> Hint
          </button>
        )}
        {solution && (
          <button type="button" onClick={() => change(solution)} className={`${btn} !px-3`}>
            <Eye size={13} /> Show solution
          </button>
        )}
      </div>
      {showHint && hint && <p className="mx-4 mb-3 p-3 rounded-xl bg-accent/10 border border-accent/25 text-sm text-fg leading-relaxed">{hint}</p>}

      {results && (
        <ul className="px-4 py-3 border-t border-line space-y-1.5">
          {results.map((r) => (
            <li key={r.name} className="flex items-start gap-2 text-sm">
              {r.passed ? <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> : <XCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />}
              <span className="min-w-0">
                <span className="font-semibold text-fg">{r.name}</span>
                {!r.passed && r.message && <span className="block text-xs text-muted font-mono break-words">{r.message}</span>}
              </span>
            </li>
          ))}
          <li className={`pt-1 text-sm font-bold ${allPassed ? 'text-accent' : 'text-amber-600 dark:text-amber-300'}`}>
            {allPassed ? 'All tests passed. Well done!' : `${results.filter((r) => r.passed).length} of ${results.length} tests passed. Keep going.`}
          </li>
        </ul>
      )}
    </div>
  );
}
