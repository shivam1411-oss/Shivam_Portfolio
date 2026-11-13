// Uploads the paid lesson files (dist-paid/<course>/*.js, made by scripts/split-paid.mjs) to the private
// Supabase Storage bucket `paid-lessons`, so learners who own a course can download them.
// Runs in the deploy workflow after `npm run build` and before the site is published.
//
// Needs: VITE_PAYWALL=on (otherwise it does nothing) and SUPABASE_SECRET_KEY, the project's secret key
// (sb_secret_… or the older service_role key), stored as a GitHub Actions secret: never in the repository.
// Optional: SUPABASE_URL (defaults to the project in src/learn/supabase.config.js).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BUCKET = 'paid-lessons';

if (process.env.VITE_PAYWALL !== 'on') {
  console.log('Paywall off: no paid lessons to upload.');
  process.exit(0);
}

const configText = readFileSync(join(root, 'src/learn/supabase.config.js'), 'utf8');
const url = (process.env.SUPABASE_URL || configText.match(/SUPABASE_URL = '([^']+)'/)?.[1] || '').replace(/\/$/, '');
const key = (process.env.SUPABASE_SECRET_KEY || '').trim();
if (!url) throw new Error('SUPABASE_URL is not set.');
if (!key) {
  console.error('SUPABASE_SECRET_KEY is missing. Add it in GitHub → Settings → Secrets and variables → Actions → Secrets.');
  process.exit(1);
}
// New sb_secret_ keys go in the apikey header only; older JWT service keys also as a Bearer token.
const auth = key.startsWith('sb_secret_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };

const manifestPath = join(root, 'dist/paid-manifest.json');
const paidDir = join(root, 'dist-paid');
if (!existsSync(manifestPath) || !existsSync(paidDir)) throw new Error('Run `npm run build` with VITE_PAYWALL=on first.');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

let uploaded = 0;
for (const [course, info] of Object.entries(manifest)) {
  const onDisk = new Set(readdirSync(join(paidDir, course)));
  for (const file of info.files) {
    if (!onDisk.has(file)) throw new Error(`dist-paid/${course}/${file} is missing`);
    const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${course}/${file}`, {
      method: 'POST',
      headers: {
        ...auth,
        'Content-Type': 'text/javascript',
        'Cache-Control': 'max-age=31536000', // file names change whenever the content does
        'x-upsert': 'true',
      },
      body: readFileSync(join(paidDir, course, file)),
    });
    if (!res.ok) {
      console.error(`Upload failed for ${course}/${file}: ${res.status} ${(await res.text()).slice(0, 300)}`);
      process.exit(1); // stop the deploy: the new site must not point to files that are not uploaded
    }
    uploaded++;
  }
}

// Check one file is really there (and private: the download needs the secret key).
const [course, info] = Object.entries(manifest)[0];
const check = await fetch(`${url}/storage/v1/object/authenticated/${BUCKET}/${course}/${info.lessons}`, { headers: auth });
if (!check.ok) {
  console.error(`Uploaded, but ${course}/${info.lessons} could not be read back (${check.status}).`);
  process.exit(1);
}
console.log(`Uploaded ${uploaded} paid lesson files for ${Object.keys(manifest).length} courses to the private '${BUCKET}' bucket.`);
