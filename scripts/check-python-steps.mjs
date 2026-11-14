// Replays every "Do it yourself, step by step" walkthrough of the Python course in real Python and
// checks that steps marked as errors fail and all the others run cleanly.
//   node scripts/check-python-steps.mjs            check
//   node scripts/check-python-steps.mjs --show     also print each step's output (to compare with "You should see")
// Steps add their code to the practice box unless they say otherwise: `fresh` starts again, `replaceLast`
// replaces the previous step's lines (or the last N lines), `prepend` and `insertAt` place the code,
// `edit: [old, new]` changes existing text, and `stdin` is what the Input box holds.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pythonSteps } from '../src/learn/guides/python-steps.js';

const show = process.argv.includes('--show');
const python = ['python3', 'python'].find((p) => spawnSync(p, ['--version']).status === 0);
if (!python) {
  console.log('Python is not installed here: skipped the step-by-step check.');
  process.exit(0);
}

let failures = 0;
let count = 0;
for (const [lesson, guide] of Object.entries(pythonSteps)) {
  let lines = (guide.practice ?? '').split('\n').filter(Boolean);
  let lastAdded = 0;
  let stdin = '';
  const dir = mkdtempSync(join(tmpdir(), 'py-steps-'));
  guide.steps.forEach((step, i) => {
    count++;
    const code = step.code ? step.code.split('\n') : [];
    if (step.edit) {
      const before = lines.join('\n');
      if (!before.includes(step.edit[0])) {
        failures++;
        console.error(`✗ ${lesson} step ${i + 1}: nothing to edit ("${step.edit[0]}" is not in the box)`);
      }
      lines = before.replace(step.edit[0], step.edit[1]).split('\n');
    }
    if (step.fresh) lines = [];
    if (step.replaceLast) lines = lines.slice(0, lines.length - (step.replaceLast === true ? lastAdded : step.replaceLast));
    if (step.prepend) lines = [...code, ...lines];
    else if (step.insertAt !== undefined) lines.splice(step.insertAt, 0, ...code);
    else lines.push(...code);
    if (code.length) lastAdded = code.length;
    if (step.stdin !== undefined) stdin = step.stdin;

    const run = spawnSync(python, ['-c', lines.join('\n')], { cwd: dir, input: `${stdin}\n`, encoding: 'utf8', timeout: 20000 });
    const failed = run.status !== 0;
    if (failed !== !!step.error) {
      failures++;
      console.error(`✗ ${lesson} step ${i + 1}: ${step.error ? 'should fail but ran' : 'should run but failed'}\n${run.stderr.trim().split('\n').slice(-2).join('\n')}`);
    }
    if (show) {
      const err = failed ? ` !! ${run.stderr.trim().split('\n').pop()}` : '';
      console.log(`\n— ${lesson} ${i + 1}\n  out: ${run.stdout.trim().replace(/\n/g, ' ⏎ ')}${err}\n  see: ${step.see || ''}`);
    }
  });
  rmSync(dir, { recursive: true, force: true });
}
console.log(failures ? `${failures} step(s) need fixing.` : `All ${count} steps in ${Object.keys(pythonSteps).length} lessons behave as described.`);
process.exit(failures ? 1 : 0);
