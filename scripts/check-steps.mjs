// Replays the "Do it yourself, step by step" walkthroughs and checks that steps marked as errors fail
// and all the others behave as described.
// Python, pandas, SQL and Matplotlib steps run in the same Python CodeJack uses in the browser (Pyodide),
// with the same sample data files. React steps are compiled and rendered, JQL steps are searched and
// kubectl steps are run against the cluster simulator (see the second half of this file).
//   node scripts/check-steps.mjs                  check everything
//   node scripts/check-steps.mjs --show pandas    also print each step's output for one course
// Steps add their code to the practice box unless they say otherwise: `fresh` starts again (from the
// lesson's `practice` starter, if it has one), `replaceLast` replaces the previous step's lines (or the
// last N lines), `prepend` and `insertAt` place the code, `edit: [old, new]` changes existing text, and
// `stdin` is what the Input box holds.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { loadPyodide } from 'pyodide';
import { datasets } from '../src/learn/python/datasets.js';
import { pythonSteps } from '../src/learn/guides/python-steps.js';
import { pandasSteps } from '../src/learn/guides/pandas-steps.js';
import { sqlSteps } from '../src/learn/guides/sql-steps.js';
import { vizSteps } from '../src/learn/guides/viz-steps.js';

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
import matplotlib.pyplot as _plt
_plt.show = lambda *args, **kwargs: None  # charts are counted after the run, as in CodeJack
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
// ---------------------------------------------------------------- React, Jira and Kubernetes
// These lessons are done in the course's own practice tool. The step files import those components, so
// they are bundled first (like scripts/gen-learn-catalog.mjs does for the courses).
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cache = join(root, 'node_modules/.cache/check-steps');
mkdirSync(cache, { recursive: true });
writeFileSync(
  join(cache, 'entry.js'),
  `export { reactSteps } from ${JSON.stringify(join(root, 'src/learn/guides/react-steps.jsx'))};
export { jiraSteps } from ${JSON.stringify(join(root, 'src/learn/guides/jira-steps.jsx'))};
export { k8sSteps } from ${JSON.stringify(join(root, 'src/learn/guides/k8s-steps.jsx'))};
export { createCluster, applyYaml, kubectl, settle } from ${JSON.stringify(join(root, 'src/learn/k8s/sim.js'))};
export { runJql } from ${JSON.stringify(join(root, 'src/learn/jira/jql.js'))};
export { sprintProblems } from ${JSON.stringify(join(root, 'src/learn/jira/widgets.jsx'))};
`
);
await build({ entryPoints: [join(cache, 'entry.js')], bundle: true, platform: 'node', format: 'esm', jsx: 'automatic', loader: { '.js': 'jsx' }, packages: 'external', outfile: join(cache, 'tech.mjs'), logLevel: 'error' });
const tech = await import(`${pathToFileURL(join(cache, 'tech.mjs')).href}?t=${Date.now()}`);
const React = await import('react');
const { renderToStaticMarkup } = await import('react-dom/server');
const { transform } = await import('sucrase');

const fail = (where, why) => {
  failures++;
  console.error(`✗ ${where}: ${why}`);
};
const showing = (course, lesson) => show === 'all' || show === course || show === lesson;
const report = (where, out, err, step) => console.log(`\n— ${where}\n  out: ${String(out).trim().split('\n').slice(-10).join('\n       ')}${err ? `\n  !!   ${err}` : ''}\n  see: ${step.see || ''}`);
const lessonCount = { react: 0, jira: 0, k8s: 0 };

/** The first render of a React step, as text. Throws like the practice box does when the code is wrong. */
function renderReact(code) {
  const compiled = transform(code, { transforms: ['jsx'], jsxRuntime: 'classic', production: true }).code;
  const names = ['React', 'useState', 'useEffect', 'useMemo', 'useRef', 'useReducer', 'useCallback', 'fakeFetch', 'console'];
  const App = new Function(...names, `${compiled}\n;return typeof App === "function" ? App : null;`)(
    React, React.useState, React.useEffect, React.useMemo, React.useRef, React.useReducer, React.useCallback, () => new Promise(() => {}), { log() {} }
  );
  if (!App) throw new Error('No App component');
  return renderToStaticMarkup(React.createElement(App)).replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/\s+/g, ' ');
}

for (const [lesson, guide] of Object.entries(tech.reactSteps)) {
  lessonCount.react++;
  guide.steps.forEach((step, i) => {
    count++;
    const where = `react/${lesson} step ${i + 1}`;
    let out = '';
    let err = '';
    try {
      out = renderReact(step.code);
    } catch (e) {
      err = e.message.split('\n')[0];
    }
    if (!!err !== !!step.error) fail(where, step.error ? 'should fail but rendered' : `should render but failed: ${err}`);
    for (const text of step.expect || []) if (!out.replace(/\s+/g, ' ').includes(text)) fail(where, `the first render does not contain "${text}" (it shows: ${out.trim()})`);
    if (showing('react', lesson)) report(where, out, err, step);
  });
}

for (const [lesson, guide] of Object.entries(tech.jiraSteps)) {
  lessonCount.jira++;
  guide.steps.forEach((step, i) => {
    count++;
    const where = `jira/${lesson} step ${i + 1}`;
    if (step.sprint) {
      const { total } = tech.sprintProblems(step.sprint);
      if (total !== step.total) fail(where, `those items add up to ${total} points, not ${step.total}`);
      if (showing('jira', lesson)) report(where, `${total} points`, '', step);
      return;
    }
    if (!step.code) return; // done by clicking in the lesson's own widget
    let items = [];
    let err = '';
    try {
      items = tech.runJql(step.code);
    } catch (e) {
      err = e.message;
    }
    if (!!err !== !!step.error) fail(where, step.error ? 'should fail but ran' : `should run but failed: ${err}`);
    if (!err && step.count !== undefined && items.length !== step.count) fail(where, `found ${items.length} work items, not ${step.count}`);
    if (showing('jira', lesson)) report(where, `${items.length}: ${items.map((it) => it.key).join(', ')}`, err, step);
  });
}

// The practice cluster each Kubernetes lesson starts with is read from its `practice` box.
for (const [lesson, guide] of Object.entries(tech.k8sSteps)) {
  lessonCount.k8s++;
  const box = guide.practice(lesson).props;
  const cluster = tech.createCluster();
  if (box.setup) {
    tech.applyYaml(cluster, box.setup);
    tech.settle(cluster, 8);
  }
  let yaml = box.yaml || '';
  guide.steps.forEach((step, i) => {
    count++;
    const where = `k8s/${lesson} step ${i + 1}`;
    if (step.yaml) yaml = step.yaml;
    let out = '';
    let err = '';
    for (const line of step.code.split('\n')) {
      tech.settle(cluster); // the learner types the next command a few seconds later
      try {
        out = tech.kubectl(cluster, line, yaml);
      } catch (e) {
        err = e.message;
      }
    }
    if (!!err !== !!step.error) fail(where, step.error ? 'should fail but ran' : `should run but failed: ${err}`);
    for (const text of step.expect || []) if (!out.includes(text)) fail(where, `the output does not contain "${text}"`);
    tech.settle(cluster);
    if (showing('k8s', lesson)) report(where, out, err, step);
  });
}

const lessons = Object.values(COURSES).reduce((n, c) => n + Object.keys(c).length, 0) + lessonCount.react + lessonCount.jira + lessonCount.k8s;
console.log(failures ? `${failures} step(s) need fixing.` : `All ${count} steps in ${lessons} lessons behave as described.`);
process.exit(failures ? 1 : 0);
