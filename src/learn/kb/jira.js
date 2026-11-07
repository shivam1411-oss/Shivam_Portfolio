import { code } from './util';

export const jiraKb = {
  intro: 'Jira from your first work item to running many teams at scale. Examples come from software, marketing, HR, events and IT support, because Jira is used far beyond engineering.',
  topics: [
    // ------------------------------------------------------------ beginner
    {
      id: 'what-is-jira',
      level: 'beginner',
      title: 'What Jira is and the words it uses',
      summary: 'Jira is Atlassian\'s tool for planning and tracking team work. Work lives in projects as work items, each with a unique key like WEB-42.',
      body: [
        'A **site** (yourcompany.atlassian.net) contains **projects**, usually one per team or product. Each project holds **work items** (called "issues" before 2025, a word you will still see in JQL and older docs). Every work item gets a key made of the project key and a number: `MKT-17`.',
        'Jira answers three questions for a team: what are we doing, who is doing it, and where is it stuck? It is used by software teams, but also marketing (campaigns), HR (onboarding), legal (contract reviews) and IT (service requests).',
      ],
      code: code`
        Site:        acme.atlassian.net
        Project:     Website Relaunch (key: WEB)
        Work items:  WEB-1  Design new home page        Story   In Progress   Priya
                     WEB-2  Contact form not sending    Bug     To Do         Unassigned
                     WEB-3  Write launch blog post      Task    Done          Arjun
      `,
      lang: 'text',
      points: ['Projects contain work items with keys like WEB-1.', 'Work items were called issues; JQL still says issue.', 'Jira is used by every kind of team.'],
      realWorld: 'An events company tracks every task for a music festival (permits, stage, food stalls) as work items in one Jira project.',
      check: { q: 'In the key HR-58, what does HR mean?', options: ['The assignee', 'The project key', 'The priority', 'The sprint'], answer: 1, why: 'Keys are PROJECT-number.' },
      lesson: 'j-intro',
    },
    {
      id: 'types-fields',
      level: 'beginner',
      title: 'Work item types and fields',
      summary: 'Types describe what kind of work it is (Epic, Story, Task, Bug, Sub-task). Fields hold the details: summary, description, assignee, priority and more.',
      body: [
        'Common types: **Epic** (a big goal spanning weeks, like "Mobile app launch"), **Story** (something valuable for a user), **Task** (work that must be done), **Bug** (something broken) and **Sub-task** (a step inside another item). Epics sit above stories, tasks and bugs in the hierarchy.',
        'Key fields: Summary (one-line title), Description, Assignee, Reporter, Priority (Highest to Lowest), Status, Labels (free tags), Components (parts of the product), Due date, and Story points (size estimate).',
      ],
      code: code`
        Epic     MOB-1   Launch the iOS app
          Story  MOB-12  As a shopper, I can pay with UPI
            Sub-task MOB-13  Add UPI SDK
            Sub-task MOB-14  Payment success screen
          Bug    MOB-20  App crashes on rotating the checkout screen
          Task   MOB-25  Submit app to App Store review
      `,
      lang: 'text',
      points: ['Epic > Story / Task / Bug > Sub-task.', 'Summary should make sense on its own in a list.', 'Labels and components help filtering later.'],
      realWorld: 'An HR team uses an Epic per new joiner, with tasks for laptop, accounts, induction and buddy assignment.',
      check: { q: 'Which type is best for "Launch our new loyalty programme" (months of work)?', options: ['Sub-task', 'Bug', 'Epic', 'Task'], answer: 2, why: 'Epics group large bodies of work.' },
      lesson: 'j-intro',
    },
    {
      id: 'good-work-items',
      level: 'beginner',
      title: 'Writing good work items',
      summary: 'A good work item can be understood and finished by someone else without a meeting. Stories say who wants what and why; bugs say how to reproduce.',
      body: [
        'User story format: **As a** [user], **I want** [goal], **so that** [benefit], plus **acceptance criteria**: a checklist that defines done. Keep items small enough to finish in a few days.',
        'A bug report needs steps to reproduce, expected vs actual result, environment (browser, device, version) and evidence (screenshot, log). "It doesn\'t work" wastes everyone\'s time.',
      ],
      code: code`
        STORY  As a gym member, I want to book a class from my phone,
               so that I don't have to call reception.
        Acceptance criteria:
          [ ] I can see classes for the next 7 days
          [ ] Full classes show "Waitlist" instead of "Book"
          [ ] I get a confirmation email within 1 minute

        BUG    Booking button does nothing on Safari
        Steps: 1. Open app.gym.com on iPhone Safari 18  2. Choose Yoga  3. Tap Book
        Expected: confirmation screen    Actual: nothing happens, console error "x is undefined"
      `,
      lang: 'text',
      points: ['As a … I want … so that …', 'Acceptance criteria define done.', 'Bugs: steps, expected, actual, environment.'],
      realWorld: 'Support teams that require reproduction steps resolve bugs much faster than those working from vague reports.',
      check: { q: 'What do acceptance criteria describe?', options: ['Who is assigned', 'The conditions that must be true for the work to be done', 'The sprint dates', 'The priority'], answer: 1, why: 'They are the checklist for "done".' },
      lesson: 'j-intro',
    },
    {
      id: 'boards',
      level: 'beginner',
      title: 'Boards: Scrum and Kanban',
      summary: 'A board shows work items as cards in columns by status. Scrum boards plan in sprints; Kanban boards flow continuously.',
      body: [
        'Each column maps to one or more statuses (To Do, In Progress, Done). Moving a card changes its status. You can add **swimlanes** (rows by assignee, epic or priority) and **quick filters** (only my items, only bugs).',
        '**Scrum** suits work planned in fixed iterations (feature development). **Kanban** suits a steady stream of incoming work (support, content, operations) and limits how much is in progress at once.',
      ],
      code: code`
        KANBAN board: Content team
        | Ideas (8) | Writing (2/3) | Editing (1/2) | Scheduled (4) | Published |
        | "Monsoon  | "10 budget    | "Interview    | "Diwali gift  |  ...      |
        |  recipes" |  trips"       |  with chef"   |  guide"       |           |
        Swimlanes: Blog · Video · Newsletter        Quick filters: Only my items, Due this week
      `,
      lang: 'text',
      points: ['Columns = statuses; cards = work items.', 'Scrum = sprints; Kanban = continuous flow.', 'Swimlanes and quick filters focus the view.'],
      realWorld: 'A magazine\'s content team runs a Kanban board from idea to published article.',
      check: { q: 'An IT help desk receiving requests all day would usually use…', options: ['A Scrum board', 'A Kanban board', 'No board', 'A Gantt chart only'], answer: 1, why: 'Work arrives continuously, not in planned batches.' },
      lesson: 'j-board',
    },
    {
      id: 'workflows',
      level: 'beginner',
      title: 'Workflows and statuses',
      summary: 'A workflow is the path a work item follows: its statuses and the allowed moves (transitions) between them.',
      body: [
        'Statuses belong to three **status categories**: To Do (grey), In Progress (blue) and Done (green). Reports use these categories, so even custom statuses like "Waiting for legal" still count correctly.',
        'Transitions can have **rules**: only a reviewer can approve, a field must be filled before Done, or a comment is required when reopening. Start simple and add steps only when the team really needs them.',
      ],
      code: code`
        Recruitment workflow (HR team)
        Applied ──▶ Screening ──▶ Interview ──▶ Offer ──▶ Hired
                       │              │           │
                       └──────────────┴───────────┴──▶ Rejected
        Rule: "Offer" requires the Salary field.  Rule: "Rejected" requires a reason.
      `,
      lang: 'text',
      points: ['Workflow = statuses + transitions.', 'Every status has a category: To Do, In Progress or Done.', 'Rules enforce quality steps.'],
      realWorld: 'Recruitment teams model each candidate as a work item moving from Applied to Hired or Rejected.',
      check: { q: 'What is a transition?', options: ['A column colour', 'An allowed move from one status to another', 'A sprint', 'A report'], answer: 1, why: 'Transitions define how items move.' },
      lesson: 'j-board',
    },
    // ------------------------------------------------------------ intermediate
    {
      id: 'scrum-in-jira',
      level: 'intermediate',
      title: 'Running Scrum in Jira',
      summary: 'The backlog holds prioritised work. In sprint planning the team commits to a sprint goal and a slice of the backlog, then completes the sprint and reviews.',
      body: [
        'The **product owner** orders the backlog by value. In **sprint planning** the team picks the top items that fit its capacity and writes a **sprint goal** (one sentence of purpose). During the sprint the team holds a short daily stand-up.',
        'At the end, **Complete sprint** moves unfinished items back to the backlog or into the next sprint. The **sprint review** shows what was built; the **retrospective** improves how the team works.',
      ],
      code: code`
        Sprint 23  ·  10 working days  ·  Goal: "Customers can track their parcel live"
        Committed: 21 points (team velocity ≈ 20)
          SHIP-101  Live map on tracking page          8
          SHIP-104  SMS when parcel is out for delivery 5
          SHIP-110  Fix wrong ETA for remote PIN codes  3
          SHIP-112  Courier app: share live location    5
      `,
      lang: 'text',
      points: ['Backlog ordered by value.', 'A sprint goal gives purpose beyond a list.', 'Review the product and the process each sprint.'],
      realWorld: 'A logistics company ships parcel-tracking improvements every two weeks using Scrum in Jira.',
      check: { q: 'What happens to unfinished items when a sprint is completed?', options: ['Deleted', 'Moved to the backlog or next sprint', 'Marked Done', 'Archived forever'], answer: 1, why: 'Jira asks where to move them.' },
      lesson: 'j-scrum',
    },
    {
      id: 'estimation',
      level: 'intermediate',
      title: 'Estimation, story points and velocity',
      summary: 'Story points estimate relative size. Velocity, the points finished per sprint, tells you how much to plan.',
      body: [
        'Teams compare new work to familiar items: "twice as big as the login page". Points often use Fibonacci-like numbers (1, 2, 3, 5, 8, 13) because larger work is less certain. **Planning poker** has everyone reveal estimates at once to avoid anchoring.',
        '**Velocity** is the average points completed in recent sprints. It is a planning tool for that team only: comparing velocities between teams, or pushing a team to "raise velocity", just inflates the numbers.',
      ],
      code: code`
        Recent sprints:  Sprint 20: 18   Sprint 21: 23   Sprint 22: 19
        Average velocity = (18 + 23 + 19) / 3 = 20 points
        Next sprint: plan about 20 points, minus holidays.
        Team of 5 with 1 person away 3 of 10 days → capacity ≈ 20 × (47/50) ≈ 19 points
      `,
      lang: 'text',
      points: ['Points measure relative size, not hours.', 'Velocity = average completed points.', 'Never compare velocity between teams.'],
      realWorld: 'A mobile team uses its velocity to tell marketing a realistic launch month instead of a guess.',
      check: { q: 'Why use 1, 2, 3, 5, 8, 13 instead of 1 to 13?', options: ['Tradition', 'Bigger items are less certain, so the gaps widen', 'Jira requires it', 'To make maths easier'], answer: 1, why: 'Fine distinctions between large items are false precision.' },
      lesson: 'j-scrum',
    },
    {
      id: 'kanban-flow',
      level: 'intermediate',
      title: 'Kanban flow: WIP limits and cycle time',
      summary: 'Kanban improves flow by limiting work in progress and measuring how long items take from start to finish.',
      body: [
        'A **WIP limit** caps how many items can be in a column. When a column is full, the team helps finish work instead of starting more, which exposes bottlenecks and reduces context switching.',
        '**Cycle time** is the time from start to done for one item; **throughput** is items finished per week. Little\'s Law links them: average cycle time ≈ work in progress ÷ throughput, so less WIP means faster delivery.',
      ],
      code: code`
        IT support board: In Progress limit 4
        This week: throughput = 20 tickets/week, average WIP = 8
        Little's Law: cycle time ≈ 8 / 20 = 0.4 weeks ≈ 2 working days
        Halve WIP to 4 → cycle time ≈ 1 day, with the same people.
      `,
      lang: 'text',
      points: ['WIP limits: stop starting, start finishing.', 'Cycle time and throughput measure flow.', 'Less WIP → shorter cycle time (Little\'s Law).'],
      realWorld: 'An IT help desk cut average resolution time in half by limiting each agent to two open tickets.',
      check: { q: 'According to Little\'s Law, reducing WIP with the same throughput…', options: ['Increases cycle time', 'Reduces cycle time', 'Has no effect', 'Reduces quality'], answer: 1, why: 'Cycle time ≈ WIP ÷ throughput.' },
      lesson: 'j-board',
    },
    {
      id: 'jql-basics',
      level: 'intermediate',
      title: 'JQL: searching for work',
      summary: 'Jira Query Language finds work items with conditions like project = WEB AND status = "In Progress". Try it on the practice data below.',
      body: [
        'A JQL clause is **field operator value**: `priority = High`, `assignee != currentUser()`, `labels in (urgent, vip)`. Join clauses with `AND`, `OR` and brackets, and sort with `ORDER BY`. Values with spaces need quotes.',
        'Useful operators: `=`, `!=`, `>`, `<`, `IN`, `NOT IN`, `~` (contains text), `IS EMPTY`. The practice sandbox below has two projects, COLL and PORT; edit the query and press Search.',
      ],
      code: 'project = PORT AND status != Done ORDER BY priority DESC',
      lang: 'jql',
      run: true,
      points: ['field operator value.', 'AND, OR, NOT and brackets.', 'Quote values with spaces.'],
      realWorld: 'A product manager saves "type = Bug AND priority in (Highest, High) AND resolution IS EMPTY" to review every morning.',
      check: { q: 'Which finds all unassigned items?', options: ['assignee = ""', 'assignee IS EMPTY', 'assignee = none', 'assignee NOT'], answer: 1, why: 'IS EMPTY checks for a missing value.' },
      lesson: 'j-jql',
    },
    {
      id: 'filters-dashboards',
      level: 'intermediate',
      title: 'Filters, dashboards and notifications',
      summary: 'Save a JQL search as a filter, share it, and use it to power boards, dashboards and email subscriptions.',
      body: [
        'A **filter** is a saved JQL search with its own permissions. Boards are built on filters, and **dashboards** show gadgets (pie charts, two-dimensional tables, created-vs-resolved charts) that each read a filter.',
        '**Subscriptions** email a filter\'s results on a schedule, such as overdue items every Monday at 9. Build dashboards around questions people actually ask, and remove gadgets nobody uses.',
      ],
      code: code`
        Filter: "Marketing - due this week"
          project = MKT AND duedate >= startOfWeek() AND duedate <= endOfWeek() AND statusCategory != Done
        Dashboard "Campaign health":
          • Pie chart: by assignee          • Created vs resolved (30 days)
          • Two-dimensional: status × label • Filter results: due this week
        Subscription: every Monday 09:00 → marketing-leads@company.com
      `,
      lang: 'text',
      points: ['Filters = saved, shareable JQL.', 'Dashboards are gadgets over filters.', 'Subscriptions email results on a schedule.'],
      realWorld: 'A marketing lead gets a Monday email of every campaign task due that week.',
      check: { q: 'What do dashboard gadgets usually read from?', options: ['Spreadsheets', 'Saved filters', 'Emails', 'Confluence pages'], answer: 1, why: 'Each gadget is configured with a filter.' },
      lesson: 'j-reports',
    },
    // ------------------------------------------------------------ advanced
    {
      id: 'advanced-jql',
      level: 'advanced',
      title: 'Advanced JQL: functions and history',
      summary: 'Functions like openSprints(), membersOf() and startOfMonth() make queries dynamic. History operators WAS and CHANGED search the past.',
      body: [
        'Functions fill in values when the query runs: `sprint in openSprints()`, `assignee in membersOf("support-team")`, `created >= startOfMonth(-1)`, `issuekey in linkedIssues(WEB-10)`. Relative dates like `-14d` mean 14 days ago.',
        'History operators find what happened: `status WAS "In Review" DURING (startOfWeek(), now())`, `status CHANGED FROM "Done" TO "In Progress"` (reopened work), `assignee CHANGED BY currentUser()`. These are great for audits and process metrics.',
      ],
      code: code`
        -- Bugs reopened in the last 30 days
        type = Bug AND status CHANGED FROM Done TO "In Progress" AFTER -30d

        -- Work my team touched this sprint that is still not done
        sprint in openSprints() AND assignee in membersOf("web-team") AND statusCategory != Done

        -- Items stuck in review for more than 5 days
        status = "In Review" AND NOT status CHANGED AFTER -5d

        -- Last month's created items, oldest first
        created >= startOfMonth(-1) AND created < startOfMonth() ORDER BY created ASC
      `,
      lang: 'jql',
      points: ['Functions keep filters up to date.', 'WAS and CHANGED search history.', 'startOfMonth(-1) means last month.'],
      realWorld: 'Quality teams track how often "done" work gets reopened using status CHANGED FROM Done.',
      check: { q: 'Which finds items that were ever in the "Blocked" status?', options: ['status = Blocked', 'status WAS Blocked', 'status ~ Blocked', 'status IN Blocked()'], answer: 1, why: 'WAS checks history, not just the current value.' },
      lesson: 'j-jql-pro',
    },
    {
      id: 'automation',
      level: 'advanced',
      title: 'Automation rules and smart values',
      summary: 'Automation rules follow when → if → then: a trigger, optional conditions, and actions. Smart values insert data like {{issue.key}}.',
      body: [
        '**Triggers**: work item created, transitioned, field changed, scheduled (e.g. every day at 9), or incoming webhook. **Conditions**: JQL or field checks. **Actions**: assign, transition, comment, edit fields, create items, send email, Slack or Teams messages, or call a web request.',
        '**Smart values** in double braces insert live data: `{{issue.summary}}`, `{{issue.assignee.displayName}}`, `{{now.plusDays(3)}}`. Branching rules act on related items, like closing all sub-tasks when the parent closes. Check the **audit log** when a rule misbehaves.',
      ],
      code: code`
        Rule: "Escalate VIP tickets"
        WHEN   Work item created
        IF     Reporter's organisation = "Gold customers"  AND  Priority = High
        THEN   Set priority to Highest
               Assign to: on-call engineer (rotation)
               Send Slack message to #vip-support:
                 "🚨 {{issue.key}} {{issue.summary}} from {{reporter.displayName}}, due {{now.plusHours(4)}}"

        Rule: "Close sub-tasks"
        WHEN   Transitioned to Done   →  FOR sub-tasks  →  Transition to Done
      `,
      lang: 'text',
      points: ['Trigger → condition → action.', 'Smart values {{…}} insert live data.', 'Use the audit log to debug.'],
      realWorld: 'A SaaS company auto-escalates high-priority tickets from top customers to on-call engineers within seconds.',
      check: { q: 'In {{issue.key}}, the double braces mean…', options: ['A comment', 'A smart value replaced with real data', 'A JQL function', 'A link'], answer: 1, why: 'Smart values are filled in when the rule runs.' },
      lesson: 'j-reports',
    },
    {
      id: 'reports',
      level: 'advanced',
      title: 'Agile reports: burndown, burnup, velocity, CFD',
      summary: 'Reports turn board history into insight: is the sprint on track, is scope growing, and where does work get stuck?',
      body: [
        '**Burndown**: work remaining in the sprint versus an ideal line. **Burnup**: work completed against total scope, which shows scope creep that a burndown hides. **Velocity chart**: committed vs completed per sprint.',
        '**Cumulative flow diagram (CFD)**: coloured bands per status over time; a widening band is a bottleneck. **Control chart**: cycle time per item, revealing outliers and predictability.',
      ],
      code: code`
        Reading a CFD for a design agency:
        Done        ████████████████████████  (steady growth = good)
        Review      ████████████████          (band widening = bottleneck!)
        In Progress ██████
        To Do       ████
        → Too few reviewers. Fix: limit WIP in Review, add a second reviewer.
      `,
      lang: 'text',
      points: ['Burndown = remaining; burnup = done vs scope.', 'CFD bands that widen are bottlenecks.', 'Control charts show cycle-time spread.'],
      realWorld: 'A design agency spotted from its CFD that client approvals, not design, slowed every project.',
      check: { q: 'Which chart best reveals scope creep during a sprint?', options: ['Pie chart', 'Burnup', 'Velocity', 'Two-dimensional table'], answer: 1, why: 'Burnup shows the scope line rising.' },
      lesson: 'j-reports',
    },
    {
      id: 'configuration',
      level: 'advanced',
      title: 'Configuring projects: team-managed vs company-managed',
      summary: 'Team-managed projects let a team configure itself simply. Company-managed projects share schemes for consistency across many teams.',
      body: [
        '**Team-managed** projects: project admins change types, fields and workflow for that project only; quick to set up. **Company-managed** projects: Jira admins define shared **schemes** (work type, workflow, screen, field configuration, permission, notification) reused by many projects.',
        'Other configuration: custom fields (keep them few, or reuse existing ones), screens (which fields appear when), field contexts, and required fields. Every extra field adds friction for every user.',
      ],
      code: code`
        Company-managed project "Finance Requests" (FIN)
          Work type scheme:     Request, Approval, Sub-task
          Workflow scheme:      Finance approval workflow
          Screen scheme:        Create: Amount, Cost centre, Justification
          Permission scheme:    Only Finance can transition to Approved
          Notification scheme:  Requester notified on status change
      `,
      lang: 'text',
      points: ['Team-managed = simple and local.', 'Company-managed = shared schemes.', 'Add custom fields sparingly.'],
      realWorld: 'A bank uses company-managed projects so every department\'s approval workflow follows the same audit rules.',
      check: { q: 'A large company wants 40 projects to share one approval workflow. Best choice?', options: ['Team-managed projects', 'Company-managed projects with a shared workflow scheme', 'Spreadsheets', 'One huge project'], answer: 1, why: 'Schemes are reused across projects.' },
    },
    {
      id: 'releases-links',
      level: 'advanced',
      title: 'Releases, links and developer integrations',
      summary: 'Versions group work into releases. Links connect related items, and integrations with GitHub, GitLab or Bitbucket show code activity in Jira.',
      body: [
        'Set a **Fix version** on items to plan a release; the release page shows progress and generates release notes. **Components** split a product into areas with default owners. **Links** record relationships: blocks / is blocked by, duplicates, relates to.',
        'Connect your code host and mention keys in branches, commits and pull requests (`WEB-42-add-search`). Jira then shows the development panel on the item, and automation can transition items when a PR merges.',
      ],
      code: code`
        git checkout -b WEB-42-add-search
        git commit -m "WEB-42 Add search box to header"
        # Pull request "WEB-42 Add search" appears on WEB-42's Development panel.
        # Automation: WHEN pull request merged → transition WEB-42 to Done

        Release v2.4 (Fix version)  ·  18 items  ·  15 done  ·  2 in progress  ·  1 blocked by WEB-50
      `,
      lang: 'bash',
      points: ['Fix versions plan releases and notes.', 'Links: blocks, duplicates, relates to.', 'Put the key in branch, commit and PR names.'],
      realWorld: 'Mobile teams generate App Store release notes directly from the items in a Jira fix version.',
      check: { q: 'How does Jira connect a commit to WEB-42?', options: ['Manually only', 'The key WEB-42 appears in the commit message or branch', 'By date', 'By author'], answer: 1, why: 'Integrations scan for work item keys.' },
    },
    // ------------------------------------------------------------ expert
    {
      id: 'scaling-agile',
      level: 'expert',
      title: 'Planning across many teams',
      summary: 'Jira Plans (formerly Advanced Roadmaps) rolls work up into a hierarchy above epics and plans capacity, dependencies and dates across teams.',
      body: [
        'Add levels above Epic, such as **Initiative** or **Theme**, to connect daily work to company goals. A **plan** pulls items from many projects and boards, shows them on a timeline, and highlights **dependencies** (blocks / is blocked by) that cross teams.',
        'Capacity planning uses each team\'s velocity or hours to forecast when work can finish, and **scenarios** let you compare options ("hire one more" vs "drop feature X") without changing the real data. Frameworks like SAFe and LeSS add ceremonies for many teams; tooling only helps if priorities are clear.',
      ],
      code: code`
        Hierarchy:  Initiative  "Launch in Southeast Asia"
                      Epic  PAY-3   Local payment methods           (Payments team)
                      Epic  APP-9   Thai and Bahasa translations    (App team)
                      Epic  OPS-2   Singapore data centre           (Platform team)
        Dependency: APP-9 is blocked by OPS-2 (needs region API)
        Plan: Platform capacity 30 pts/sprint → OPS-2 done Sprint 31 → APP-9 can start Sprint 32
      `,
      lang: 'text',
      points: ['Hierarchy levels above epics tie work to goals.', 'Plans show cross-team dependencies.', 'Scenarios compare options safely.'],
      realWorld: 'A fintech launching in a new country coordinates payments, app and infrastructure teams in one Jira plan.',
      check: { q: 'What do scenarios in a plan let you do?', options: ['Delete projects', 'Explore alternative plans without changing live data', 'Write JQL', 'Send emails'], answer: 1, why: 'They are sandboxes for planning decisions.' },
    },
    {
      id: 'administration',
      level: 'expert',
      title: 'Administration, permissions and governance',
      summary: 'At scale, Jira needs clear ownership: who can see what, who can change configuration, and how to keep the site clean and secure.',
      body: [
        '**Permission schemes** grant actions (browse, create, transition, administer) to **project roles**, groups or users. **Security levels** hide sensitive items (HR cases, security bugs) from people who can otherwise see the project. Use roles rather than named users so membership changes in one place.',
        'Governance habits: a small group of admins, a request process for new fields and workflows, regular clean-up of unused custom fields and schemes, archiving old projects, single sign-on, and reviewing the **audit log**.',
      ],
      code: code`
        Permission scheme "Confidential HR"
          Browse projects       → role: HR Team
          Create work items     → role: HR Team, group: managers
          Set security level    → role: HR Admins
        Security level "Investigation" → only role: HR Admins
        Quarterly hygiene: remove 37 unused custom fields, archive 12 inactive projects
      `,
      lang: 'text',
      points: ['Grant permissions to roles, not individuals.', 'Security levels hide sensitive items.', 'Govern configuration changes and clean up regularly.'],
      realWorld: 'Companies keep HR investigations in Jira with security levels so only HR administrators can see them.',
      check: { q: 'Why grant permissions to project roles instead of named people?', options: ['It is faster to type', 'Membership can change in one place without editing schemes', 'Roles are free', 'Jira requires it'], answer: 1, why: 'Schemes stay stable while people move.' },
    },
    {
      id: 'rest-api',
      level: 'expert',
      title: 'Automating with the Jira REST API',
      summary: 'Everything in Jira is available through a REST API, so scripts can create items, search with JQL and build custom reports.',
      body: [
        'Jira Cloud\'s REST API v3 uses an email plus **API token** (basic auth) for scripts, or OAuth for apps. Search with JQL at `/rest/api/3/search/jql` (the newer endpoint that replaced the older `/search`), paging with `nextPageToken`. Descriptions use Atlassian Document Format (ADF), a JSON structure.',
        'Respect rate limits (retry after HTTP 429), never hard-code tokens, and prefer built-in automation for simple tasks. **Forge** is Atlassian\'s platform for building apps that run inside Jira.',
      ],
      code: code`
        import os, requests

        SITE = "https://acme.atlassian.net"
        auth = (os.environ["JIRA_EMAIL"], os.environ["JIRA_API_TOKEN"])

        # Search with JQL
        r = requests.get(f"{SITE}/rest/api/3/search/jql", auth=auth, params={
            "jql": "project = WEB AND statusCategory != Done ORDER BY priority DESC",
            "fields": "summary,status,assignee", "maxResults": 50,
        })
        for item in r.json()["issues"]:
            print(item["key"], item["fields"]["summary"])

        # Create a work item
        requests.post(f"{SITE}/rest/api/3/issue", auth=auth, json={"fields": {
            "project": {"key": "WEB"}, "issuetype": {"name": "Task"},
            "summary": "Renew SSL certificate",
        }})
      `,
      lang: 'python',
      note: 'Shown, not run: it needs a real Jira site and API token.',
      points: ['API token + email for scripts; keep tokens secret.', 'Search with /rest/api/3/search/jql and page through results.', 'Handle 429 rate limits.'],
      realWorld: 'Operations teams auto-create Jira tasks from monitoring alerts using the REST API.',
      check: { q: 'Where should a Jira API token be stored?', options: ['In the script', 'In an environment variable or secret manager', 'In a Jira comment', 'In the README'], answer: 1, why: 'Tokens grant access as you.' },
    },
    {
      id: 'metrics',
      level: 'expert',
      title: 'Metrics that matter (and ones that mislead)',
      summary: 'Measure flow and outcomes, not activity. Velocity and ticket counts are easy to game; cycle time, predictability and customer impact are not.',
      body: [
        '**Flow metrics**: cycle time, throughput, WIP and work-item age (how long current items have been open). **DORA metrics** for software delivery: deployment frequency, lead time for changes, change failure rate and time to restore service.',
        'Goodhart\'s law: when a measure becomes a target, it stops being a good measure. Rewarding velocity inflates points; rewarding closed tickets splits work into tiny items. Use metrics to ask questions in retrospectives, not to rank people.',
      ],
      code: code`
        Monthly delivery review (team: Checkout)
          Cycle time (85th percentile):   6 days   (was 9)
          Throughput:                     34 items/month
          Oldest in-progress item:        WEB-311, 21 days  → discuss blocker
          Deployment frequency:           daily
          Change failure rate:            4%
        Not reported: story points per person (encourages gaming)
      `,
      lang: 'text',
      points: ['Track flow: cycle time, throughput, WIP, age.', 'DORA metrics for delivery health.', 'Metrics inform discussion; they do not rank people.'],
      realWorld: 'Engineering leaders use DORA metrics, popularised by the Accelerate research, to track delivery health across teams.',
      check: { q: 'Goodhart\'s law warns that…', options: ['Metrics are always accurate', 'A measure that becomes a target gets gamed', 'Velocity predicts revenue', 'More metrics are better'], answer: 1, why: 'People optimise the number instead of the goal.' },
    },
    {
      id: 'service-management',
      level: 'expert',
      title: 'Jira Service Management and the wider Atlassian stack',
      summary: 'Jira Service Management adds customer portals, queues and SLAs for IT and business help desks. Confluence and other tools connect around Jira.',
      body: [
        '**Jira Service Management (JSM)** gives customers a portal and email channel; agents work from **queues**; **SLAs** track time to first response and resolution with goals per priority. It supports ITSM practices: incidents, problems, changes and service requests, plus asset tracking.',
        '**Confluence** holds documentation linked to work items (requirements, runbooks, release notes). Teams also connect chat tools, CI/CD, and monitoring so alerts become incidents automatically.',
      ],
      code: code`
        JSM project "IT Help" (portal: help.acme.com)
          Request types: Laptop issue · New software · Access request · Report an incident
          Queues: Unassigned · Breaching in < 1h · Waiting for customer
          SLA goals:  P1 incident: first response 15 min, resolve 4 h
                      Access request: resolve 2 business days
          Knowledge base: Confluence space "IT How-to" suggests articles on the portal
      `,
      lang: 'text',
      points: ['JSM = portal + queues + SLAs.', 'ITSM: incidents, problems, changes, requests.', 'Confluence holds the knowledge linked to work.'],
      realWorld: 'Universities run student IT help desks on JSM with a portal and SLAs for password resets.',
      check: { q: 'What does an SLA in JSM measure?', options: ['Story points', 'Time against response/resolution goals', 'Number of agents', 'Velocity'], answer: 1, why: 'SLAs track promised service times.' },
    },
  ],
};
