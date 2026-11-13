// Vite plugin: serves a course file with only its free lessons or only its paid lessons.
//
//   import { reactCourse } from '../react/course.jsx?part=free'   → lessons array holds the free lessons
//   import { reactCourse } from '../react/course.jsx?part=paid'   → lessons array holds the paid lessons
//
// Lessons stay in one file per course for easy editing; the build splits them so the paid lessons land in
// their own files, which can then be kept off the public site (see scripts/split-paid.mjs).
// Which lessons are free comes from src/learn/catalog.generated.json (written from paywall.config.js).
import { readFileSync } from 'node:fs';
import { parse } from '@babel/parser';
import { transform } from 'esbuild';

const PART = /^(.*\.jsx)\?part=(free|paid)$/;

/** Remove the lessons that do not belong to `part` from every `…lessons = [ … ]` array in the source. */
export function filterLessons(src, part, isFree, file = 'source') {
  const ast = parse(src, { sourceType: 'module', plugins: ['jsx'] });
  const cuts = [];
  let found = 0;
  for (const node of ast.program.body) {
    const decl = node.type === 'ExportNamedDeclaration' ? node.declaration : node;
    if (decl?.type !== 'VariableDeclaration') continue;
    for (const d of decl.declarations) {
      if (!/lessons$/i.test(d.id?.name || '') || d.init?.type !== 'ArrayExpression') continue;
      for (const el of d.init.elements) {
        const idProp = el?.type === 'ObjectExpression' && el.properties.find((p) => p.key?.name === 'id' && p.value?.type === 'StringLiteral');
        if (!idProp) throw new Error(`${file}: every lesson must be an object literal with id: '…'`);
        found++;
        if ((part === 'free') !== isFree(idProp.value.value)) cuts.push([el.start, el.end]);
      }
    }
  }
  if (!found) throw new Error(`${file}: no lessons array found`);
  let out = src;
  for (const [start, end] of cuts.sort((a, b) => b[0] - a[0])) {
    let stop = end;
    while (/\s/.test(out[stop])) stop++;
    if (out[stop] === ',') stop++;
    out = out.slice(0, start) + out.slice(stop);
  }
  return out;
}

export default function lessonParts({ catalogPath }) {
  let freeIds = null;
  const isFree = (id) => {
    if (!freeIds) {
      const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
      freeIds = new Set(catalog.courses.flatMap((c) => c.lessons.filter((l) => l.free).map((l) => l.id)));
    }
    return freeIds.has(id);
  };
  return {
    name: 'lab-lesson-parts',
    enforce: 'pre',
    buildStart() {
      freeIds = null; // re-read after the catalogue is regenerated
    },
    async load(id) {
      const m = id.match(PART);
      if (!m) return null;
      const [, file, part] = m;
      this.addWatchFile(file);
      const filtered = filterLessons(readFileSync(file, 'utf8'), part, isFree, file);
      const { code, map } = await transform(filtered, { loader: 'jsx', jsx: 'automatic', sourcefile: file, sourcemap: true, format: 'esm' });
      return { code, map };
    },
  };
}
