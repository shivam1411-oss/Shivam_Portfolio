import { useEffect, useRef, useState } from 'react';
import { Cpu, Loader2, MonitorX } from 'lucide-react';
import { run } from '../python/runtime';
import { Playground, btn } from '../ui';

// Widgets for the "Learning Lab & Python" module.

const ROUTES = [
  { hash: '#/', view: 'landing', shows: 'The landing page: the portfolio taken apart into its layers.' },
  { hash: '#/courses', view: 'hub', shows: 'Every course with its progress.' },
  { hash: '#/c/python', view: 'course', course: 'python', shows: 'The Python course outline: its 6 modules and 22 lessons.' },
  { hash: '#/c/python/loops', view: 'lesson', course: 'python', lesson: 'loops', shows: 'One lesson: explanation, runnable examples, exercises, quiz.' },
  { hash: '#/c/site/canvas', view: 'lesson', course: 'site', lesson: 'canvas', shows: 'A "Learn the Code" lesson, same page layout.' },
  { hash: '#/lesson/canvas', view: 'lesson', course: 'site', lesson: 'canvas', shows: 'An old link from before there were courses. It still opens the right lesson.', legacy: true },
  { hash: '#/playground', view: 'playground', shows: 'The free Python scratchpad.' },
];

/** Pick an address and see what the router does with it, and which progress key it uses. */
export function RouteExplorer() {
  const [picked, setPicked] = useState(ROUTES[2]);
  const key = picked.lesson ? `${picked.course}/${picked.lesson}` : null;
  return (
    <Playground title="How an address becomes a page" hint="The part after # in the address decides what is shown. Click an address to see how parseHash() reads it.">
      <div className="flex flex-wrap gap-2 mb-4">
        {ROUTES.map((r) => (
          <button
            key={r.hash}
            type="button"
            onClick={() => setPicked(r)}
            className={`${btn} !px-3 !py-1.5 font-mono !text-xs ${picked.hash === r.hash ? '!border-accent !text-accent' : ''}`}
          >
            {r.hash}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <pre className="m-0 p-4 rounded-xl bg-[#0d1014] text-[#d6f5f0] font-mono text-[12px] overflow-x-auto [font-variant-ligatures:none]">
          {`parseHash("${picked.hash}")\n→ {\n  view: '${picked.view}',${picked.course ? `\n  course: courseById['${picked.course}'],` : ''}${
            picked.lesson ? `\n  lesson: '${picked.lesson}',` : ''
          }\n}`}
        </pre>
        <div className="p-4 rounded-xl bg-surface-2 border border-line text-sm">
          <div className="font-bold text-fg">What you see</div>
          <p className="mt-1 text-muted leading-relaxed">{picked.shows}</p>
          {key && (
            <>
              <div className="mt-3 font-bold text-fg">Progress key</div>
              <p className="mt-1 text-muted">
                Saved as <span className="font-mono text-accent">{key}</span>
                {picked.legacy ? ', the same key the new address uses, so old progress still counts.' : ', so lessons with the same id in two courses never clash.'}
              </p>
            </>
          )}
        </div>
      </div>
    </Playground>
  );
}

const BUSY_MS = 2000;

/**
 * The same 2-second busy loop, first on the page's own thread, then in the Python worker.
 * A dot moved by requestAnimationFrame shows whether the page could still draw.
 */
export function ThreadDemo() {
  const dot = useRef(null);
  const frames = useRef(0);
  const [mode, setMode] = useState(null); // null | 'page' | 'worker'
  const [results, setResults] = useState({});

  useEffect(() => {
    let id;
    let x = 0;
    const tick = () => {
      frames.current++;
      x = (x + 3) % 100;
      if (dot.current) dot.current.style.left = `${x}%`;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const measure = async (which, work) => {
    setMode(which);
    // Let the label repaint before the work starts.
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)));
    const start = performance.now();
    const before = frames.current;
    await work();
    const seconds = (performance.now() - start) / 1000;
    const fps = Math.round((frames.current - before) / seconds);
    setResults((r) => ({ ...r, [which]: { seconds: seconds.toFixed(1), fps } }));
    setMode(null);
  };

  const onPage = () =>
    measure('page', async () => {
      const end = performance.now() + BUSY_MS;
      while (performance.now() < end) {
        /* busy: the page cannot draw or react until this finishes */
      }
    });

  const inWorker = () =>
    measure('worker', () => run(`import time\nend = time.time() + ${BUSY_MS / 1000}\nwhile time.time() < end:\n    pass\nprint("done")`));

  return (
    <Playground
      title="Why Python runs in a web worker"
      hint="Both buttons keep a processor busy for 2 seconds. Watch the moving dot and try scrolling while each one runs. (The first worker run also waits for Python to load.)"
    >
      <div className="relative h-10 rounded-xl bg-surface-2 border border-line overflow-hidden">
        <span ref={dot} className="absolute top-1/2 -mt-2 w-4 h-4 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onPage} disabled={!!mode} className={btn}>
          {mode === 'page' ? <Loader2 size={14} className="animate-spin" /> : <MonitorX size={14} />} Busy loop on the page
        </button>
        <button type="button" onClick={inWorker} disabled={!!mode} className={btn}>
          {mode === 'worker' ? <Loader2 size={14} className="animate-spin" /> : <Cpu size={14} />} Same loop in the Python worker
        </button>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
        {[
          ['page', 'On the page', 'The dot freezes: the page could not draw a single frame until the loop ended.'],
          ['worker', 'In the worker', 'The dot keeps moving: the loop ran on another thread.'],
        ].map(([k, label, meaning]) => (
          <div key={k} className="p-4 rounded-xl bg-surface-2 border border-line">
            <div className="font-bold text-fg">{label}</div>
            {results[k] ? (
              <>
                <div className="mt-1 font-mono text-accent">
                  {results[k].fps} frames/second over {results[k].seconds}s
                </div>
                <p className="mt-1 text-xs text-muted">{meaning}</p>
              </>
            ) : (
              <p className="mt-1 text-xs text-subtle">Not run yet.</p>
            )}
          </div>
        ))}
      </div>
    </Playground>
  );
}
