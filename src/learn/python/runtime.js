// One shared Python worker for every code box on the page. Python loads on the first Run (about
// 12 MB, then cached by the browser), runs one program at a time, and is restarted by Stop.

const TIME_LIMIT_MS = 15000;

let worker = null;
let status = 'idle'; // idle | loading | ready | error
let statusError = '';
let downloaded = 0; // bytes fetched while Python loads (0 when it comes from the browser's cache)
let stallTimer = null;
// If nothing arrives for this long while Python loads, say so and offer a retry instead of spinning forever.
const STALL_MS = 45000;
/** About how much Python downloads the first time (engine + standard library), for the progress text. */
export const PYTHON_DOWNLOAD_MB = 11;
const listeners = new Set();
let current = null; // { id, onOut, resolve, timer }
let queue = Promise.resolve();
let nextId = 1;

const notify = () => listeners.forEach((fn) => fn());
const setStatus = (s, err = '') => {
  status = s;
  statusError = err;
  if (s !== 'loading') clearTimeout(stallTimer);
  notify();
};
const watchForStall = () => {
  clearTimeout(stallTimer);
  stallTimer = setTimeout(() => {
    if (status !== 'loading') return;
    setStatus('error', 'The Python download stopped making progress. Check your connection and press Retry.');
    finish({ error: { type: 'LoadError', message: 'Python is taking too long to download.', text: 'Python is taking too long to download. Check your connection, then press Retry.' } });
  }, STALL_MS);
};

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const getStatus = () => status;
/** Megabytes downloaded so far while Python loads (one decimal place, so the UI updates smoothly). */
export const getDownloadedMB = () => Math.round(downloaded / 100000) / 10;
export const getStatusError = () => statusError;

function finish(result) {
  if (!current) return;
  clearTimeout(current.timer);
  const { resolve } = current;
  current = null;
  resolve(result);
}

function start() {
  downloaded = 0;
  setStatus('loading');
  watchForStall();
  worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = ({ data }) => {
    if (data.type === 'progress') {
      downloaded = data.bytes;
      if (status === 'error' && statusError.includes('stopped making progress')) setStatus('loading'); // it recovered
      if (status === 'loading') watchForStall();
      return notify();
    }
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

/** Throw away the Python worker and start loading again (after a failed or stalled download). */
export function retry() {
  if (worker) worker.terminate();
  worker = null;
  finish({ error: { type: 'Stopped', message: 'Restarting Python…', text: 'Restarting Python…' } });
  start();
}

/** Kill the running program by replacing the worker. */
export function stop(reason = 'stopped') {
  if (!worker) return;
  // Still downloading: cancel this run but keep the download going, so the next Run does not start over.
  if (status === 'loading' && reason !== 'timeout') {
    if (current) worker.postMessage({ type: 'cancel', id: current.id });
    const message = 'Stopped. Python is still downloading in the background; press Run again when it is ready.';
    finish({ error: { type: 'Stopped', message, text: message } });
    return;
  }
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
        if (status === 'error' && worker) {
          // A failed or stalled load: start a fresh worker for this run.
          worker.terminate();
          worker = null;
        }
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
