// react: the free first module. The full course is content/react.js (used by build scripts and tests).
import { reactCourse } from '../react/course.jsx?part=free';
import { reactGuide } from '../guides/tech';
import { reactSteps } from '../guides/react-steps.jsx?part=free';
import { withGuide } from './util';

export default withGuide({ lessons: reactCourse.lessons }, reactGuide, reactSteps).lessons;
