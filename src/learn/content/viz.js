import { vizCourse } from '../data/viz';
import { vizGuide } from '../guides/data';
import { withGuide } from './util';

export default withGuide(
  {
    ...vizCourse,
    audience: 'Anyone who presents numbers in reports or slides.',
    needs: 'Python basics; the later lessons use a little pandas.',
    outcomes: ['Draw line, bar, histogram and scatter charts', 'Format axes in ₹ and %', 'Design report charts that make one clear point'],
  },
  vizGuide
);
