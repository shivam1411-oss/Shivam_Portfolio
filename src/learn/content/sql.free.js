// sql: the free first module. The full course is content/sql.js (used by build scripts and tests).
import { sqlCourse } from '../data/sql.jsx?part=free';
import { sqlGuide } from '../guides/data';
import { withGuide } from './util';

export default withGuide({ lessons: sqlCourse.lessons }, sqlGuide).lessons;
