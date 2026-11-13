// viz: the free first module. The full course is content/viz.js (used by build scripts and tests).
import { vizCourse } from '../data/viz.jsx?part=free';
import { vizGuide } from '../guides/data';
import { withGuide } from './util';

export default withGuide({ lessons: vizCourse.lessons }, vizGuide).lessons;
