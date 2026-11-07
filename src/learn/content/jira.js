import { jiraCourse } from '../jira/course';
import { jiraGuide } from '../guides/tech';
import { withGuide } from './util';

export default withGuide(
  {
    ...jiraCourse,
    audience: 'Anyone joining a team that tracks work in Jira: analysts, testers, developers and managers.',
    needs: 'Nothing. Everything runs on a practice project here, no Jira account needed.',
    outcomes: ['Create and move work items on a board', 'Plan a sprint from velocity', 'Write JQL searches, dashboards and automation rules'],
  },
  jiraGuide
);
