// Knowledge-base topics are loaded one course at a time. Paid courses' knowledge bases go through the
// access layer: with the paywall on they download only for learners who own the course.
import { loadPaidKb } from '../access';

const direct = {
  python: () => import('./python').then((m) => m.pythonKb),
  pandas: () => import('./pandas').then((m) => m.pandasKb),
  sql: () => import('./sql').then((m) => m.sqlKb),
  viz: () => import('./viz').then((m) => m.vizKb),
  react: () => import('./react').then((m) => m.reactKb),
  jira: () => import('./jira').then((m) => m.jiraKb),
  k8s: () => import('./k8s').then((m) => m.k8sKb),
};

export const kbLoaders = {
  site: () => import('./site').then((m) => m.siteKb),
  ...Object.fromEntries(Object.entries(direct).map(([id, load]) => [id, () => loadPaidKb(id, load)])),
};
