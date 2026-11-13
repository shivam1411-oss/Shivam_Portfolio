// viz: the paid lessons (kept off the public site when the paywall is on). The full course is content/viz.js (used by build scripts and tests).
import { vizCourse } from '../data/viz.jsx?part=paid';
import { vizGuide } from '../guides/data';
import { withGuide } from './util';

export default withGuide({ lessons: vizCourse.lessons }, vizGuide).lessons;
