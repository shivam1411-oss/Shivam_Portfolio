// pandas: the paid lessons (kept off the public site when the paywall is on). The full course is content/pandas.js (used by build scripts and tests).
import { pandasCourse } from '../data/pandas.jsx?part=paid';
import { pandasGuide } from '../guides/data';
import { withGuide } from './util';

export default withGuide({ lessons: pandasCourse.lessons }, pandasGuide).lessons;
