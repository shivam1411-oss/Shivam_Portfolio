import { sqlCourse } from '../data/sql';
import { sqlGuide } from '../guides/data';
import { withGuide } from './util';

export default withGuide(
  {
    ...sqlCourse,
    audience: 'Anyone who needs data from a database, the most-requested skill in analyst roles.',
    needs: 'Python lessons 1–6 help but are not required for the SQL itself.',
    outcomes: ['Write SELECT, GROUP BY and JOIN queries', 'Change data safely with parameters and transactions', 'Use window functions and move results into pandas'],
  },
  sqlGuide
);
