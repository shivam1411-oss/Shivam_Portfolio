// Beginner guides for the React, Jira and Kubernetes lessons (same shape as guides/python.js).

export const reactGuide = {
  'r-intro': {
    idea: 'A React component is a function that returns what the screen should show, written in JSX, a mix of HTML-like tags and JavaScript.',
    terms: ['react', 'component', 'jsx'],
    mistakes: [
      ['Writing class="…" in JSX', 'JSX uses className="…" because class is a reserved word in JavaScript.'],
      ['Returning two elements side by side', 'Wrap them in one parent: <div>…</div> or a fragment <>…</>.'],
      ['A lower-case component name: function app()', 'Components must start with a capital letter: function App().'],
    ],
    faq: [
      ['Is JSX HTML?', 'It looks like it, but it is turned into JavaScript calls before running. That is why some names differ (className, onClick) and why you can put JavaScript in { }.'],
      ['Do I need to install anything to follow along?', 'No. The code runs here with React 19. For your own projects you would start with npm create vite@latest.'],
    ],
    recap: ['function App() { return <h1>Hi</h1>; } is a component.', '{ } inside JSX runs JavaScript: variables, maths, calls.', 'Use className and style={{ … }} for styling.'],
  },
  'r-props': {
    idea: 'Props are a component\'s inputs: write the component once, then reuse it with different props, just like calling a function with different arguments.',
    terms: ['props', 'component'],
    mistakes: [
      ['Changing a prop inside the component', 'Props are read-only. Keep changing values in state, or ask the parent to pass new ones.'],
      ['Forgetting the curly braces when destructuring: function Card(label)', 'Props arrive as one object: function Card({ label }) or function Card(props) and props.label.'],
    ],
    faq: [
      ['How do I pass a number or true/false?', 'Use braces: <Card count={3} good={true} />. Quotes always mean text.'],
      ['What is children?', 'Whatever you put between the opening and closing tags, passed in automatically as the children prop.'],
    ],
    recap: ['<StatCard label="DSO" value="48" /> passes props.', 'function StatCard({ label, value }) receives them.', 'children is the content between the tags.'],
  },
  'r-state': {
    idea: 'State is a component\'s memory: change it with its setter and React redraws the component with the new value.',
    terms: ['state', 'hook', 'render'],
    mistakes: [
      ['Changing the variable directly: count = count + 1', 'Always use the setter: setCount(count + 1).'],
      ['Calling the setter while rendering: onClick={setCount(1)}', 'Pass a function: onClick={() => setCount(1)}, otherwise it runs immediately and loops.'],
    ],
    faq: [
      ['Why doesn\'t the new value appear on the next line after setCount?', 'State updates take effect on the next render. Inside the same click handler, count still holds the old value.'],
      ['When should I use setCount((c) => c + 1)?', 'Whenever the new value depends on the old one; it always uses the latest value.'],
    ],
    recap: ['const [value, setValue] = useState(start).', 'onClick={() => setValue(…)} responds to clicks.', 'Calling the setter re-renders the component.'],
  },
  'r-lists': {
    idea: 'Turn an array into a list on screen with map, give each item a stable key, and use && or ?: to show things only when they apply.',
    terms: ['react', 'state'],
    mistakes: [
      ['Forgetting the key, or using the array index when items can move', 'Use something unique and stable from the data, like an id.'],
      ['{count && <p>…</p>} showing a stray 0', 'When count is 0, React renders the 0. Write {count > 0 && <p>…</p>}.'],
    ],
    faq: [
      ['Why does React need keys?', 'To match each item with its previous version, so it updates only what changed and keeps input focus and state in the right row.'],
      ['How do I filter a list?', 'Filter the array first (data.filter(…)), then map over the result.'],
    ],
    recap: ['{items.map((i) => <li key={i.id}>…</li>)} renders a list.', 'cond && <X /> shows X only when cond is true.', 'cond ? <A /> : <B /> chooses between two.'],
  },
  'r-forms': {
    idea: 'Keep an input\'s text in state (value + onChange) and everything that depends on it, like a filtered list, updates as you type.',
    terms: ['state'],
    mistakes: [
      ['Setting value without onChange', 'The input becomes read-only. Always pair value with onChange.'],
      ['Mutating an array: items.push(x); setItems(items)', 'Create a new array: setItems([...items, x]) so React notices the change.'],
    ],
    faq: [
      ['Why is e.target.value always text?', 'Inputs hold text. Convert with Number(…) before doing maths.'],
      ['What does e.preventDefault() do in a form?', 'Stops the browser\'s default submit, which would reload the page and lose your state.'],
    ],
    recap: ['value={text} onChange={(e) => setText(e.target.value)}.', 'Derive filtered results from the text during render.', 'onSubmit with e.preventDefault() for forms.'],
  },
  'r-effects': {
    idea: 'useEffect runs code after React has drawn the screen: loading data, starting timers or talking to anything outside React, with clean-up when it is done.',
    terms: ['effect', 'hook'],
    mistakes: [
      ['Leaving out the dependency array and setting state inside the effect', 'The effect runs after every render and loops forever. Add [] (once) or the values it depends on.'],
      ['Forgetting clean-up for timers', 'Return () => clearInterval(id) so old timers stop.'],
    ],
    faq: [
      ['Why not load data directly in the component body?', 'The body runs on every render; loading there would fire endless requests. Effects run when you say.'],
      ['What should the loading screen show?', 'Something simple like "Loading…", and an error message if the request fails.'],
    ],
    recap: ['useEffect(() => { … }, []) runs once after the first render.', 'Keep data, loading and error in state.', 'Return a clean-up function for timers and subscriptions.'],
  },
  'r-project': {
    idea: 'Store the smallest possible state and calculate everything else from it on each render; split the screen into small components with clear props.',
    terms: ['component', 'state', 'props'],
    mistakes: [
      ['Keeping filtered lists and totals in state too', 'Derive them from the base state; duplicated state gets out of sync.'],
      ['One giant component', 'Pull out pieces like <Total rows={rows} /> as soon as a part has its own job.'],
    ],
    faq: [
      ['How do real projects start?', 'npm create vite@latest my-app -- --template react, then npm install and npm run dev.'],
      ['What should I learn next?', 'Styling (Tailwind), routing, and fetching real data. The Learn the Code course shows all three in this portfolio.'],
    ],
    recap: ['One source of truth in state; everything else derived.', 'Small components with clear props.', 'Buttons change state; the UI follows automatically.'],
  },
};

