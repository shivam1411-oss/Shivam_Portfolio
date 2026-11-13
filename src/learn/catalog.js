// The Learning Lab's catalogue: course and lesson titles, modules and exercise ids, small enough to load
// up front. It comes from catalog.generated.json, which scripts/gen-learn-catalog.mjs writes from the
// full course content before every dev start and build.
// Full lessons (text, widgets, exercises, quizzes, guides) are loaded per course with loadCourse(),
// so opening the Lab does not download every course.
import data from './catalog.generated.json';
import { loadPaidLessons, ownsCourse } from './access';

/** Course order on the Courses page. */
export const COURSE_IDS = ['site', 'python', 'pandas', 'sql', 'viz', 'react', 'jira', 'k8s'];

export const courses = data.courses;
export const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));
/** Knowledge-base intros and topic ids per course (the topics themselves load per course). */
export const kbCatalog = data.kb;

export const lessonKey = (course, lesson) => `${course.id}/${lesson.id}`;
export const lessonHash = (course, lesson) => `#/c/${course.id}/${lesson.id}`;

export { learningPath, learningPaths, techPath } from './paths';

// ---------------------------------------------------------------- loading full course content

// Learn the Code is free throughout; paid courses load their free first module here and their paid
// lessons through the access layer.
const freeLoaders = {
  site: () => import('./content/site').then((m) => m.default.lessons),
  python: () => import('./content/python.free.js').then((m) => m.default),
  pandas: () => import('./content/pandas.free.js').then((m) => m.default),
  sql: () => import('./content/sql.free.js').then((m) => m.default),
  viz: () => import('./content/viz.free.js').then((m) => m.default),
  react: () => import('./content/react.free.js').then((m) => m.default),
  jira: () => import('./content/jira.free.js').then((m) => m.default),
  k8s: () => import('./content/k8s.free.js').then((m) => m.default),
};
const loaded = new Map(); // id -> full course
const pending = new Map(); // id -> promise

/** The full course if it has already loaded, otherwise null. */
export const loadedCourse = (id) => loaded.get(id) || null;

/** Forget loaded courses (after signing in, out or buying, so locked lessons are re-checked). */
export function forgetLoadedCourses() {
  loaded.clear();
  pending.clear();
}

/**
 * Load a course's lessons (cached). Lessons the learner cannot open yet come back as catalogue entries
 * marked `locked: true` (title, goals and module, no content).
 */
export function loadCourse(id) {
  if (loaded.has(id)) return Promise.resolve(loaded.get(id));
  if (!pending.has(id)) {
    const meta = courseById[id];
    pending.set(
      id,
      Promise.all([
        freeLoaders[id](),
        meta.paid && ownsCourse(id)
          ? loadPaidLessons(id).catch((e) => {
              if (e.locked) return [];
              throw e;
            })
          : [],
      ]).then(
        ([free, paid]) => {
          const byId = new Map([...free, ...paid].map((l) => [l.id, l]));
          const course = { ...meta, lessons: meta.lessons.map((l) => byId.get(l.id) || { ...l, locked: true }) };
          loaded.set(id, course);
          return course;
        },
        (e) => {
          pending.delete(id); // allow a retry
          throw e;
        }
      )
    );
  }
  return pending.get(id);
}

/** Fetch a course in the background when the browser is idle, so opening a lesson is instant. */
export function prefetchCourse(id) {
  if (loaded.has(id) || pending.has(id) || !freeLoaders[id]) return;
  const go = () => loadCourse(id).catch(() => {});
  if ('requestIdleCallback' in window) window.requestIdleCallback(go, { timeout: 3000 });
  else setTimeout(go, 1200);
}
