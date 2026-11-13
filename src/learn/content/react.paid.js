// react: the paid lessons (kept off the public site when the paywall is on). The full course is content/react.js (used by build scripts and tests).
import { reactCourse } from '../react/course.jsx?part=paid';
import { reactGuide } from '../guides/tech';
import { withGuide } from './util';

export default withGuide({ lessons: reactCourse.lessons }, reactGuide).lessons;
