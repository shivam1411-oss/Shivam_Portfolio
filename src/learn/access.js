// Who can open which lessons, and how paid lessons are loaded.
//
// Paywall OFF (VITE_PAYWALL not "on"; the live site today): everything is free and paid lessons load
// like any other part of the site.
//
// Paywall ON: the first module of each paid course is public. The rest of each paid course (lessons
// and knowledge base) is built into separate files that are NOT published with the site
// (scripts/split-paid.mjs moves them to dist-paid/). They are downloaded from private storage only for
// learners who own the course, then run in the page like the public files (see importPaidFile).
import { SUPABASE_KEY, SUPABASE_URL } from './supabase.config';

export const PAYWALL = import.meta.env.VITE_PAYWALL === 'on';

// ---------------------------------------------------------------- ownership

const listeners = new Set();
// Local testing only: VITE_PAYWALL_TEST_OWNED=react,all pretends this browser owns those products.
let owned = new Set(String(import.meta.env.VITE_PAYWALL_TEST_OWNED || '').split(',').filter(Boolean));
let authHeaders = async () => ({});

export const subscribeAccess = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
let version = 0;
export const getAccessVersion = () => version;

/** Set what the signed-in learner owns (product ids: course ids or 'all'). Called by the account code. */
export function setOwned(products) {
  owned = new Set(products);
  version++;
  paidModules.clear();
  listeners.forEach((fn) => fn());
}

/** Headers that prove who the learner is when downloading paid files (set by the account code). */
export function setAuthHeaders(fn) {
  authHeaders = fn;
}

/** Can the learner open this course's paid lessons? */
export const ownsCourse = (courseId) => !PAYWALL || owned.has(courseId) || owned.has('all');

/** Can the learner open this lesson? `course` and `lesson` come from the catalogue. */
export const canOpen = (course, lesson) => !PAYWALL || !course.paid || lesson.free || ownsCourse(course.id);

export class LockedError extends Error {
  constructor(courseId) {
    super(`The ${courseId} course is locked`);
    this.locked = true;
  }
}

// ---------------------------------------------------------------- loading paid content

// Used when the paywall is off (and in development): ordinary imports.
const directLessons = {
  python: () => import('./content/python.paid.js'),
  pandas: () => import('./content/pandas.paid.js'),
  sql: () => import('./content/sql.paid.js'),
  viz: () => import('./content/viz.paid.js'),
  react: () => import('./content/react.paid.js'),
  jira: () => import('./content/jira.paid.js'),
  k8s: () => import('./content/k8s.paid.js'),
};

const PAID_BASE = import.meta.env.VITE_PAID_BASE || `${SUPABASE_URL}/storage/v1/object/authenticated/paid-lessons/`;
let manifestPromise = null;
const paidModules = new Map(); // "course/file" -> Promise<blob URL>

function paidManifest() {
  manifestPromise ||= fetch(new URL('paid-manifest.json', document.baseURI)).then((r) => {
    if (!r.ok) throw new Error('The paid-lessons index is missing from this build.');
    return r.json();
  });
  return manifestPromise;
}

const publicAsset = (name) => new URL(`assets/${name}`, document.baseURI).href;

/**
 * Download one paid file and turn it into an importable module. Its imports of public files are pointed
 * at the published copies (so React, the editor etc. are shared with the page); imports of other paid
 * files are loaded the same way first.
 */
function importPaidFile(course, file, info) {
  const key = `${course}/${file}`;
  if (!paidModules.has(key)) {
    paidModules.set(
      key,
      (async () => {
        const res = await fetch(`${PAID_BASE}${course}/${file}`, { headers: { apikey: SUPABASE_KEY, ...(await authHeaders()) } });
        if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404) throw new LockedError(course);
        if (!res.ok) throw new Error(`Could not download the lesson (${res.status}).`);
        let text = await res.text();
        const names = [...new Set([...text.matchAll(/(?:from|import)\s*\(?\s*"\.\/([\w.-]+\.js)"/g)].map((m) => m[1]))];
        const urls = {};
        for (const name of names) urls[name] = info.files.includes(name) ? await importPaidFile(course, name, info) : publicAsset(name);
        text = text.replace(/((?:from|import)\s*\(?\s*)"\.\/([\w.-]+\.js)"/g, (m, pre, name) => `${pre}"${urls[name]}"`);
        // Relative paths inside the file (e.g. preloads) resolve against the public assets folder.
        text = text.replaceAll('import.meta.url', JSON.stringify(publicAsset('paid.js')));
        return URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
      })().catch((e) => {
        paidModules.delete(key);
        throw e;
      })
    );
  }
  return paidModules.get(key);
}

async function loadPaid(course, kind) {
  const info = (await paidManifest())[course];
  if (!info?.[kind]) throw new Error(`No paid ${kind} for ${course} in this build.`);
  const url = await importPaidFile(course, info[kind], info);
  return import(/* @vite-ignore */ url);
}

/** The paid lessons of a course (with their guides). Throws LockedError if the learner does not own it. */
export async function loadPaidLessons(courseId) {
  if (!PAYWALL) return (await directLessons[courseId]()).default;
  if (!ownsCourse(courseId)) throw new LockedError(courseId);
  return (await loadPaid(courseId, 'lessons')).default;
}

/** A paid course's knowledge base. Throws LockedError if the learner does not own it. */
export async function loadPaidKb(courseId, direct) {
  if (!PAYWALL) return direct();
  if (!ownsCourse(courseId)) throw new LockedError(courseId);
  const mod = await loadPaid(courseId, 'kb');
  return Object.values(mod).find((v) => v && typeof v === 'object' && Array.isArray(v.topics));
}

// ---------------------------------------------------------------- prices (live from Supabase)

let pricesPromise = null;
/** { python: 39900, …, all: 149900 } in paise, from Supabase; null if it cannot be loaded. */
export function loadPrices() {
  pricesPromise ||= fetch(`${SUPABASE_URL}/rest/v1/products?select=id,title,price_paise&active=eq.true`, { headers: { apikey: SUPABASE_KEY } })
    .then((r) => (r.ok ? r.json() : null))
    .then((rows) => (rows ? Object.fromEntries(rows.map((p) => [p.id, p.price_paise])) : null))
    .catch(() => null);
  return pricesPromise;
}

export const formatRupees = (paise) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
