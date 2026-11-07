import { pandasCourse } from '../data/pandas';
import { pandasGuide } from '../guides/data';
import { withGuide } from './util';

export default withGuide(
  {
    ...pandasCourse,
    audience: 'Analysts who work in Excel and want to do the same work faster and repeatably in Python.',
    needs: 'Python modules 1–4 (variables to functions). Excel experience helps.',
    outcomes: ['Load, clean and explore real data files', 'Filter, group, pivot and join tables', 'Build a monthly portfolio report with one function'],
  },
  pandasGuide
);
