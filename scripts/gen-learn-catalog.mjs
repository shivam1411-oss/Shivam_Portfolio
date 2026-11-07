// Writes src/learn/catalog.generated.json: the Learning Lab's course list, modules and lesson titles,
// and knowledge-base topic ids, without any lesson content. The app loads this small file up front and
// fetches each course's full lessons only when they are opened (see src/learn/catalog.js).
// Runs before `npm run dev` and `npm run build`; it bundles the course files with esbuild so Node can read them.
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cache = join(root, 'node_modules/.cache/learn-catalog');
const out = join(root, 'src/learn/catalog.generated.json');
mkdirSync(cache, { recursive: true });

async function load(entry, name) {
  const file = join(cache, `${name}.mjs`);
  await build({
    entryPoints: [join(root, entry)],
    bundle: true,
    platform: 'node',
    format: 'esm',
    jsx: 'automatic',
    loader: { '.js': 'jsx' },
    packages: 'external',
    outfile: file,
    logLevel: 'error',
  });
  return import(`${pathToFileURL(file).href}?t=${Date.now()}`);
}

const { courses } = await load('src/learn/courses.js', 'courses');
const { knowledgeBases } = await load('src/learn/kb/all.js', 'kb');

const COURSE_FIELDS = ['id', 'title', 'tagline', 'blurb', 'levels', 'icon', 'audience', 'needs', 'outcomes', 'extras', 'usesPython'];
const catalog = {
  courses: courses.map((c) => ({
    ...Object.fromEntries(COURSE_FIELDS.filter((k) => c[k] !== undefined).map((k) => [k, c[k]])),
    modules: c.modules.map(({ id, title, level, blurb }) => ({ id, title, level, blurb })),
    lessons: c.lessons.map((l) => ({
      id: l.id,
      module: l.module,
      title: l.title,
      minutes: l.minutes,
      exercises: (l.exercises || []).map((e) => ({ id: e.id })),
    })),
  })),
  kb: Object.fromEntries(Object.entries(knowledgeBases).map(([id, kb]) => [id, { intro: kb.intro, topics: kb.topics.map((t) => t.id) }])),
};

const text = `${JSON.stringify(catalog, null, 1)}\n`;
let old = '';
try {
  old = readFileSync(out, 'utf8');
} catch {
  /* first run */
}
if (old !== text) writeFileSync(out, text);
const lessons = catalog.courses.reduce((s, c) => s + c.lessons.length, 0);
console.log(`Learning Lab catalogue: ${catalog.courses.length} courses, ${lessons} lessons${old === text ? ' (unchanged)' : ' (updated)'}`);
