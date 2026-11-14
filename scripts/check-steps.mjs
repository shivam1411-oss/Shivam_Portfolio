// Replays every "Do it yourself, step by step" walkthrough that is done in the Python practice box
// (the Python, pandas, SQL and Matplotlib courses) and checks that steps marked as errors fail and all
// the others run cleanly. It uses the same Python the Lab runs in the browser (Pyodide), with the same
// sample data files.
//   node scripts/check-steps.mjs                  check everything
//   node scripts/check-steps.mjs --show pandas    also print each step's output for one course
// Steps add their code to the practice box unless they say otherwise: `fresh` starts again (from the
// lesson's `practice` starter, if it has one), `replaceLast` replaces the previous step's lines (or the
// last N lines), `prepend` and `insertAt` place the code, `edit: [old, new]` changes existing text, and
// `stdin` is what the Input box holds.
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPyodide } from 'pyodide';
import { datasets } from '../src/learn/python/datasets.js';
import { pythonSteps } from '../src/learn/guides/python-steps.js';
import { pandasSteps, sqlSteps, vizSteps } from '../src/learn/guides/data-steps.js';

const COURSES = { python: pythonSteps, pandas: pandasSteps, sql: sqlSteps, viz: vizSteps };
const showAt = process.argv.indexOf('--show');
const show = showAt > -1 ? process.argv[showAt + 1] || 'all' : null;

const base = join(dirname(fileURLToPath(import.meta.url)), '../public/pyodide/');
if (!existsSync(`${base}pyodide-lock.json`)) {
  console.error('public/pyodide is missing. Run `node scripts/copy-pyodide.mjs` first.');
  process.exit(1);
}
const py = await loadPyodide({ lockFileURL: `${base}pyodide-lock.json`, packageBaseUrl: base });
await py.loadPackage(['pandas', 'sqlite3', 'matplotlib'], { messageCallback: () => {} });
py.FS.mkdirTree('/work/data');
py.runPython(`
import io, os, sys
import matplotlib
matplotlib.use("Agg")
os.chdir("/work")

def _run(code, stdin):
    out = io.StringIO()
    lines = iter(stdin.split("\\n"))
    def _input(prompt=""):
        out.write(str(prompt))
        return next(lines)
    old, sys.stdout = sys.stdout, out
    err, charts = "", 0
    try:
        exec(compile(code, "<practice>", "exec"), {"__name__": "__main__", "input": _input})
    except BaseException as e:
        err = f"{type(e).__name__}: {e}"
    finally:
        sys.stdout = old
        if "matplotlib.pyplot" in sys.modules:
            plt = sys.modules["matplotlib.pyplot"]
            charts = len(plt.get_fignums())
            plt.close("all")
    return [out.getvalue(), err, charts]
`);
const run = py.globals.get('_run');

let failures = 0;
let count = 0;
for (const [course, lessons] of Object.entries(COURSES)) {
  for (const [lesson, guide] of Object.entries(lessons)) {
    const starter = () => (guide.practice ?? '').split('\n').filter((l, i, all) => l || i < all.length - 1);
    let lines = starter();
    let lastAdded = 0;
    let stdin = '';
    guide.steps.forEach((step, i) => {
      count++;
      const code = step.code ? step.code.split('\n') : [];
      if (step.edit) {
        const before = lines.join('\n');
        if (!before.includes(step.edit[0])) {
          failures++;
          console.error(`✗ ${course}/${lesson} step ${i + 1}: nothing to edit ("${step.edit[0]}" is not in the box)`);
        }
        lines = before.replace(step.edit[0], step.edit[1]).split('\n');
      }
      if (step.fresh) lines = starter();
      if (step.replaceLast) lines = lines.slice(0, lines.length - (step.replaceLast === true ? lastAdded : step.replaceLast));
      if (step.prepend) lines = [...code, ...lines];
      else if (step.insertAt !== undefined) lines.splice(step.insertAt, 0, ...code);
      else lines.push(...code);
      if (code.length) lastAdded = code.length;
      if (step.stdin !== undefined) stdin = step.stdin;

      for (const [name, text] of Object.entries(datasets)) py.FS.writeFile(`/work/data/${name}`, text);
      const [out, err, charts] = run(lines.join('\n'), stdin).toJs();
      if (!!err !== !!step.error) {
        failures++;
        console.error(`✗ ${course}/${lesson} step ${i + 1}: ${step.error ? 'should fail but ran' : `should run but failed: ${err}`}`);
      }
      if (step.chart && !charts) {
        failures++;
        console.error(`✗ ${course}/${lesson} step ${i + 1}: should draw a chart but drew none`);
      }
      if (show === 'all' || show === course || show === lesson) {
        const tail = out.trim().split('\n').slice(-12).join('\n       ');
        console.log(`\n— ${course}/${lesson} ${i + 1}${charts ? ` [${charts} chart(s)]` : ''}\n  out: ${tail}${err ? `\n  !!   ${err}` : ''}\n  see: ${step.see || ''}`);
      }
    });
  }
}
console.log(failures ? `${failures} step(s) need fixing.` : `All ${count} steps in ${Object.values(COURSES).reduce((n, c) => n + Object.keys(c).length, 0)} lessons behave as described.`);
process.exit(failures ? 1 : 0);
