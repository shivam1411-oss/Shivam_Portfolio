import { pythonCourse } from '../python/course';
import { pythonGuide } from '../guides/python';
import { withGuide } from './util';

export default withGuide(
  {
    ...pythonCourse,
    audience: 'Complete beginners, and Excel users who want to automate their work.',
    needs: 'Nothing. Start at lesson 1 and run every example.',
    outcomes: ['Write Python programs with variables, loops, functions and classes', 'Read and write files, CSV and JSON', 'Test your code and structure a small project'],
  },
  pythonGuide
);