export const jiraGuide = {
  'j-intro': {
    idea: 'Jira organises work as work items inside projects; each item has a type, a status, an owner and a priority, so everyone sees what is happening.',
    terms: ['jira', 'workitem'],
    mistakes: [
      ['Vague summaries like "Fix issue"', 'Write a summary anyone understands in a list: "Payment link expires before customer opens it".'],
      ['Everything as a Task', 'Use the right type: Stories for user value, Bugs for defects, Epics for big goals.'],
    ],
    faq: [
      ['Issue or work item?', 'Same thing. Jira Cloud renamed issues to work items in 2025; older docs, JQL and the API still say issue.'],
      ['Is Jira only for software?', 'No. Business teams track campaigns, approvals and service requests in it too.'],
    ],
    recap: ['Projects contain work items with keys like COLL-13.', 'Epic > Story/Task/Bug > Sub-task.', 'Status, assignee and priority tell you where work stands.'],
  },
  'j-board': {
    idea: 'A board shows work as cards in status columns, and the workflow decides which moves between columns are allowed.',
    terms: ['workflow'],
    mistakes: [
      ['Starting many items at once', 'Respect WIP limits: finish before starting.'],
      ['Skipping review straight to Done', 'Workflows encode the team\'s quality steps; follow the transitions.'],
    ],
    faq: [
      ['Who sets up the workflow?', 'A Jira admin or project admin. Teams usually start simple: To Do, In Progress, Done.'],
      ['Kanban or Scrum board?', 'Kanban for continuous flow (support, operations); Scrum when you plan in fixed sprints.'],
    ],
    recap: ['Columns are statuses; cards are work items.', 'Transitions are the allowed moves.', 'WIP limits keep work flowing.'],
  },
  'j-scrum': {
    idea: 'Scrum plans work in short sprints: pick from a prioritised backlog only as much as the team\'s velocity says it can finish.',
    terms: ['scrum', 'sprint', 'storypoints', 'velocity'],
    mistakes: [
      ['Treating story points as hours', 'Points are relative size. Compare with past items instead of counting hours.'],
      ['Committing to more than recent velocity', 'Plan close to the average of the last few sprints.'],
    ],
    faq: [
      ['What if something urgent comes up mid-sprint?', 'Discuss it with the product owner; swap it with something of similar size, or handle it in the next sprint.'],
      ['How long is a sprint?', 'Most teams use two weeks; one to four weeks is common.'],
    ],
    recap: ['Backlog → sprint planning → daily stand-up → review → retrospective.', 'Estimate in story points.', 'Velocity guides how much to plan.'],
  },
  'j-jql': {
    idea: 'JQL finds exactly the work you want with field-operator-value conditions joined by AND and OR, much like SQL\'s WHERE.',
    terms: ['jql'],
    mistakes: [
      ['status = In Progress without quotes', 'Values with spaces need quotes: status = "In Progress".'],
      ['Mixing AND and OR without brackets', 'AND is evaluated first; add brackets to say what you mean.'],
    ],
    faq: [
      ['Is JQL case-sensitive?', 'Keywords and field names are not. Text values usually are not for statuses and names.'],
      ['Where do I type JQL in Jira?', 'In the search page, switch from basic to JQL (advanced) search.'],
    ],
    recap: ['field operator value, e.g. priority = Highest.', 'AND, OR, NOT and brackets combine conditions.', 'IN ( … ) matches any value in a list.'],
  },
  'j-jql-pro': {
    idea: 'Functions like currentUser() and relative dates like -7d make one saved search useful for everyone, every day.',
    terms: ['jql'],
    mistakes: [
      ['Hard-coding your own name in a shared filter', 'Use currentUser() so each person sees their own work.'],
      ['assignee = EMPTY', 'Use IS EMPTY / IS NOT EMPTY for missing values.'],
    ],
    faq: [
      ['What does ~ do?', 'Text search: summary ~ "sms" finds items whose summary contains the word sms.'],
      ['How do I sort?', 'Add ORDER BY at the end: ORDER BY priority DESC, created ASC.'],
    ],
    recap: ['currentUser(), openSprints(), startOfWeek() fill in values.', 'Relative dates: created >= -7d.', 'IS EMPTY, ~ text search, ORDER BY sorting.'],
  },
  'j-reports': {
    idea: 'Saved filters feed dashboards and boards, and automation rules (when, if, then) remove repetitive clicks.',
    terms: ['automation', 'jql'],
    mistakes: [
      ['Dashboards nobody looks at', 'Build a dashboard around one question the team asks every week.'],
      ['Automating everything at once', 'Start with one frequent, boring step and check the audit log.'],
    ],
    faq: [
      ['What is a burndown?', 'A chart of work remaining in a sprint, day by day, against an ideal straight line.'],
      ['Can automation send messages?', 'Yes: email, Slack or Microsoft Teams, as rule actions.'],
    ],
    recap: ['Filters are saved JQL searches.', 'Burndown above the ideal line means behind.', 'Automation: trigger → condition → action.'],
  },
};

