import { jiraCourse } from '../jira/course';
import { jiraGuide } from '../guides/tech';
import { jiraSteps } from '../guides/jira-steps';
import { startGuide, withGuide } from './util';

export default withGuide(
  {
    ...jiraCourse,
    audience: 'Anyone joining a team that tracks work in Jira: analysts, testers, developers and managers.',
    needs: 'Nothing. Everything runs on a practice project here, no Jira account needed.',
    outcomes: ['Create and move work items on a board', 'Plan a sprint from velocity', 'Write JQL searches, dashboards and automation rules'],
    start: startGuide({
      intro:
        'Jira is where most teams plan and track their work. This course uses a made-up Jira site with two projects and 23 work items, so you can click, drag and search without touching a real one. Nothing here needs a Jira account.',
      need: [
        'No account, no install and no coding experience.',
        'About 20 minutes for each lesson.',
        'In this sample site you are a user called Shivam, and today is always 7 November 2026, so searches by date give the same answers every time.',
      ],
      order: [
        'Start with "Projects and work items" to learn the parts of one piece of work.',
        'Then boards and workflows, then Scrum and sprint planning.',
        'Then the two JQL lessons: searching is the skill you will use every day.',
        'Finish with filters, dashboards and automation.',
      ],
      doing: 'A numbered walkthrough on a practice board, sprint planner or search box: one small action per step, and what you should see. Tick each step as you go.',
    }),
  },
  jiraGuide,
  jiraSteps
);
