// The Learning Lab's catalogue: course and lesson titles, modules and exercise ids, small enough to load
// up front. It comes from catalog.generated.json, which scripts/gen-learn-catalog.mjs writes from the
// full course content before every dev start and build.
// Full lessons (text, widgets, exercises, quizzes, guides) are loaded per course with loadCourse(),
// so opening the Lab does not download every course.
import data from './catalog.generated.json';

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

const loaders = {
  site: () => import('./content/site'),
  python: () => import('./content/python'),
  pandas: () => import('./content/pandas'),
  sql: () => import('./content/sql'),
  viz: () => import('./content/viz'),
  react: () => import('./content/react'),
  jira: () => import('./content/jira'),
  k8s: () => import('./content/k8s'),
};
const loaded = new Map(); // id -> full course
const pending = new Map(); // id -> promise

/** The full course if it has already loaded, otherwise null. */
export const loadedCourse = (id) => loaded.get(id) || null;

/** Load a course's full lessons (cached). */
export function loadCourse(id) {
  if (loaded.has(id)) return Promise.resolve(loaded.get(id));
  if (!pending.has(id)) {
    pending.set(
      id,
      loaders[id]().then(
        (m) => {
          loaded.set(id, m.default);
          return m.default;
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
  if (loaded.has(id) || pending.has(id) || !loaders[id]) return;
  const go = () => loadCourse(id).catch(() => {});
  if ('requestIdleCallback' in window) window.requestIdleCallback(go, { timeout: 3000 });
  else setTimeout(go, 1200);
}
