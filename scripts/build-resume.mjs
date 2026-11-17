// Prints resume/resume.html to public/assets/Shivam-Soni-Resume.pdf with headless Chrome (or Brave/Edge/Chromium).
// The PDF keeps real, selectable text and clickable links, and embeds the site's own font.
//   npm run resume
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'resume/resume.html');
const output = join(root, 'public/assets/Shivam-Soni-Resume.pdf');

const browsers = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = browsers.find((b) => existsSync(b));
if (!browser) {
  console.error('No Chrome-based browser found. Install Google Chrome, or set CHROME_PATH to one.');
  process.exit(1);
}

execFileSync(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--allow-file-access-from-files',
    `--print-to-pdf=${output}`,
    pathToFileURL(source).href,
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] }
);

const pdf = readFileSync(output, 'latin1');
const pages = (pdf.match(/\/Type\s*\/Page[^s]/g) || []).length;
const links = (pdf.match(/\/URI\s*\(/g) || []).length;
console.log(`Wrote public/assets/Shivam-Soni-Resume.pdf: ${pages} page(s), ${links} link(s), ${Math.round(statSync(output).size / 1024)} KB.`);
