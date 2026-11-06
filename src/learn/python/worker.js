// Runs Python (Pyodide) off the main thread, so a slow or endless program never freezes the page.
// Messages in:  { type: 'init', indexURL }  ·  { type: 'run', id, code, stdin, tests }
// Messages out: { type: 'ready' | 'init-error' }  ·  { id, type: 'out' | 'err', text }  ·  { id, type: 'done', ... }

// Helpers run inside Python: they compile the learner's code under a friendly file name, keep each
// run in a fresh namespace, echo input() like a terminal does, and turn errors into plain data.
const HELPERS = `
import builtins, sys, traceback

FILENAME = "<your code>"
_real_input = builtins.input

def _input(prompt=""):
    value = _real_input(prompt)
    print(value)  # show what was "typed", as a terminal would
    return value

builtins.input = _input

def _error(e):
    line = getattr(e, "lineno", None) if isinstance(e, SyntaxError) else None
    for frame in traceback.extract_tb(e.__traceback__):
        if frame.filename == FILENAME:
            line = frame.lineno
    return {
        "type": type(e).__name__,
        "message": str(e),
        "line": line,
        "text": "".join(traceback.format_exception_only(type(e), e)).strip(),
    }

def _exec(code, ns):
    try:
        exec(compile(code, FILENAME, "exec"), ns)
        return None
    except BaseException as e:
        return _error(e)
    finally:
        sys.stdout.flush()  # show a last line printed with end=""
        sys.stderr.flush()

def _check(code, ns):
    try:
        exec(compile(code, "<test>", "exec"), ns)
        return {"passed": True, "message": ""}
    except AssertionError as e:
        return {"passed": False, "message": str(e)}
    except BaseException as e:
        return {"passed": False, "message": f"{type(e).__name__}: {e}"}
`;

let pyodide = null;
let ready = null;
let py = null; // the helpers above, looked up once

async function init(indexURL) {
  const { loadPyodide } = await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`);
  pyodide = await loadPyodide({ indexURL });
  await pyodide.runPythonAsync(HELPERS);
  py = { dict: pyodide.globals.get('dict'), exec: pyodide.globals.get('_exec'), check: pyodide.globals.get('_check') };
}

const toJs = (proxy) => {
  if (!proxy) return null;
  const value = proxy.toJs({ dict_converter: Object.fromEntries });
  proxy.destroy();
  return value;
};

function run({ id, code, stdin = '', tests = [] }) {
  const started = performance.now();
  let output = '';
  const lines = stdin === '' ? [] : stdin.split('\n');
  let next = 0;

  pyodide.setStdout({ batched: (text) => {
    output += `${text}\n`;
    postMessage({ id, type: 'out', text });
  } });
  pyodide.setStderr({ batched: (text) => postMessage({ id, type: 'err', text }) });
  pyodide.setStdin({ stdin: () => (next < lines.length ? lines[next++] : undefined) });

  const ns = py.dict();
  ns.set('__name__', '__main__');
  const error = toJs(py.exec(code, ns));

  let results = null;
  if (!error && tests.length) {
    ns.set('OUTPUT', output); // tests can check what was printed…
    ns.set('SOURCE', code); // …and re-run the code with other values
    results = tests.map((t) => ({ name: t.name, ...toJs(py.check(t.code, ns)) }));
  }
  ns.destroy();
  postMessage({ id, type: 'done', error, results, ms: Math.round(performance.now() - started) });
}

self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    ready = init(data.indexURL).then(
      () => postMessage({ type: 'ready' }),
      (e) => postMessage({ type: 'init-error', message: String(e?.message || e) })
    );
    return;
  }
  if (data.type === 'run') {
    await ready;
    if (!py) return postMessage({ id: data.id, type: 'done', error: { type: 'LoadError', message: 'Python could not start.', text: 'Python could not start.' } });
    try {
      run(data);
    } catch (e) {
      postMessage({ id: data.id, type: 'done', error: { type: 'InternalError', message: String(e?.message || e), text: String(e?.message || e) } });
    }
  }
};
