import { lessons as siteLessons, modules as siteModules } from './lessons';
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
      'React, Tailwind, animations, canvas effects, performance, the AI chat, deploying and the Android app, explained from zero with the real code and playgrounds.',
    levels: 'Beginner',
    icon: 'site',
    modules: siteModules,
    lessons: siteLessons,
    extras: [{ hash: '#/timeline', label: 'What changed, in order' }],
  },
  pythonCourse,
];

export const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));
export const lessonKey = (course, lesson) => `${course.id}/${lesson.id}`;
export const lessonHash = (course, lesson) => `#/c/${course.id}/${lesson.id}`;
