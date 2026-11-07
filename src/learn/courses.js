import { lessons as siteLessons, modules as siteModules } from './lessons';
import { pandasCourse } from './data/pandas';
import { sqlCourse } from './data/sql';
import { vizCourse } from './data/viz';
import { pythonCourse } from './python/course';
import { reactCourse } from './react/course';
import { jiraCourse } from './jira/course';
import { k8sCourse } from './k8s/course';
import { pandasGuide, sqlGuide, vizGuide } from './guides/data';
import { pythonGuide } from './guides/python';
import { siteGuide } from './guides/site';
import { jiraGuide, k8sGuide, reactGuide } from './guides/tech';

// Every course in the Learning Lab. To add one, create its modules and lessons (see python/ for an
// example with runnable code), a beginner guide in guides/, and an entry here; the hub, navigation
// and progress pick it up.
// A lesson has: id, module, title, minutes, goals, body (component), optional exercises and quiz.
// Its guide has: idea, terms (glossary ids), mistakes, faq and recap, shown around the lesson.

// Attach each lesson's beginner guide.
const withGuide = (course, guide) => ({ ...course, lessons: course.lessons.map((l) => ({ ...l, guide: guide[l.id] })) });

export const courses = [
  withGuide(
    {
      id: 'site',
      title: 'Learn the Code',
      tagline: 'How this portfolio was built, change by change',
      blurb:
        'React, Tailwind, animations, canvas effects, performance, the AI chat, deploying, the Android app, and how Python was made to run in this Learning Lab, explained from zero with the real code and playgrounds.',
      levels: 'Beginner',
      icon: 'site',
      audience: 'Anyone curious how a modern website is built, with no coding experience needed.',
      needs: 'Nothing. Every term is explained as you go.',
      outcomes: ['Read and change the site\'s code with confidence', 'Explain React, Tailwind, canvas animation and deployment', 'Know how the AI chat and in-browser Python work'],
      modules: siteModules,
      lessons: siteLessons,
      extras: [{ hash: '#/timeline', label: 'What changed, in order' }],
    },
    siteGuide
  ),
  withGuide(
    {
      ...pythonCourse,
      audience: 'Complete beginners, and Excel users who want to automate their work.',
      needs: 'Nothing. Start at lesson 1 and run every example.',
      outcomes: ['Write Python programs with variables, loops, functions and classes', 'Read and write files, CSV and JSON', 'Test your code and structure a small project'],
    },
    pythonGuide
  ),
  // Industry data skills, built on the Python course (pandas, NumPy, SQLite and Matplotlib run in the browser)
  withGuide(
    {
      ...pandasCourse,
      audience: 'Analysts who work in Excel and want to do the same work faster and repeatably in Python.',
      needs: 'Python modules 1–4 (variables to functions). Excel experience helps.',
      outcomes: ['Load, clean and explore real data files', 'Filter, group, pivot and join tables', 'Build a monthly portfolio report with one function'],
    },
    pandasGuide
  ),
  withGuide(
    {
      ...sqlCourse,
      audience: 'Anyone who needs data from a database, the most-requested skill in analyst roles.',
      needs: 'Python lessons 1–6 help but are not required for the SQL itself.',
      outcomes: ['Write SELECT, GROUP BY and JOIN queries', 'Change data safely with parameters and transactions', 'Use window functions and move results into pandas'],
    },
    sqlGuide
  ),
  withGuide(
    {
      ...vizCourse,
      audience: 'Anyone who presents numbers in reports or slides.',
      needs: 'Python basics; the later lessons use a little pandas.',
      outcomes: ['Draw line, bar, histogram and scatter charts', 'Format axes in ₹ and %', 'Design report charts that make one clear point'],
    },
    vizGuide
  ),
  // Technology and delivery skills
  withGuide(
    {
      ...reactCourse,
      audience: 'Beginners who want to build interactive web pages, and anyone curious how this portfolio works.',
      needs: 'Nothing required. A little HTML helps; JavaScript is explained as you go.',
      outcomes: ['Write components with props and state', 'Build lists, forms and live filters', 'Load data with effects and build a small dashboard'],
    },
    reactGuide
  ),
  withGuide(
    {
      ...jiraCourse,
      audience: 'Anyone joining a team that tracks work in Jira: analysts, testers, developers and managers.',
      needs: 'Nothing. Everything runs on a practice project here, no Jira account needed.',
      outcomes: ['Create and move work items on a board', 'Plan a sprint from velocity', 'Write JQL searches, dashboards and automation rules'],
    },
    jiraGuide
  ),
  withGuide(
    {
      ...k8sCourse,
      audience: 'Beginners who want to know how modern apps are deployed and kept running.',
      needs: 'Nothing. A simulated cluster runs in your browser; the Learn the Code deploy lessons are a helpful warm-up.',
      outcomes: ['Explain containers, pods, nodes and the control plane', 'Write Deployment, Service and ConfigMap YAML', 'Scale, update and roll back an app with kubectl'],
    },
    k8sGuide
  ),
];

// Suggested orders for someone starting from zero.
export const learningPath = [
  { course: 'python', why: 'The foundation: how to write and read Python.' },
  { course: 'pandas', why: 'Turn spreadsheets into repeatable analysis.' },
  { course: 'sql', why: 'Get data out of databases.' },
  { course: 'viz', why: 'Present the results clearly.' },
  { course: 'site', why: 'Anytime: see how a real website and this Lab are built.' },
];

export const techPath = [
  { course: 'react', why: 'Build the interfaces people use.' },
  { course: 'jira', why: 'Plan and track the work as a team.' },
  { course: 'k8s', why: 'Ship it and keep it running.' },
];

export const learningPaths = [
  { id: 'data', title: 'Data track', blurb: 'From your first line of Python to finished reports.', steps: learningPath },
  { id: 'tech', title: 'Technology track', blurb: 'How software is built, planned and shipped.', steps: techPath },
];

export const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));
export const lessonKey = (course, lesson) => `${course.id}/${lesson.id}`;
export const lessonHash = (course, lesson) => `#/c/${course.id}/${lesson.id}`;
