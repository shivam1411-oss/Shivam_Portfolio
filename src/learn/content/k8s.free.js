// k8s: the free first module. The full course is content/k8s.js (used by build scripts and tests).
import { k8sCourse } from '../k8s/course.jsx?part=free';
import { k8sGuide } from '../guides/tech';
import { withGuide } from './util';

export default withGuide({ lessons: k8sCourse.lessons }, k8sGuide).lessons;
