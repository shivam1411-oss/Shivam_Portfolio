// pandas: the free first module. The full course is content/pandas.js (used by build scripts and tests).
import { pandasCourse } from '../data/pandas.jsx?part=free';
import { pandasGuide } from '../guides/data';
import { pandasSteps } from '../guides/pandas-steps.js?part=free';
import { withGuide } from './util';

export default withGuide({ lessons: pandasCourse.lessons }, pandasGuide, pandasSteps).lessons;
