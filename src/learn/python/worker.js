// Runs Python (Pyodide) off the main thread, so a slow or endless program never freezes the page.
import { datasets } from './datasets';

// Messages in:  { type: 'init', indexURL }  ·  { type: 'run', id, code, stdin, tests, trace? }
// Messages out: { type: 'ready' | 'init-error' }  ·  { id, type: 'loading', packages }  ·  { id, type: 'start' }
//               { id, type: 'out' | 'err', text }  ·  { id, type: 'done', error, results, images, steps?, ms }

// Helpers run inside Python: they compile the learner's code under a friendly file name, keep each
// run in a fresh namespace, echo input() like a terminal does, and turn errors into plain data.
const HELPERS = `
import base64, builtins, io, os, sys, traceback

FILENAME = "<your code>"
os.environ["MPLBACKEND"] = "Agg"  # no screen in a worker: charts are drawn to images
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

def _setup(packages):
    """One-off settings after a package is first loaded."""
    if "pandas" in packages:
        import pandas as pd
        pd.set_option("display.width", 100)
        pd.set_option("display.max_columns", 20)
    if "matplotlib" in packages:
        import matplotlib.pyplot as plt
        plt.show = lambda *args, **kwargs: None  # charts are collected after the run instead

def _new_run():
    if "matplotlib.pyplot" in sys.modules:
        sys.modules["matplotlib.pyplot"].close("all")

def _figures():
    """Every open Matplotlib figure as a base64 PNG."""
    if "matplotlib.pyplot" not in sys.modules:
        return []
    plt = sys.modules["matplotlib.pyplot"]
    images = []
    for number in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(number).savefig(buf, format="png", dpi=110, bbox_inches="tight")
        images.append(base64.b64encode(buf.getvalue()).decode())
    plt.close("all")
    return images

class _TooManySteps(Exception):
    pass

def _show(value):
    """A short, readable description of a value for the step-through view."""
    kind = type(value).__name__
    if kind == "DataFrame":
        return f"DataFrame {value.shape[0]} rows × {value.shape[1]} columns", kind
    if kind in ("Series", "ndarray"):
        text = repr(value.tolist() if hasattr(value, "tolist") else value)
        return (text if len(text) <= 70 else text[:67] + "…"), kind
    text = repr(value)
    return (text if len(text) <= 70 else text[:67] + "…"), kind

def _variables(names):
    """Name, short value and type of each variable worth showing to a learner."""
    out = []
    for name, value in list(names.items()):
        if name.startswith("_") or name in ("OUTPUT", "SOURCE") or type(value).__name__ == "module":
            continue
        if isinstance(value, type):
            out.append([name, f"class {value.__name__}", "class"])
        elif callable(value):
            out.append([name, f"function {getattr(value, '__name__', name)}()", "function"])
        else:
            out.append([name, *_show(value)])
    return out

def _trace(code, ns, limit=300):
    """Run code one line at a time, recording the line, the variables and the output so far."""
    import contextlib
    steps = []
    printed = io.StringIO()

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != FILENAME:
            return None  # never step inside Python or library code
        if event in ("line", "return"):
            step = {"line": frame.f_lineno, "event": event, "scope": frame.f_code.co_name,
                    "vars": _variables(frame.f_locals), "out": printed.getvalue()}
            if event == "return" and frame.f_code.co_name != "<module>":
                step["returned"] = _show(arg)[0]
            steps.append(step)
            if len(steps) >= limit:
                raise _TooManySteps()
        return tracer

    error = None
    truncated = False
    try:
        compiled = compile(code, FILENAME, "exec")
        with contextlib.redirect_stdout(printed):
            sys.settrace(tracer)
            try:
                exec(compiled, ns)
            finally:
                sys.settrace(None)
    except _TooManySteps:
        truncated = True
    except BaseException as e:
        error = _error(e)
    steps.append({"line": None, "event": "end", "scope": "<module>", "vars": _variables(ns), "out": printed.getvalue()})
    return {"steps": steps, "error": error, "truncated": truncated}

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

// Packages lessons may import (served from pyodide/ by scripts/copy-pyodide.mjs), by import name.
const PACKAGES = { numpy: 'numpy', pandas: 'pandas', sqlite3: 'sqlite3', matplotlib: 'matplotlib', pylab: 'matplotlib' };
const loaded = new Set();

async function init(indexURL) {
  const { loadPyodide } = await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`);
  pyodide = await loadPyodide({ indexURL });
  await pyodide.runPythonAsync(HELPERS);
  py = {
    trace: pyodide.globals.get('_trace'),
    dict: pyodide.globals.get('dict'),
    exec: pyodide.globals.get('_exec'),
    check: pyodide.globals.get('_check'),
    setup: pyodide.globals.get('_setup'),
    newRun: pyodide.globals.get('_new_run'),
    figures: pyodide.globals.get('_figures'),
    findImports: pyodide.pyimport('pyodide.code').find_imports,
  };
}

const toJs = (proxy) => {
  if (!proxy) return null;
  const value = proxy.toJs({ dict_converter: Object.fromEntries });
  proxy.destroy();
  return value;
};

/** Load the packages this code (and its tests) imports, the first time each is needed. */
async function loadPackagesFor(id, sources) {
  const wanted = new Set();
  for (const src of sources) {
    let names = [];
    try {
      const found = py.findImports(src);
      names = found.toJs();
      found.destroy();
    } catch {
      /* a syntax error: running the code will report it */
    }
    for (const n of names) if (PACKAGES[n] && !loaded.has(PACKAGES[n])) wanted.add(PACKAGES[n]);
  }
  if (!wanted.size) return;
  const list = [...wanted];
  postMessage({ id, type: 'loading', packages: list });
  await pyodide.loadPackage(list, { messageCallback: () => {} });
  list.forEach((p) => loaded.add(p));
  py.setup(pyodide.toPy(list));
}

async function run({ id, code, stdin = '', tests = [], trace = false }) {
  await loadPackagesFor(id, [code, ...tests.map((t) => t.code)]);
  // Fresh copies of the sample data every run, even if earlier code changed or deleted them.
  pyodide.FS.mkdirTree('data');
  for (const [name, text] of Object.entries(datasets)) pyodide.FS.writeFile(`data/${name}`, text);
  postMessage({ id, type: 'start' }); // the time limit starts now, not during downloads
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

  py.newRun();
  const ns = py.dict();
  ns.set('__name__', '__main__');
  if (trace) {
    const traced = toJs(py.trace(code, ns));
    ns.destroy();
    py.figures().destroy(); // charts are not shown while stepping
    postMessage({ id, type: 'done', error: traced.error, steps: traced.steps, truncated: traced.truncated, ms: Math.round(performance.now() - started) });
    return;
  }
  const error = toJs(py.exec(code, ns));

  let results = null;
  if (!error && tests.length) {
    ns.set('OUTPUT', output); // tests can check what was printed…
    ns.set('SOURCE', code); // …and re-run the code with other values
    results = tests.map((t) => ({ name: t.name, ...toJs(py.check(t.code, ns)) }));
  }
  ns.destroy();
  const figures = py.figures();
  const images = figures.toJs();
  figures.destroy();
  postMessage({ id, type: 'done', error, results, images, ms: Math.round(performance.now() - started) });
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
      await run(data);
    } catch (e) {
      postMessage({ id: data.id, type: 'done', error: { type: 'InternalError', message: String(e?.message || e), text: String(e?.message || e) } });
    }
  }
};
