// jira: the paid lessons (kept off the public site when the paywall is on). The full course is content/jira.js (used by build scripts and tests).
import { jiraCourse } from '../jira/course.jsx?part=paid';
import { jiraGuide } from '../guides/tech';
import { withGuide } from './util';

export default withGuide({ lessons: jiraCourse.lessons }, jiraGuide).lessons;
