// python: the paid lessons (kept off the public site when the paywall is on). The full course is content/python.js (used by build scripts and tests).
import { beginnerLessons } from '../python/lessons-beginner.jsx?part=paid';
import { advancedLessons } from '../python/lessons-advanced.jsx?part=paid';
import { pythonGuide } from '../guides/python';
import { withGuide } from './util';

export default withGuide({ lessons: [...beginnerLessons, ...advancedLessons] }, pythonGuide).lessons;
