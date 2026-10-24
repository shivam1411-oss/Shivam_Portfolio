// iCloud Drive (which syncs ~/Documents) sometimes leaves "name 2.ext" copies of files that were
// just rewritten, e.g. by `cap sync`. Android rejects resource names with spaces, so the build fails.
// This removes such copies under the given folder, but only when they are identical to the original.
import { readdirSync, readFileSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
const dupe = /^(.*) \d+(\.[^.]+)?$/;
let problems = 0;

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    const m = name.match(dupe);
    if (!m) continue;
    const original = join(dir, m[1] + (m[2] ?? ''));
    if (existsSync(original) && readFileSync(original).equals(readFileSync(path))) {
      unlinkSync(path);
      console.log(`removed iCloud duplicate: ${path}`);
    } else {
      console.error(`duplicate differs from its original, not removed: ${path}`);
      problems++;
    }
  }
};

walk(root);
process.exit(problems ? 1 : 0);
