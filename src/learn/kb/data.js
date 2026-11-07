// Knowledge-base topics are loaded one course at a time.
export const kbLoaders = {
  site: () => import('./site').then((m) => m.siteKb),
  python: () => import('./python').then((m) => m.pythonKb),
  pandas: () => import('./pandas').then((m) => m.pandasKb),
  sql: () => import('./sql').then((m) => m.sqlKb),
  viz: () => import('./viz').then((m) => m.vizKb),
  react: () => import('./react').then((m) => m.reactKb),
  jira: () => import('./jira').then((m) => m.jiraKb),
  k8s: () => import('./k8s').then((m) => m.k8sKb),
};
