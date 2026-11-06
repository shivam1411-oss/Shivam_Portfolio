// Copies the Python runtime (Pyodide) into public/pyodide so the site serves it itself: no
// third-party CDN at run time, and it works offline in the Android app. Runs before dev and build.
//
// The core comes from the pyodide npm package. The extra packages the data courses use (pandas,
// NumPy, SQLite, Matplotlib and their dependencies) are not in the npm package, so they are
// downloaded once from Pyodide's CDN into node_modules/.cache, checked against the SHA-256 in
// pyodide-lock.json, and copied from the cache after that.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const from = fileURLToPath(new URL('../node_modules/pyodide/', import.meta.url));
const to = fileURLToPath(new URL('../public/pyodide/', import.meta.url));
const cache = fileURLToPath(new URL('../node_modules/.cache/pyodide-packages/', import.meta.url));
const core = ['pyodide.mjs', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];

// Packages lessons may import; their dependencies are added from the lock file.
const COURSE_PACKAGES = ['pandas', 'sqlite3', 'matplotlib'];

mkdirSync(to, { recursive: true });
mkdirSync(cache, { recursive: true });
for (const f of core) cpSync(from + f, to + f);

const { version } = JSON.parse(readFileSync(from + 'package.json', 'utf8'));
const lock = JSON.parse(readFileSync(from + 'pyodide-lock.json', 'utf8')).packages;

const needed = new Set();
const add = (name) => {
  if (needed.has(name)) return;
  if (!lock[name]) throw new Error(`Pyodide ${version} has no package "${name}"`);
  needed.add(name);
  lock[name].depends.forEach(add);
};
COURSE_PACKAGES.forEach(add);

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

let downloaded = 0;
for (const name of needed) {
  const { file_name: file, sha256: expected } = lock[name];
  const cached = cache + file;
  if (!existsSync(cached) || sha256(readFileSync(cached)) !== expected) {
    const url = `https://cdn.jsdelivr.net/pyodide/v${version}/full/${file}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (sha256(buf) !== expected) throw new Error(`Checksum mismatch for ${file}`);
    writeFileSync(cached, buf);
    downloaded++;
  }
  cpSync(cached, to + file);
}

console.log(`Copied Pyodide ${version} and ${needed.size} packages (${downloaded} downloaded) → public/pyodide/`);
