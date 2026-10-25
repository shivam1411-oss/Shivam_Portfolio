// Copies the built website (../dist) into desktop/site, which electron-builder bundles into the app.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const site = fileURLToPath(new URL('./site', import.meta.url));

if (!existsSync(`${dist}/learn.html`)) {
  console.error('No built site found. Run "npm run build" in the project root first (or use "npm run mac").');
  process.exit(1);
}
rmSync(site, { recursive: true, force: true });
cpSync(dist, site, { recursive: true });
console.log('Copied dist/ → desktop/site/');
