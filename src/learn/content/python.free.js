// python: the free first module. The full course is content/python.js (used by build scripts and tests).
import { beginnerLessons } from '../python/lessons-beginner.jsx?part=free';
import { pythonGuide } from '../guides/python';
import { pythonSteps } from '../guides/python-steps.js?part=free';
import { withGuide } from './util';

export default withGuide({ lessons: beginnerLessons }, pythonGuide, pythonSteps).lessons;
