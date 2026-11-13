// Runs after `vite build`. With the paywall on (VITE_PAYWALL=on), moves the files that only paid content
// needs out of dist/ (the public site) into dist-paid/<course>/, ready to upload to private storage, and
// writes dist/paid-manifest.json so the app knows which file to request for each course.
// Files that free pages also use stay public. Always removes the build manifest from the published site.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAID_ROOTS } from './paid-roots.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const paidDir = join(root, 'dist-paid');
const manifestPath = join(dist, '.vite/manifest.json');

if (process.env.VITE_PAYWALL !== 'on') {
  rmSync(join(dist, '.vite'), { recursive: true, force: true });
  rmSync(join(dist, 'paid-manifest.json'), { force: true });
  rmSync(paidDir, { recursive: true, force: true });
  console.log('Paywall off: every lesson is published.');
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const paidRootKeys = new Set(Object.values(PAID_ROOTS).flatMap((r) => Object.values(r)));

function reach(starts, stop) {
  const seen = new Set();
  const walk = (key) => {
    if (seen.has(key) || stop(key) || !manifest[key]) return;
    seen.add(key);
    for (const k of [...(manifest[key].imports || []), ...(manifest[key].dynamicImports || [])]) walk(k);
  };
  starts.forEach(walk);
  return seen;
}

// Everything a free visitor's pages can load, without stepping into paid content.
const publicKeys = reach(
  Object.keys(manifest).filter((k) => k.endsWith('.html')),
  (k) => paidRootKeys.has(k)
);
const publicFiles = new Set([...publicKeys].map((k) => manifest[k].file));

rmSync(paidDir, { recursive: true, force: true });
const out = {};
const paidFiles = new Set();
for (const [course, roots] of Object.entries(PAID_ROOTS)) {
  const keys = reach(Object.values(roots), (k) => publicKeys.has(k));
  const files = [...new Set([...keys].map((k) => manifest[k].file))].filter((f) => !publicFiles.has(f));
  for (const k of keys) if (manifest[k].css?.length) throw new Error(`${k} has its own CSS, which the paid loader does not handle`);
  mkdirSync(join(paidDir, course), { recursive: true });
  for (const f of files) {
    cpSync(join(dist, f), join(paidDir, course, basename(f)));
    paidFiles.add(f);
  }
  out[course] = {
    lessons: basename(manifest[roots.lessons].file),
    kb: basename(manifest[roots.kb].file),
    files: files.map((f) => basename(f)).sort(),
  };
}
for (const f of paidFiles) rmSync(join(dist, f));
rmSync(join(dist, '.vite'), { recursive: true, force: true });
writeFileSync(join(dist, 'paid-manifest.json'), `${JSON.stringify(out, null, 1)}\n`);

const total = Object.values(out).reduce((n, c) => n + c.files.length, 0);
console.log(`Paywall on: ${paidFiles.size} paid files moved to dist-paid/ (${total} across ${Object.keys(out).length} courses).`);
if (!existsSync(join(dist, 'learn.html'))) throw new Error('dist/learn.html missing');