export const k8sGuide = {
  'k-intro': {
    idea: 'Containers package an app to run anywhere; Kubernetes runs many of them across machines and keeps them the way you describe.',
    terms: ['container', 'image', 'kubernetes', 'node'],
    mistakes: [
      ['Thinking a container is a small virtual machine', 'Containers share the host\'s kernel and carry only the app and its libraries, so they are far lighter.'],
      ['Telling Kubernetes how instead of what', 'Describe the desired state (3 replicas); Kubernetes works out the steps.'],
    ],
    faq: [
      ['Do I need Docker to use Kubernetes?', 'You need container images, often built with Docker; Kubernetes itself runs them with a container runtime such as containerd.'],
      ['Can I try a real cluster?', 'Yes: minikube or kind run one on your laptop for free.'],
    ],
    recap: ['Image = package; container = running copy.', 'Control plane decides; nodes run the containers.', 'You declare the desired state; Kubernetes maintains it.'],
  },
  'k-pods': {
    idea: 'A pod is the smallest unit Kubernetes runs, described in a YAML manifest with apiVersion, kind, metadata and spec.',
    terms: ['pod', 'kubectl', 'label'],
    mistakes: [
      ['Tabs or wrong indentation in YAML', 'Use spaces only, two per level, and "- " for list items.'],
      ['Running production apps as bare pods', 'Use a Deployment so pods are recreated when they fail.'],
    ],
    faq: [
      ['Why would a pod have two containers?', 'For a tightly coupled helper ("sidecar"), such as a log shipper next to the app.'],
      ['How do I see why a pod is not running?', 'kubectl describe pod NAME shows events; kubectl logs NAME shows the app\'s output.'],
    ],
    recap: ['kubectl apply -f file.yaml creates objects.', 'get, describe and logs inspect them.', 'Bare pods are not recreated when deleted.'],
  },
  'k-deploy': {
    idea: 'A Deployment keeps a set number of identical pods running, replacing any that disappear, and scales with one command.',
    terms: ['deployment', 'pod', 'label'],
    mistakes: [
      ['Selector labels that do not match the template labels', 'They must match, or Kubernetes rejects the Deployment.'],
      ['Editing pods directly', 'Change the Deployment; it rolls the change out to its pods.'],
    ],
    faq: [
      ['What is a ReplicaSet?', 'The object a Deployment uses under the hood to keep the pod count; you rarely touch it yourself.'],
      ['Can it scale automatically?', 'Yes, a HorizontalPodAutoscaler can change replicas based on CPU or other metrics.'],
    ],
    recap: ['replicas: N keeps N pods running.', 'selector.matchLabels must match template labels.', 'kubectl scale deployment NAME --replicas=N.'],
  },
  'k-services': {
    idea: 'A Service gives a changing set of pods one stable address and spreads requests over every running pod its selector matches.',
    terms: ['service', 'label'],
    mistakes: [
      ['A selector that matches no pods', 'Check kubectl get endpoints: <none> means the labels do not match.'],
      ['targetPort different from the container port', 'targetPort must be the port the container listens on.'],
    ],
    faq: [
      ['How do pods find a Service?', 'By name through the cluster\'s DNS: http://portfolio from any pod in the same namespace.'],
      ['How do I expose a website to the internet?', 'A LoadBalancer Service, or an Ingress / Gateway in front of ClusterIP Services.'],
    ],
    recap: ['selector picks the pods; endpoints are the running matches.', 'port is the Service\'s port; targetPort is the container\'s.', 'ClusterIP inside, NodePort on every node, LoadBalancer outside.'],
  },
  'k-config': {
    idea: 'Keep settings in ConfigMaps and Secrets, not in the image, and tell Kubernetes how much CPU and memory each pod needs.',
    terms: ['configmap'],
    mistakes: [
      ['Putting passwords in a ConfigMap', 'Use a Secret, and limit who can read it.'],
      ['No resource requests', 'Without requests the scheduler cannot place pods sensibly; set at least CPU and memory requests.'],
    ],
    faq: [
      ['What does 100m CPU mean?', '100 millicores: one tenth of a CPU core.'],
      ['What happens when a container exceeds its memory limit?', 'It is killed (OOMKilled) and restarted.'],
    ],
    recap: ['ConfigMap for settings, Secret for credentials.', 'envFrom loads every key as an environment variable.', 'Requests decide placement; limits cap usage.'],
  },
  'k-rollout': {
    idea: 'Changing the image starts a rolling update that never drops below the desired pods; if the new version fails, old pods keep serving and you roll back.',
    terms: ['rollingupdate', 'deployment'],
    mistakes: [
      ['Using the :latest tag', 'Pin a version (shivam/portfolio:1.6) so you know what is running and can roll back.'],
      ['Deleting pods to "force" an update', 'Change the Deployment (set image or apply) and let it roll out.'],
    ],
    faq: [
      ['How do I see the history?', 'kubectl rollout history deployment/NAME lists revisions.'],
      ['What are readiness and liveness probes?', 'Readiness says when a pod may receive traffic; liveness restarts a hung container.'],
    ],
    recap: ['kubectl set image starts a rolling update.', 'ImagePullBackOff = bad image; CrashLoopBackOff = app crashes.', 'kubectl rollout undo goes back to the previous version.'],
  },
  'k-project': {
    idea: 'A real app is a few objects in one manifest: a ConfigMap for settings, a Deployment for the pods and a Service for traffic.',
    terms: ['kubectl', 'deployment', 'service', 'configmap'],
    mistakes: [
      ['Missing --- between documents', 'Separate each object in one file with a line containing ---.'],
      ['Forgetting to check after applying', 'Always run kubectl get pods and describe anything not Running.'],
    ],
    faq: [
      ['How do teams manage many manifests?', 'With Helm charts or Kustomize, kept in Git and applied by CI/CD or GitOps tools like Argo CD.'],
      ['Where should I practise next?', 'kind or minikube locally, then a free tier of a managed service (EKS, AKS, GKE).'],
    ],
    recap: ['ConfigMap + Deployment + Service = a running, reachable app.', 'apply, get, describe, logs, rollout are the daily commands.', 'Next: minikube, Helm, Ingress or Gateway API.'],
  },
};
