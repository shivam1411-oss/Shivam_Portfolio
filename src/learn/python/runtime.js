// One shared Python worker for every code box on the page. Python loads on the first Run (about
// 12 MB, then cached by the browser), runs one program at a time, and is restarted by Stop.

const TIME_LIMIT_MS = 15000;

let worker = null;
let status = 'idle'; // idle | loading | ready | error
let statusError = '';
const listeners = new Set();
let current = null; // { id, onOut, resolve, timer }
let queue = Promise.resolve();
let nextId = 1;

const setStatus = (s, err = '') => {
  status = s;
  statusError = err;
  listeners.forEach((fn) => fn());
};

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const getStatus = () => status;
export const getStatusError = () => statusError;

function finish(result) {
  if (!current) return;
  clearTimeout(current.timer);
  const { resolve } = current;
  current = null;
  resolve(result);
}

function start() {
  setStatus('loading');
  worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = ({ data }) => {
    if (data.type === 'ready') return setStatus('ready');
    if (data.type === 'init-error') return setStatus('error', data.message);
    if (!current || data.id !== current.id) return;
    if (data.type === 'out' || data.type === 'err') current.onOut(data.type, data.text);
    if (data.type === 'done') finish(data);
  };
  worker.onerror = (e) => {
    setStatus('error', e.message || 'The Python worker failed to start.');
    finish({ error: { type: 'LoadError', message: 'Python could not start.', text: 'Python could not start.' } });
  };
  // pyodide/ sits next to learn.html (copied there by scripts/copy-pyodide.mjs)
  worker.postMessage({ type: 'init', indexURL: new URL('pyodide/', document.baseURI).href });
}

/** Load Python ahead of the first run (e.g. when a Python lesson opens). */
export function warmUp() {
  if (!worker) start();
}

/** Kill the running program by replacing the worker. */
export function stop(reason = 'stopped') {
  if (!worker) return;
  worker.terminate();
  worker = null;
  const message =
    reason === 'timeout'
      ? `Your program ran for more than ${TIME_LIMIT_MS / 1000} seconds, so it was stopped. Look for a loop that never ends.`
      : 'Stopped.';
  finish({ error: { type: reason === 'timeout' ? 'TimeoutError' : 'Stopped', message, text: message } });
  start();
}

/**
 * Run `code`. `onOut(kind, text)` receives each printed line as it happens ('out' or 'err').
 * Resolves with { error, results, ms }. Runs are queued so only one program runs at a time.
 */
export function run(code, { stdin = '', tests = [], onOut = () => {} } = {}) {
  const job = queue.then(
    () =>
      new Promise((resolve) => {
        if (!worker) start();
        const id = nextId++;
        current = { id, onOut, resolve, timer: null };
        // The clock starts once Python is loaded, so the first download doesn't count.
        const arm = () => {
          if (current?.id === id) current.timer = setTimeout(() => stop('timeout'), TIME_LIMIT_MS);
        };
        if (status === 'ready') arm();
        else {
          const off = subscribe(() => {
            if (status !== 'loading') {
              off();
              arm();
            }
          });
        }
        worker.postMessage({ type: 'run', id, code, stdin, tests });
      })
  );
  queue = job.catch(() => {});
  return job;
}
