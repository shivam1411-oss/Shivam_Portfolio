// Step-by-step material for the Jira lessons: same shape as python-steps.js (terms, process, steps), plus
// `practice(key)`, the search box, board or planner the steps are done in.
// It is attached to the lessons in content/ (see withGuide), so each course loads only its own practice tool.
// scripts/check-steps.mjs replays the steps: JQL steps are searched (`count` results) and sprint steps are added up (`total` points).
import { AutomationBuilder, Board, JqlSandbox, SprintPlanner, WorkItemAnatomy } from '../jira/widgets';

const jqlBox = (initial) => (key) => <JqlSandbox key={key} initial={initial} />;
const JQL = 'Delete what is in the search box above these steps, type this, and press Enter.';

export const jiraSteps = {
  'j-intro': {
    terms: ['jira', 'project', 'workitem', 'epic', 'status', 'assignee'],
    process: {
      title: 'The life of a piece of work in Jira',
      stages: [
        ['Someone raises it', 'A work item is created in a project and gets a key, such as COLL-13.'],
        ['It is described', 'A type (Story, Bug, Task), a one-line summary and a priority say what it is and how urgent.'],
        ['It is given to one person', 'The assignee is responsible for moving it forward.'],
        ['It moves through statuses', 'To Do, In Progress, In Review, Done: the workflow.'],
        ['It is linked to bigger work', 'Stories belong to an epic; sub-tasks belong to a story.'],
        ['It is finished', 'In Done, it stays searchable as a record of what was done and when.'],
      ],
    },
    practice: (key) => <WorkItemAnatomy key={key} />,
    steps: [
      { do: 'In the work item shown above these steps, click the row labelled Key.', see: 'An explanation on the right: the key is the project key (COLL) plus a number, and is how people refer to the work.' },
      { do: 'Click Type.', see: 'This one is a Bug. The explanation lists the five types: Epic, Story, Task, Bug and Sub-task.' },
      { do: 'Click Status.', see: 'In Progress, and the path every item follows: To Do → In Progress → In Review → Done.' },
      { do: 'Click Assignee, then Reporter.', see: 'Kiran is responsible for the work now; Neha raised it and is the person to ask for detail.' },
      { do: 'Click Story points.', see: 'A 3: a relative size, not hours.' },
      { do: 'Click Parent.', see: 'COLL-1, the epic this bug belongs to.' },
    ],
  },
  'j-board': {
    terms: ['board', 'status', 'workflow', 'transition', 'wip'],
    process: {
      title: 'What happens when you move a card',
      stages: [
        ['Each column is a status', 'A card sits in the column of its current status.'],
        ['Dragging asks for a transition', 'Moving a card to another column asks Jira to change its status.'],
        ['The workflow decides', 'Only transitions the workflow allows will work. To Do can go to In Progress, but not straight to Done.'],
        ['The card moves, or is refused', 'A refused move leaves the card where it was and says which moves are allowed.'],
        ['WIP limits warn you', 'A column over its limit turns amber: finish something before starting more.'],
      ],
    },
    practice: (key) => <Board key={key} />,
    steps: [
      { do: 'On the board above these steps, find the card COLL-8 in the In Review column. Drag it to Done (or open its → menu and choose Done).', see: 'A green tick: COLL-8 moved to Done. In Review is now empty.' },
      { do: 'Try to skip the workflow: drag COLL-9 from To Do straight to Done.', see: 'A message starting with ✗: there is no transition from "To Do" to "Done". The card stays where it was.' },
      { do: 'Move COLL-9 the allowed way: drag it to In Progress.', see: 'It moves, and the In Progress column turns amber showing 3 / 2: it is over its WIP limit of 2.' },
      { do: 'Clear the jam: move COLL-13 from In Progress to In Review.', see: 'In Progress drops back to 2 / 2 and is no longer amber.' },
      { do: 'Finish COLL-13: move it from In Review to Done.', see: 'Two cards are now in Done: COLL-8 and COLL-13.' },
    ],
  },
  'j-scrum': {
    terms: ['scrum', 'backlog', 'sprint', 'storypoints', 'velocity'],
    process: {
      title: 'How a sprint is planned',
      stages: [
        ['The backlog is ordered', 'Everything the team might do, most important first.'],
        ['Items are estimated', 'Each gets story points for its relative size. An item with no estimate is not ready.'],
        ['Capacity comes from velocity', 'The average points finished in recent sprints: here 18, 21 and 20, so about 20.'],
        ['The team pulls in work from the top', 'Until the points reach capacity, not beyond.'],
        ['The sprint starts', 'For two weeks the team works only on what it committed to.'],
      ],
    },
    practice: (key) => <SprintPlanner key={key} />,
    steps: [
      { do: 'In the sprint planner above these steps, click COLL-19 in the Backlog (the Highest-priority item).', see: 'It moves to Sprint 16, and the counter shows 3 / 20 points.', sprint: ['COLL-19'], total: 3 },
      { do: 'Add the two High or Medium items worth 5 points: COLL-15 and COLL-12.', see: '13 / 20 points.', sprint: ['COLL-19', 'COLL-15', 'COLL-12'], total: 13 },
      { do: 'Add the 8-point item, COLL-18.', see: '21 / 20 points, shown in amber: one point more than the team can finish.', sprint: ['COLL-19', 'COLL-15', 'COLL-12', 'COLL-18'], total: 21 },
      { do: 'Take COLL-18 back out by clicking it in the Sprint 16 list, then add COLL-20 (2 points) and COLL-16 (1 point).', see: '16 / 20 points: inside capacity, with the Highest-priority item included.', sprint: ['COLL-19', 'COLL-15', 'COLL-12', 'COLL-20', 'COLL-16'], total: 16 },
      { do: 'Add COLL-17 (2 points).', see: '18 / 20 points: a full, realistic sprint.', sprint: ['COLL-19', 'COLL-15', 'COLL-12', 'COLL-20', 'COLL-16', 'COLL-17'], total: 18 },
    ],
  },
  'j-jql': {
    terms: ['jql', 'query', 'filter', 'workitem', 'operator', 'error'],
    process: {
      title: 'How Jira reads a JQL search',
      stages: [
        ['A search is made of conditions', 'Each is field, operator, value: status = Done.'],
        ['Jira checks every work item', 'For each one it asks: is this condition true?'],
        ['AND narrows, OR widens', 'AND keeps items that pass both conditions. OR keeps items that pass either.'],
        ['Brackets group conditions', 'They decide which AND and OR belong together.'],
        ['The matches are listed', 'Add ORDER BY to choose how they are sorted.'],
      ],
    },
    practice: jqlBox('project = COLL'),
    steps: [
      { do: 'The search box above these steps already holds project = COLL. Press Enter (or the Search button).', code: 'project = COLL', see: '18 work items: everything in the Collections project.', count: 18 },
      { do: 'Add a second condition with AND. ' + JQL, code: 'project = COLL AND type = Bug', see: '4 results: only the bugs.', count: 4 },
      { do: 'Leave out the finished ones with != (not equal). ' + JQL, code: 'project = COLL AND type = Bug AND status != Done', see: '3 results: COLL-8, COLL-13 and COLL-16.', count: 3 },
      { do: 'Search for a status with a space in its name, without quotes. ' + JQL, code: 'status = In Progress', see: 'An error explaining that text with spaces needs quotes.', error: true },
      { do: 'Put the quotes in. ' + JQL, code: 'status = "In Progress"', see: '6 results.', count: 6 },
      { do: 'Match any of several values with IN. ' + JQL, code: 'priority IN (High, Highest) AND status = "To Do"', see: '2 results: COLL-9 and COLL-15.', count: 2 },
      { do: 'Widen a search with OR. ' + JQL, code: 'type = Bug OR priority = Highest', see: '5 results: every bug, plus anything of Highest priority.', count: 5 },
    ],
  },
  'j-jql-pro': {
    terms: ['jql', 'pyfunction', 'query', 'sprint', 'null'],
    process: {
      title: 'How a function in JQL is worked out',
      stages: [
        ['You write a function instead of a fixed value', 'assignee = currentUser()'],
        ['Jira works it out when the search runs', 'currentUser() becomes whoever is signed in. openSprints() becomes the sprints running now.'],
        ['The search continues as normal', 'With the worked-out value in place.'],
        ['So the same search fits everyone', 'A saved filter using currentUser() shows each person their own work.'],
        ['Relative dates work the same way', '-7d means "seven days before today", whenever today is.'],
      ],
    },
    practice: jqlBox('assignee = currentUser()'),
    steps: [
      { do: 'The search box above these steps already holds assignee = currentUser(). Press Enter.', code: 'assignee = currentUser()', see: '8 results: everything assigned to you (Shivam, in this sample site).', count: 8 },
      { do: 'Find work nobody owns. ' + JQL, code: 'assignee IS EMPTY', see: '5 results, none with an assignee.', count: 5 },
      { do: 'Find what is in the sprint running now, most urgent first. ' + JQL, code: 'sprint IN openSprints() ORDER BY priority DESC', see: '10 results, with the Highest-priority items at the top.', count: 10 },
      { do: 'Find work created in the last 7 days. ' + JQL, code: 'created >= -7d', see: '6 results, all created in the week before 2026-11-07 (today, in this sample site).', count: 6 },
      { do: 'Search inside the summary text with ~ (contains). ' + JQL, code: 'summary ~ "SMS"', see: '4 results, each with SMS in its summary.', count: 4 },
      { do: 'Find what is due soon, earliest first. ' + JQL, code: 'due <= "2026-11-21" ORDER BY due ASC', see: '2 results: COLL-6 first, then COLL-9.', count: 2 },
    ],
  },
  'j-reports': {
    terms: ['jql', 'savedfilter', 'dashboard', 'automation', 'burndown'],
    process: {
      title: 'How an automation rule runs',
      stages: [
        ['Something happens in Jira', 'A work item is created, moves to Done, or has its priority changed.'],
        ['Jira checks the triggers', 'Rules whose WHEN matches the event wake up.'],
        ['Each rule tests its condition', 'IF the item is a Bug, IF the priority is Highest… If the test fails, the rule stops there.'],
        ['The action is carried out', 'THEN assign it, add a label, add a comment.'],
        ['Nobody had to remember', 'The rule does the routine step every time, the same way.'],
      ],
    },
    practice: (key) => <AutomationBuilder key={key} />,
    steps: [
      { do: 'In the rule builder above these steps, read the sentence under the three menus. Then press "Test on 4 sample events".', see: 'The rule (when created, if priority is Highest, then add the label "urgent") runs for one event: Kiran creates a Highest-priority Bug. The other three are skipped.' },
      { do: 'Change the IF menu to "always", then test again.', see: 'Two events run now: both the Highest-priority Bug and the Medium Story were created.' },
      { do: 'Change the IF menu to "type is Bug", then test again.', see: 'Back to one: only the Bug that was created. The Story is skipped.' },
      { do: 'Change the WHEN menu to "a work item moves to Done", then test again.', see: 'A different event runs: COLL-8 (Bug) moves to Done.' },
      { do: 'Build this rule: WHEN the priority changes, IF priority is Highest, THEN assign it to Neha. Test it.', see: 'One event runs: COLL-12 priority raised to Highest.' },
    ],
  },
};
