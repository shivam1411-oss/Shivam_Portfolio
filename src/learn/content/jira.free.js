// jira: the free first module. The full course is content/jira.js (used by build scripts and tests).
import { jiraCourse } from '../jira/course.jsx?part=free';
import { jiraGuide } from '../guides/tech';
import { withGuide } from './util';

export default withGuide({ lessons: jiraCourse.lessons }, jiraGuide).lessons;
