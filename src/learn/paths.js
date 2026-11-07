// Suggested orders for someone starting from zero.
export const learningPath = [
  { course: 'python', why: 'The foundation: how to write and read Python.' },
  { course: 'pandas', why: 'Turn spreadsheets into repeatable analysis.' },
  { course: 'sql', why: 'Get data out of databases.' },
  { course: 'viz', why: 'Present the results clearly.' },
  { course: 'site', why: 'Anytime: see how a real website and this Lab are built.' },
];
export const techPath = [
  { course: 'react', why: 'Build the interfaces people use.' },
  { course: 'jira', why: 'Plan and track the work as a team.' },
  { course: 'k8s', why: 'Ship it and keep it running.' },
];
export const learningPaths = [
  { id: 'data', title: 'Data track', blurb: 'From your first line of Python to finished reports.', steps: learningPath },
  { id: 'tech', title: 'Technology track', blurb: 'How software is built, planned and shipped.', steps: techPath },
];
