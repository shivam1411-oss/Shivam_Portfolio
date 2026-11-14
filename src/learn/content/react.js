import { reactCourse } from '../react/course';
import { reactGuide } from '../guides/tech';
import { reactSteps } from '../guides/react-steps';
import { startGuide, withGuide } from './util';

export default withGuide(
  {
    ...reactCourse,
    audience: 'Beginners who want to build interactive web pages, and anyone curious how this portfolio works.',
    needs: 'Nothing required. A little HTML helps; JavaScript is explained as you go.',
    outcomes: ['Write components with props and state', 'Build lists, forms and live filters', 'Load data with effects and build a small dashboard'],
    start: startGuide({
      intro:
        'React is how modern websites, including this portfolio, are built from small reusable pieces. In this course you write real React in a live editor: the result appears next to your code a moment after you stop typing. Make small changes, watch what happens, and read every error: it tells you which line to look at.',
      need: [
        'Nothing to install: the editor and preview run inside this page.',
        'A little JavaScript helps (variables, functions, arrays). If you have done the Python course, the ideas are the same and the lessons explain the differences.',
        'About 30 minutes for each lesson.',
      ],
      order: [
        'Start with "Your first component". Every later lesson builds on it.',
        'Then props, then state: these two ideas are most of React.',
        'Then lists, forms and effects.',
        'Finish with the project, a small collections dashboard.',
      ],
      doing: 'A numbered walkthrough in a live practice editor: one small change per step, the code you should end up with, and what the preview should show. Tick each step as you go.',
    }),
  },
  reactGuide,
  reactSteps
);
