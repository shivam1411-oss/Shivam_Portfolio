import { advancedLessons, advancedModules } from './lessons-advanced';
import { beginnerLessons, beginnerModules } from './lessons-beginner';

export const pythonCourse = {
  id: 'python',
  title: 'Python',
  tagline: 'From your first print() to decorators and a real project',
  blurb:
    'Learn Python by writing it. Every lesson has examples you can edit and run in the browser, exercises that are checked by tests, and a quiz. Examples use collections and finance data, so the skills transfer straight to work.',
  levels: 'Beginner → Advanced',
  icon: 'python',
  usesPython: true,
  modules: [...beginnerModules, ...advancedModules],
  lessons: [...beginnerLessons, ...advancedLessons],
};
