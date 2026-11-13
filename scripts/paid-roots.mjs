// The source files that hold each paid course's paid content: the lessons after the free first module,
// and the knowledge base. Used by vite.config.js and scripts/split-paid.mjs.
const COURSES = ['python', 'pandas', 'sql', 'viz', 'react', 'jira', 'k8s'];

export const PAID_ROOTS = Object.fromEntries(
  COURSES.map((id) => [id, { lessons: `src/learn/content/${id}.paid.js`, kb: `src/learn/kb/${id}.js` }])
);
