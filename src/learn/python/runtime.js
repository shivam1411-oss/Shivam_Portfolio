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
    if (data.type === 'loading') current.onOut('info', `Loading ${data.packages.join(', ')}… (first time only)`);
    if (data.type === 'start') current.arm();
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
 * With `trace`, the program runs line by line and resolves with { error, steps, truncated } instead.
 * Resolves with { error, results, images, ms }. Runs are queued so only one program runs at a time.
 */
export function run(code, { stdin = '', tests = [], onOut = () => {}, trace = false } = {}) {
  const job = queue.then(
    () =>
      new Promise((resolve) => {
        if (!worker) start();
        const id = nextId++;
        // The clock starts when the worker says the program itself is starting, so downloading
        // Python or a package like pandas never counts towards the limit.
        const arm = () => {
          if (current?.id === id && !current.timer) current.timer = setTimeout(() => stop('timeout'), TIME_LIMIT_MS);
        };
        current = { id, onOut, resolve, timer: null, arm };
        worker.postMessage({ type: 'run', id, code, stdin, tests, trace });
      })
  );
  queue = job.catch(() => {});
  return job;
}
