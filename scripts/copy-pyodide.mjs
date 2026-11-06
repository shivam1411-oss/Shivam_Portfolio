// Copies the Python runtime (Pyodide) from node_modules into public/pyodide so the site serves it
// itself: no third-party CDN, and it works offline in the Mac and Android apps. Runs before dev and build.
import { cpSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const from = fileURLToPath(new URL('../node_modules/pyodide/', import.meta.url));
const to = fileURLToPath(new URL('../public/pyodide/', import.meta.url));
const files = ['pyodide.mjs', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];

mkdirSync(to, { recursive: true });
for (const f of files) cpSync(from + f, to + f);
const { version } = JSON.parse(readFileSync(from + 'package.json', 'utf8'));
console.log(`Copied Pyodide ${version} → public/pyodide/`);
