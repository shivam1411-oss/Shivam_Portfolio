// A made-up Jira site for the course: two projects of work items (Jira's newer name for issues).
// "Today" is fixed so relative dates in exercises always give the same answers.

export const TODAY = '2026-11-07';
export const CURRENT_USER = 'Shivam';
export const SPRINTS = { open: ['Sprint 15'], closed: ['Sprint 13', 'Sprint 14'], future: ['Sprint 16'] };

const w = (key, type, summary, status, priority, assignee, sprint, points, created, updated, labels = [], extra = {}) => ({
  key,
  project: key.split('-')[0],
  type,
  summary,
  status,
  priority,
  assignee,
  reporter: extra.reporter || 'Shivam',
  sprint,
  points,
  created,
  updated,
  due: extra.due || null,
  labels,
  parent: extra.parent || null,
  description: extra.description || '',
  resolution: status === 'Done' ? 'Done' : null,
});

export const workItems = [
  w('COLL-1', 'Epic', 'Digital collections journey', 'In Progress', 'High', 'Shivam', null, null, '2026-08-04', '2026-11-02', ['digital']),
  w('COLL-2', 'Epic', 'Agency performance reporting', 'To Do', 'Medium', 'Neha', null, null, '2026-08-11', '2026-10-20', ['reporting']),
  w('COLL-3', 'Story', 'Send UPI payment link by SMS on day 3 past due', 'Done', 'High', 'Kiran', 'Sprint 13', 5, '2026-09-01', '2026-09-26', ['digital', 'sms'], { parent: 'COLL-1' }),
  w('COLL-4', 'Story', 'WhatsApp reminder template for 1-30 bucket', 'Done', 'Medium', 'Kiran', 'Sprint 14', 3, '2026-09-08', '2026-10-09', ['digital', 'whatsapp'], { parent: 'COLL-1' }),
  w('COLL-5', 'Bug', 'Payment link expires before customer opens it', 'Done', 'Highest', 'Amit', 'Sprint 14', 2, '2026-10-01', '2026-10-08', ['digital', 'payments'], { parent: 'COLL-1', description: 'Links expire after 1 hour; customers often open them the next day.' }),
  w('COLL-6', 'Story', 'Promise-to-pay capture screen for tele-callers', 'In Progress', 'High', 'Shivam', 'Sprint 15', 8, '2026-10-06', '2026-11-05', ['ptp'], { parent: 'COLL-1', due: '2026-11-14' }),
  w('COLL-7', 'Task', 'Load October DPD snapshot into the warehouse', 'Done', 'Medium', 'Neha', 'Sprint 15', 2, '2026-10-27', '2026-11-03', ['data']),
  w('COLL-8', 'Bug', 'Dashboard shows wrong CEI for September', 'In Review', 'Highest', 'Neha', 'Sprint 15', 3, '2026-11-02', '2026-11-06', ['reporting', 'cei'], { parent: 'COLL-2', description: 'Closing current AR was taken from the wrong date.' }),
  w('COLL-9', 'Story', 'Agency scorecard: collections vs target by month', 'To Do', 'High', 'Neha', 'Sprint 15', 5, '2026-10-20', '2026-10-30', ['reporting'], { parent: 'COLL-2', due: '2026-11-21' }),
  w('COLL-10', 'Sub-task', 'Design scorecard layout', 'In Progress', 'Medium', 'Amit', 'Sprint 15', 1, '2026-10-30', '2026-11-04', ['reporting'], { parent: 'COLL-9' }),
  w('COLL-11', 'Sub-task', 'Write SQL for monthly collections by agency', 'To Do', 'Medium', 'Shivam', 'Sprint 15', 2, '2026-10-30', '2026-10-30', ['reporting', 'sql'], { parent: 'COLL-9' }),
  w('COLL-12', 'Story', 'Champion-challenger split for SMS timing', 'To Do', 'Medium', null, 'Sprint 16', 5, '2026-11-01', '2026-11-01', ['digital', 'experiment'], { parent: 'COLL-1' }),
  w('COLL-13', 'Bug', 'Duplicate SMS sent to customers who already paid', 'In Progress', 'Highest', 'Kiran', 'Sprint 15', 3, '2026-11-04', '2026-11-06', ['digital', 'sms'], { parent: 'COLL-1', reporter: 'Neha' }),
  w('COLL-14', 'Task', 'Renew SMS gateway contract', 'To Do', 'Low', 'Amit', null, null, '2026-09-15', '2026-09-15', ['vendor'], { due: '2026-11-30' }),
  w('COLL-15', 'Story', 'Roll-rate alert when 31-60 rolls above 25%', 'To Do', 'High', null, null, 5, '2026-10-12', '2026-10-12', ['reporting', 'alerts'], { parent: 'COLL-2' }),
  w('COLL-16', 'Bug', 'Export to Excel drops the last row', 'To Do', 'Low', null, null, 1, '2026-10-29', '2026-10-29', ['reporting']),
  w('COLL-17', 'Task', 'Archive closed 2024 accounts', 'To Do', 'Lowest', null, null, 2, '2026-07-20', '2026-07-20', ['data']),
  w('COLL-18', 'Story', 'Field visit route planner for 90+ accounts', 'To Do', 'Medium', null, null, 8, '2026-10-05', '2026-10-05', ['field']),
  w('PORT-1', 'Epic', 'Learning Lab', 'In Progress', 'High', 'Shivam', null, null, '2026-10-25', '2026-11-07', ['learning']),
  w('PORT-2', 'Story', 'Python course with runnable exercises', 'Done', 'High', 'Shivam', 'Sprint 14', 8, '2026-10-26', '2026-11-06', ['learning', 'python'], { parent: 'PORT-1' }),
  w('PORT-3', 'Story', 'Data courses: pandas, SQL and charts', 'Done', 'High', 'Shivam', 'Sprint 15', 8, '2026-11-01', '2026-11-06', ['learning', 'python'], { parent: 'PORT-1' }),
  w('PORT-4', 'Story', 'Jira, React and Kubernetes courses', 'In Progress', 'Medium', 'Shivam', 'Sprint 15', 13, '2026-11-07', '2026-11-07', ['learning'], { parent: 'PORT-1' }),
  w('PORT-5', 'Bug', 'Deploy step times out on slow days', 'Done', 'Medium', 'Shivam', 'Sprint 15', 1, '2026-11-06', '2026-11-07', ['devops'], { parent: 'PORT-1' }),
];

export const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done'];
export const TYPES = ['Epic', 'Story', 'Task', 'Bug', 'Sub-task'];
export const PRIORITIES = ['Lowest', 'Low', 'Medium', 'High', 'Highest'];
export const PEOPLE = ['Shivam', 'Neha', 'Kiran', 'Amit'];
