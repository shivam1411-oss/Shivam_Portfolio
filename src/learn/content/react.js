import { reactCourse } from '../react/course';
import { reactGuide } from '../guides/tech';
import { withGuide } from './util';

export default withGuide(
  {
    ...reactCourse,
    audience: 'Beginners who want to build interactive web pages, and anyone curious how this portfolio works.',
    needs: 'Nothing required. A little HTML helps; JavaScript is explained as you go.',
    outcomes: ['Write components with props and state', 'Build lists, forms and live filters', 'Load data with effects and build a small dashboard'],
  },
  reactGuide
);
