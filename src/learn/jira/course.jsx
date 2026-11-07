import { B, Callout, F, H, P, Term } from '../ui';
import { AutomationBuilder, Board, BoardExercise, Burndown, JqlExercise, JqlSandbox, SprintExercise, SprintPlanner, WorkItemAnatomy } from './widgets';

// "Jira": how teams plan and track work. Jira itself cannot run here, so the lessons use a
// working JQL engine over a sample site, a workflow board, a sprint planner and a rule builder.

const modules = [
  { id: 'jira-basics', title: 'Working in Jira', level: 'Beginner', blurb: 'Projects and work items, boards and workflows, and Scrum sprints.' },
  { id: 'jira-jql', title: 'Finding work with JQL', level: 'Intermediate', blurb: 'Jira Query Language from the first search to functions, dates and sorting.' },
  { id: 'jira-team', title: 'Running a team', level: 'Intermediate', blurb: 'Filters, dashboards, burndowns and automation rules.' },
];

const jql = (expected, solution, hint, extra = {}) => ({ kind: 'jql', component: JqlExercise, expected, solution, hint, ...extra });

const lessons = [
  {
    id: 'j-intro',
    module: 'jira-basics',
    title: 'Projects and work items',
    minutes: 10,
    goals: ['Know what Jira is used for', 'Understand projects, work items and their types', 'Read the key fields of a work item'],
    body: () => (
      <>
        <P>
          <Term id="jira">Jira</Term> (by Atlassian) is the tool most software and many business teams use to plan and track work. Everything lives in{' '}
          <B>projects</B> (like "Collections Revamp", key <F>COLL</F>), and each piece of work is a <Term id="workitem">work item</Term>.
        </P>
        <Callout title="Work items, formerly issues">
          In 2025 Atlassian renamed <B>issues</B> to <B>work items</B> in Jira Cloud. You will still meet "issue" everywhere: older Jira versions, documentation, the API,
          and JQL itself (the field is still <F>issuetype</F>). They mean the same thing.
        </Callout>
        <H>Types and hierarchy</H>
        <ul className="my-4 pl-5 list-disc text-muted space-y-1.5 marker:text-accent">
          <li>
            <B>Epic</B>: a large goal spanning weeks, e.g. "Digital collections journey".
          </li>
          <li>
            <B>Story</B>: something a user needs, small enough for one sprint ("Send a UPI payment link by SMS").
          </li>
          <li>
            <B>Task</B>: work that is not a user feature (load a data snapshot, renew a contract).
          </li>
          <li>
            <B>Bug</B>: something broken.
          </li>
          <li>
            <B>Sub-task</B>: a step of a story or task, so several people can share it.
          </li>
        </ul>
        <WorkItemAnatomy />
      </>
    ),
    quiz: [
      { q: 'In current Jira Cloud, what are "issues" called?', options: ['Tickets', 'Work items', 'Cards', 'Tasks'], answer: 1, why: 'Atlassian renamed issues to work items in 2025; JQL and the API still use "issue".' },
      { q: 'A large goal that takes several sprints is usually a…', options: ['Sub-task', 'Bug', 'Epic', 'Label'], answer: 2, why: 'Epics group the stories, tasks and bugs that deliver a bigger outcome.' },
      { q: 'What does the key COLL-13 tell you?', options: ['It is the 13th bug', 'It is work item number 13 in the COLL project', 'It has 13 story points', 'It is due on the 13th'], answer: 1, why: 'Keys are project key + a running number.' },
    ],
  },
  {
    id: 'j-board',
    module: 'jira-basics',
    title: 'Boards and workflows',
    minutes: 12,
    goals: ['Read a Kanban or Scrum board', 'Understand statuses, transitions and workflows', 'Use WIP limits to keep work flowing'],
    body: () => (
      <>
        <P>
          A <B>board</B> shows work items as cards in columns, one column per <B>status</B>. A <Term id="workflow">workflow</Term> defines the statuses and which moves
          (transitions) are allowed between them: here, work cannot skip review on its way to Done.
        </P>
        <Board />
        <H>WIP limits</H>
        <P>
          A <B>work-in-progress limit</B> caps how many cards a column should hold. When In Progress is full, the team finishes something before starting something new.
          It sounds slower but gets work done sooner, because less is half-finished at once.
        </P>
        <Callout title="Kanban or Scrum?">
          A <B>Kanban</B> board is a continuous flow: pull the next item when you have room. A <B>Scrum</B> board shows one sprint at a time (next lesson). Both use the
          same cards and workflows.
        </Callout>
      </>
    ),
    exercises: [{ id: 'j-finish', kind: 'board', component: BoardExercise, title: 'Finish the sprint', prompt: 'Move every card to Done without breaking the workflow.' }],
    quiz: [
      { q: 'What is a transition?', options: ['A type of work item', 'An allowed move from one status to another', 'A report', 'A sprint'], answer: 1, why: 'Workflows are statuses plus the transitions between them.' },
      { q: 'In Progress is over its WIP limit. Best move?', options: ['Start another item', 'Help finish an in-progress item before starting new work', 'Raise the limit', 'Delete a card'], answer: 1, why: 'WIP limits exist to make the team finish before starting.' },
    ],
  },
  {
    id: 'j-scrum',
    module: 'jira-basics',
    title: 'Scrum: backlog, sprints and estimates',
    minutes: 12,
    goals: ['Know the backlog, sprints and the four Scrum events', 'Estimate with story points', 'Plan a sprint from the team\'s velocity'],
    body: () => (
      <>
        <P>
          In <Term id="scrum">Scrum</Term>, work waits in a prioritised <B>backlog</B>. Every <Term id="sprint">sprint</Term> (usually two weeks) the team picks what it
          can finish, works on it, shows the result and improves how it works.
        </P>
        <ul className="my-4 pl-5 list-disc text-muted space-y-1.5 marker:text-accent">
          <li>
            <B>Sprint planning</B>: choose the sprint goal and the items.
          </li>
          <li>
            <B>Daily stand-up</B>: 15 minutes to sync and spot blockers.
          </li>
          <li>
            <B>Sprint review</B>: show what was done to stakeholders.
          </li>
          <li>
            <B>Retrospective</B>: agree how to work better next time.
          </li>
        </ul>
        <H>Story points and velocity</H>
        <P>
          <Term id="storypoints">Story points</Term> size work relative to other work, not in hours. <Term id="velocity">Velocity</Term> is how many points the team
          actually finished per sprint. Plan the next sprint close to the recent average, not to a wish.
        </P>
        <SprintPlanner />
      </>
    ),
    exercises: [
      {
        id: 'j-plan',
        kind: 'sprint',
        component: SprintExercise,
        title: 'Plan Sprint 16',
        prompt: 'Fill Sprint 16 close to the team\'s capacity (within 4 points below it, never above), include the Highest-priority item, and leave out anything not yet estimated.',
      },
    ],
    quiz: [
      { q: 'What is velocity?', options: ['Hours worked per day', 'Points the team finished per sprint, on average', 'The number of bugs', 'Sprint length'], answer: 1, why: 'It is measured from finished work, so it is a realistic guide for planning.' },
      { q: 'Why not plan a sprint above the team\'s velocity?', options: ['Jira forbids it', 'The team will very likely not finish it, and the sprint goal slips', 'Points expire', 'It is fine to'], answer: 1, why: 'Over-committing makes sprints unpredictable.' },
    ],
  },
  {
    id: 'j-jql',
    module: 'jira-jql',
    title: 'Searching with JQL',
    minutes: 14,
    goals: ['Write field operator value queries', 'Combine conditions with AND, OR and brackets', 'Use IN, != and quotes correctly'],
    body: () => (
      <>
        <P>
          <Term id="jql">JQL</Term>, Jira Query Language, finds exactly the work you want. Every condition has three parts: a <B>field</B>, an <B>operator</B> and a{' '}
          <B>value</B>, like <F>status = "In Progress"</F>. Conditions combine with <F>AND</F> and <F>OR</F>. It works like SQL's WHERE clause.
        </P>
        <JqlSandbox
          examples={[
            'project = COLL AND status = "In Progress"',
            'type = Bug AND priority = Highest',
            'assignee = Kiran',
            'status IN ("To Do", "In Review")',
            'project = COLL AND assignee != Shivam',
            '(type = Bug OR type = Task) AND status != Done',
          ]}
        />
        <Callout tone="warn" title="Quotes and brackets">
          Values with spaces need quotes: <F>status = "In Progress"</F>. When mixing AND and OR, add brackets: AND is evaluated first, so{' '}
          <F>type = Bug OR type = Task AND status = Done</F> is not what most people mean.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'jql-bugs',
        title: 'Open bugs in COLL',
        prompt: 'Find every Bug in the COLL project that is not Done.',
        ...jql('project = COLL AND type = Bug AND status != Done', 'project = COLL AND type = Bug AND status != Done', 'Three conditions joined with AND: project = COLL, type = Bug, status != Done.'),
      },
      {
        id: 'jql-review',
        title: 'Waiting on someone',
        prompt: 'Find work items in COLL whose status is To Do or In Review, using IN.',
        ...jql('project = COLL AND status IN ("To Do", "In Review")', 'project = COLL AND status IN ("To Do", "In Review")', 'status IN ("To Do", "In Review") is shorter than two ORs.', {
          mustUse: [['\\bIN\\b\\s*\\(', 'Uses IN ( … )']],
        }),
      },
    ],
    quiz: [
      { q: 'Which is valid JQL?', options: ['status == Done', 'status = In Progress', 'status = "In Progress"', 'status: Done'], answer: 2, why: 'One =, and quotes around values with spaces.' },
      { q: 'What does assignee != Shivam leave out besides Shivam\'s work?', options: ['Nothing', 'Unassigned work items', 'Done items', 'Epics'], answer: 1, why: 'Like Jira, != never matches empty fields. Add OR assignee IS EMPTY to include them.' },
    ],
  },
  {
    id: 'j-jql-pro',
    module: 'jira-jql',
    title: 'Functions, dates and sorting',
    minutes: 14,
    goals: ['Use functions like currentUser() and openSprints()', 'Search by dates, including relative dates', 'Find empty fields, search text and sort results'],
    body: () => (
      <>
        <P>
          Real saved searches rarely hard-code names or dates. <B>Functions</B> fill them in for whoever runs the search, whenever they run it, so one filter works for the
          whole team for months.
        </P>
        <JqlSandbox
          initial="assignee = currentUser() AND status != Done ORDER BY priority DESC"
          examples={[
            'assignee = currentUser() AND status != Done ORDER BY priority DESC',
            'sprint IN openSprints() AND status != Done',
            'created >= -7d ORDER BY created DESC',
            'assignee IS EMPTY AND project = COLL',
            'summary ~ "sms"',
            'due <= "2026-11-21" AND status != Done ORDER BY due',
            '"story points" >= 8 ORDER BY "story points" DESC',
          ]}
        />
        <ul className="my-4 pl-5 list-disc text-muted space-y-1.5 marker:text-accent">
          <li>
            <F>currentUser()</F> is you; <F>openSprints()</F> is the active sprint; <F>startOfWeek()</F> and <F>now()</F> are dates.
          </li>
          <li>
            Relative dates: <F>created &gt;= -7d</F> means in the last 7 days; <F>-2w</F> is two weeks.
          </li>
          <li>
            <F>IS EMPTY</F> / <F>IS NOT EMPTY</F> find missing values, like unassigned work.
          </li>
          <li>
            <F>~</F> means "contains the words": <F>summary ~ "sms"</F>.
          </li>
          <li>
            <F>ORDER BY priority DESC, created</F> sorts the results.
          </li>
        </ul>
      </>
    ),
    exercises: [
      {
        id: 'jql-mine',
        title: 'My open work, most urgent first',
        prompt: 'Find everything assigned to you that is not Done, using currentUser(), sorted by priority from highest to lowest.',
        ...jql('assignee = currentUser() AND status != Done ORDER BY priority DESC, key ASC', 'assignee = currentUser() AND status != Done ORDER BY priority DESC', 'assignee = currentUser() AND status != Done ORDER BY priority DESC', {
          mustUse: [['currentUser\\s*\\(\\s*\\)', 'Uses currentUser()'], ['ORDER\\s+BY\\s+priority\\s+DESC', 'Sorts by priority, highest first']],
        }),
      },
      {
        id: 'jql-triage',
        title: 'Triage the unassigned backlog',
        prompt: 'Find COLL work items that have no assignee and are not in any sprint.',
        ...jql('project = COLL AND assignee IS EMPTY AND sprint IS EMPTY', 'project = COLL AND assignee IS EMPTY AND sprint IS EMPTY', 'Use IS EMPTY twice: assignee IS EMPTY AND sprint IS EMPTY.', {
          mustUse: [['IS\\s+EMPTY', 'Uses IS EMPTY']],
        }),
      },
      {
        id: 'jql-recent',
        title: 'New this week',
        prompt: 'Find work items created in the last 7 days, newest first (relative date, not a fixed one).',
        ...jql('created >= -7d ORDER BY created DESC, key ASC', 'created >= -7d ORDER BY created DESC', 'created >= -7d ORDER BY created DESC', {
          mustUse: [['-\\s*7\\s*d', 'Uses the relative date -7d'], ['ORDER\\s+BY\\s+created\\s+DESC', 'Newest first']],
        }),
      },
    ],
    quiz: [
      { q: 'Why use currentUser() instead of your name in a shared filter?', options: ['It is faster', 'Each person who runs it sees their own work', 'Names are not allowed', 'It sorts the results'], answer: 1, why: 'Functions make one filter useful for everyone.' },
      { q: 'created >= -7d finds…', options: ['Items created 7 days ago exactly', 'Items created in the last 7 days', 'Items due in 7 days', 'Nothing'], answer: 1, why: 'Relative dates count back from now.' },
    ],
  },
  {
    id: 'j-reports',
    module: 'jira-team',
    title: 'Filters, dashboards and automation',
    minutes: 12,
    goals: ['Save searches as filters and share them', 'Read a burndown and build a dashboard', 'Automate routine updates with rules'],
    body: () => (
      <>
        <P>
          Save a JQL search as a <B>filter</B> and it becomes reusable: share it with the team, subscribe to it by email, or show it on a <B>dashboard</B> as gadgets
          (lists, pie charts, burndowns). Boards themselves are built on filters.
        </P>
        <Burndown />
        <H>Automation</H>
        <P>
          <Term id="automation">Automation rules</Term> remove repetitive clicks: label urgent bugs, assign new work by type, close a parent when all its children are
          done, or post to Slack. Every rule is <B>when</B> (trigger), <B>if</B> (conditions), <B>then</B> (actions).
        </P>
        <AutomationBuilder />
        <Callout title="Start small">
          Automate one annoying, frequent step at a time, and check the rule's audit log after it runs. A bad rule can update hundreds of work items in seconds.
        </Callout>
      </>
    ),
    quiz: [
      { q: 'What is a Jira filter?', options: ['A colour setting', 'A saved JQL search that can be shared and reused', 'A board column', 'A sprint'], answer: 1, why: 'Filters power dashboards, boards and subscriptions.' },
      { q: 'The actual burndown line is above the ideal line. That means…', options: ['The team is ahead', 'More work is left than planned at this point: the team is behind', 'The sprint is over', 'Nothing'], answer: 1, why: 'Above the line = more remaining than expected.' },
      { q: 'An automation rule has which three parts?', options: ['Who, what, where', 'Trigger, condition, action', 'Epic, story, task', 'Board, filter, gadget'], answer: 1, why: 'When something happens, if conditions hold, then act.' },
    ],
  },
];

export const jiraCourse = {
  id: 'jira',
  title: 'Jira',
  tagline: 'Plan, track and report on work like a real delivery team',
  blurb:
    'Work items, boards and workflows, Scrum sprints and velocity, JQL from the first search to functions and dates, then dashboards and automation. Practise on a working JQL engine and a sample project.',
  levels: 'Beginner → Intermediate',
  icon: 'jira',
  modules,
  lessons,
};
