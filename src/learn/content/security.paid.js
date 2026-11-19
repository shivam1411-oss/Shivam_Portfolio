// security: the paid lessons (kept off the public site when the paywall is on). The full course is content/security.js (used by build scripts and tests).
import { securityCourse } from '../security/course.jsx?part=paid';
import { securityGuide } from '../guides/security';
import { securitySteps } from '../guides/security-steps.jsx?part=paid';
import { withGuide } from './util';

export default withGuide({ lessons: securityCourse.lessons }, securityGuide, securitySteps).lessons;
