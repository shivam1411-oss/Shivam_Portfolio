// Every knowledge base in one object, for build scripts and tests (the app loads them via kb/data.js).
import { siteKb } from './site';
import { pythonKb } from './python';
import { pandasKb } from './pandas';
import { sqlKb } from './sql';
import { vizKb } from './viz';
import { reactKb } from './react';
import { jiraKb } from './jira';
import { k8sKb } from './k8s';

export const knowledgeBases = { site: siteKb, python: pythonKb, pandas: pandasKb, sql: sqlKb, viz: vizKb, react: reactKb, jira: jiraKb, k8s: k8sKb };
