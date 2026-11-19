// security: the free first module. The full course is content/security.js (used by build scripts and tests).
import { securityCourse } from '../security/course.jsx?part=free';
import { securityGuide } from '../guides/security';
import { securitySteps } from '../guides/security-steps.jsx?part=free';
import { withGuide } from './util';

export default withGuide({ lessons: securityCourse.lessons }, securityGuide, securitySteps).lessons;
