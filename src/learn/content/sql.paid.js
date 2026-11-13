// sql: the paid lessons (kept off the public site when the paywall is on). The full course is content/sql.js (used by build scripts and tests).
import { sqlCourse } from '../data/sql.jsx?part=paid';
import { sqlGuide } from '../guides/data';
import { withGuide } from './util';

export default withGuide({ lessons: sqlCourse.lessons }, sqlGuide).lessons;
