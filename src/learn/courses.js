import { lessons as siteLessons, modules as siteModules } from './lessons';
import { pandasCourse } from './data/pandas';
import { sqlCourse } from './data/sql';
import { vizCourse } from './data/viz';
import { pythonCourse } from './python/course';

// Every course in the Learning Lab. To add one, create its modules and lessons (see python/ for an
// example with runnable code) and add an entry here; the hub, navigation and progress pick it up.
// A lesson has: id, module, title, minutes, goals, body (component), optional exercises and quiz.
export const courses = [
  {
    id: 'site',
    title: 'Learn the Code',
    tagline: 'How this portfolio was built, change by change',
    blurb:
      'React, Tailwind, animations, canvas effects, performance, the AI chat, deploying, the Android app, and how Python was made to run in this Learning Lab, explained from zero with the real code and playgrounds.',
    levels: 'Beginner',
    icon: 'site',
    modules: siteModules,
    lessons: siteLessons,
    extras: [{ hash: '#/timeline', label: 'What changed, in order' }],
  },
  pythonCourse,
  // Industry data skills, built on the Python course (pandas, NumPy, SQLite and Matplotlib run in the browser)
  pandasCourse,
  sqlCourse,
  vizCourse,
];

export const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));
export const lessonKey = (course, lesson) => `${course.id}/${lesson.id}`;
export const lessonHash = (course, lesson) => `#/c/${course.id}/${lesson.id}`;
