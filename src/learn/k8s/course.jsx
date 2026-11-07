import { B, Callout, Code, F, H, P, Term } from '../ui';
import { endpoints, kubectl, request, settle } from './sim';
import { ClusterLab, ContainersVsVms, K8sExercise } from './widgets';

// "Kubernetes": run and manage containers. A simulated 3-node cluster stands in for a real one:
// kubectl commands and YAML behave like the real thing for Pods, Deployments, Services and ConfigMaps.

const y = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '');

// Helpers for exercise checks: each returns true or a message.
const running = (c, app) => c.pods.filter((p) => p.labels.app === app && p.status === 'Running');
const k8s = (extra) => ({ kind: 'k8s', component: K8sExercise, ...extra });

const PORTFOLIO_DEPLOYMENT = y`
apiVersion: apps/v1
kind: Deployment
metadata:
  name: portfolio
spec:
  replicas: 3
  selector:
    matchLabels:
      app: portfolio
  template:
    metadata:
      labels:
        app: portfolio
    spec:
      containers:
        - name: web
          image: shivam/portfolio:1.5
          ports:
            - containerPort: 8080
`;

const modules = [
  { id: 'k8s-basics', title: 'Containers and pods', level: 'Beginner', blurb: 'Why containers, what Kubernetes does, and your first pod.' },
  { id: 'k8s-apps', title: 'Running apps', level: 'Intermediate', blurb: 'Deployments that heal themselves, Services that route traffic, configuration and resources.' },
  { id: 'k8s-ops', title: 'Operating apps', level: 'Intermediate', blurb: 'Zero-downtime updates, rollbacks and a complete deployment.' },
];

const lessons = [
  {
    id: 'k-intro',
    module: 'k8s-basics',
    title: 'Containers and why Kubernetes',
    minutes: 10,
    goals: ['Explain what a container and an image are', 'Know what problem Kubernetes solves', 'Name the parts of a cluster: control plane and nodes'],
    body: () => (
      <>
        <P>
          A <Term id="image">container image</Term> packages an app with everything it needs (libraries, settings) so it runs the same everywhere: your laptop, a test
          server, the cloud. A <Term id="container">container</Term> is a running copy of an image.
        </P>
        <ContainersVsVms />
        <H>Why Kubernetes?</H>
        <P>
          Running one container is easy. Running hundreds across many machines, restarting them when they crash, spreading load, and updating them without downtime is
          not. <Term id="kubernetes">Kubernetes</Term> (often <B>K8s</B>) does that for you: you describe what you want ("3 copies of my web app, reachable on port 80")
          and it keeps making it true.
        </P>
        <ul className="my-4 pl-5 list-disc text-muted space-y-1.5 marker:text-accent">
          <li>
            The <B>control plane</B> is the brain: it stores what you asked for and decides where things run.
          </li>
          <li>
            <Term id="node">Nodes</Term> are the machines (real or virtual) that run your containers.
          </li>
          <li>
            You talk to the cluster with the <Term id="kubectl">kubectl</Term> command or by applying YAML files.
          </li>
        </ul>
        <ClusterLab title="Meet the practice cluster" hint="This simulated cluster has three nodes. Run the suggested commands." suggestions={['kubectl get nodes', 'kubectl version', 'kubectl get pods', 'help']} />
        <Callout title="Version">
          The practice cluster reports Kubernetes v1.36, the current release line. The commands and YAML you learn here work the same on real clusters (minikube, kind,
          EKS, AKS, GKE).
        </Callout>
      </>
    ),
    quiz: [
      { q: 'What is the difference between an image and a container?', options: ['None', 'An image is the package; a container is a running copy of it', 'A container is bigger', 'Images run, containers do not'], answer: 1, why: 'Like a recipe (image) and a dish you cooked from it (container).' },
      { q: 'What do you give Kubernetes?', options: ['Step-by-step commands for every restart', 'A description of the state you want; it keeps making it true', 'Server passwords', 'A list of IP addresses'], answer: 1, why: 'Kubernetes is declarative: it reconciles reality with your description.' },
    ],
  },
  {
    id: 'k-pods',
    module: 'k8s-basics',
    title: 'Pods',
    minutes: 12,
    goals: ['Write a Pod manifest in YAML', 'Apply it, list it, describe it and read its logs', 'See why bare pods are not enough on their own'],
    body: () => (
      <>
        <P>
          A <Term id="pod">pod</Term> is the smallest thing Kubernetes runs: one (occasionally a few) containers with a shared network address. You describe it in YAML
          with four top-level keys you will see in every manifest: <F>apiVersion</F>, <F>kind</F>, <F>metadata</F> and <F>spec</F>.
        </P>
        <ClusterLab
          title="Create a pod"
          hint='Press "kubectl apply -f manifest.yaml", then list and describe the pod. Then delete it and list again: what happens?'
          yaml={y`
apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    app: web          # labels are how other objects find this pod
spec:
  containers:
    - name: nginx
      image: nginx:1.27
      ports:
        - containerPort: 80
`}
          suggestions={['kubectl apply -f manifest.yaml', 'kubectl get pods', 'kubectl describe pod web', 'kubectl logs web', 'kubectl delete pod web']}
        />
        <Callout tone="warn" title="YAML is picky about spaces">
          Indentation is meaning in YAML: use spaces (never tabs), keep children 2 spaces further in, and start list items with <F>- </F>. Most beginner errors are a
          misplaced space.
        </Callout>
        <P>
          Deleting the pod removed it for good: nothing was watching over it. That is why real apps are almost never run as bare pods, but through a{' '}
          <B>Deployment</B> (next lesson).
        </P>
      </>
    ),
    exercises: [
      {
        id: 'k-pod',
        title: 'Your first pod',
        prompt: 'Write a Pod named cache running the image redis:7 (container name redis) with the label app: cache.',
        ...k8s({
          starter: y`
apiVersion: v1
kind: Pod
metadata:
  name: change-me
spec:
  containers: []
`,
          checks: [
            { name: 'A pod called cache is Running', test: (c) => c.pods.some((p) => p.name === 'cache' && p.status === 'Running') || `pods: ${c.pods.map((p) => `${p.name} (${p.status})`).join(', ') || 'none'}` },
            { name: 'It runs redis:7', test: (c) => c.pods.find((p) => p.name === 'cache')?.image === 'redis:7' || 'the image should be redis:7' },
            { name: 'It has the label app: cache', test: (c) => c.pods.find((p) => p.name === 'cache')?.labels.app === 'cache' || 'add metadata.labels.app: cache' },
          ],
          hint: 'Change the name to cache, add labels: {app: cache} under metadata, and under containers add "- name: redis" with "image: redis:7".',
          solution: y`
apiVersion: v1
kind: Pod
metadata:
  name: cache
  labels:
    app: cache
spec:
  containers:
    - name: redis
      image: redis:7
`,
        }),
      },
    ],
    quiz: [
      { q: 'Which four keys appear at the top of every manifest?', options: ['name, image, port, replicas', 'apiVersion, kind, metadata, spec', 'pod, node, service, cluster', 'from, run, cmd, expose'], answer: 1, why: 'They say what kind of object it is and describe it.' },
      { q: 'You delete a bare pod. What happens?', options: ['Kubernetes recreates it', 'It is gone; nothing recreates it', 'It moves to another node', 'It restarts'], answer: 1, why: 'Only controllers such as Deployments recreate pods.' },
    ],
  },
  {
    id: 'k-deploy',
    module: 'k8s-apps',
    title: 'Deployments and self-healing',
    minutes: 14,
    goals: ['Run several replicas with a Deployment', 'Watch Kubernetes replace a deleted pod', 'Scale up and down with one command'],
    body: () => (
      <>
        <P>
          A <Term id="deployment">Deployment</Term> says "keep N copies of this pod running". Its <F>selector</F> finds its pods by label, and its <F>template</F> is the
          pod it stamps out. If a pod dies, or a whole node does, the Deployment makes a new one.
        </P>
        <ClusterLab
          title="Self-healing in action"
          hint="Apply the Deployment and watch three pods appear. Delete one (copy a name from kubectl get pods) and watch it come back. Then scale to 5."
          yaml={PORTFOLIO_DEPLOYMENT}
          suggestions={['kubectl apply -f manifest.yaml', 'kubectl get deployments', 'kubectl get pods -o wide', 'kubectl scale deployment portfolio --replicas=5', 'kubectl scale deployment portfolio --replicas=2']}
        />
        <Callout tone="warn" title="Selector and labels must match">
          <F>spec.selector.matchLabels</F> must match <F>spec.template.metadata.labels</F>, otherwise Kubernetes refuses the Deployment: it would never find its own pods.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'k-deployment',
        title: 'A self-healing deployment',
        prompt: 'Write a Deployment named reports with 2 replicas of python:3.13 (container name app), using the label app: reports for both the selector and the pod template.',
        ...k8s({
          starter: y`
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reports
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ???
  template:
    metadata:
      labels:
        app: ???
    spec:
      containers:
        - name: app
          image: python:3.13
`,
          checks: [
            { name: 'Deployment reports wants 2 replicas', test: (c) => c.deployments.reports?.replicas === 2 || `replicas is ${c.deployments.reports?.replicas}` },
            { name: '2 reports pods are Running', test: (c) => running(c, 'reports').length === 2 || `${running(c, 'reports').length} running` },
            { name: 'Deleting a pod brings a new one', test: (c) => {
              const victim = running(c, 'reports')[0];
              if (!victim) return 'no running pod to delete';
              kubectl(c, `kubectl delete pod ${victim.name}`);
              settle(c, 10);
              return running(c, 'reports').length === 2 || `${running(c, 'reports').length} running after deleting one`;
            } },
          ],
          hint: 'Set replicas: 2 and replace both ??? with reports.',
          solution: y`
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reports
spec:
  replicas: 2
  selector:
    matchLabels:
      app: reports
  template:
    metadata:
      labels:
        app: reports
    spec:
      containers:
        - name: app
          image: python:3.13
`,
        }),
      },
      {
        id: 'k-heal',
        title: 'Break it and watch it heal',
        prompt: 'The cluster already runs the portfolio Deployment (3 replicas). Use kubectl to scale it to 4 replicas, then delete one of its pods. Kubernetes should bring it back to 4. Then press "Check the cluster".',
        ...k8s({
          mode: 'commands',
          setup: PORTFOLIO_DEPLOYMENT,
          suggestions: ['kubectl get pods', 'kubectl scale deployment portfolio --replicas=4'],
          checks: [
            { name: 'The deployment wants 4 replicas', test: (c) => c.deployments.portfolio?.replicas === 4 || `replicas is ${c.deployments.portfolio?.replicas}` },
            { name: '4 portfolio pods are Running', test: (c) => running(c, 'portfolio').length === 4 || `${running(c, 'portfolio').length} running` },
            { name: 'You deleted a pod and it was replaced', test: (c) => c.events.some((e) => /pod\/portfolio-\S+ deleted/.test(e)) || 'delete one pod with kubectl delete pod NAME' },
          ],
          hint: 'kubectl scale deployment portfolio --replicas=4, then kubectl get pods, then kubectl delete pod <one of the names>.',
        }),
      },
    ],
    quiz: [
      { q: 'What does a Deployment\'s replicas field do?', options: ['Sets CPU', 'Keeps that many identical pods running at all times', 'Copies the image', 'Names the pods'], answer: 1, why: 'The Deployment constantly reconciles the running count to replicas.' },
      { q: 'A node with two of your pods dies. With a Deployment…', options: ['Your app is down until you fix the node', 'Replacement pods are scheduled on the healthy nodes', 'Nothing changes', 'The Deployment is deleted'], answer: 1, why: 'Self-healing works for crashed pods and lost nodes alike.' },
    ],
  },
  {
    id: 'k-services',
    module: 'k8s-apps',
    title: 'Services and networking',
    minutes: 14,
    goals: ['Give a set of pods one stable address with a Service', 'Understand selectors, ports and targetPort', 'Know ClusterIP, NodePort and LoadBalancer'],
    body: () => (
      <>
        <P>
          Pods come and go, and each new one gets a new IP address. A <Term id="service">Service</Term> gives them one stable name and address and spreads requests over
          every Running pod whose labels match its <F>selector</F>.
        </P>
        <ClusterLab
          title="Route traffic with a Service"
          hint='Apply, then press "Send a request" a few times: different pods answer. Then try kubectl get endpoints.'
          yaml={`${PORTFOLIO_DEPLOYMENT}---
apiVersion: v1
kind: Service
metadata:
  name: portfolio
spec:
  type: NodePort
  selector:
    app: portfolio      # every Running pod with this label
  ports:
    - port: 80          # the Service's port
      targetPort: 8080  # the container's port
      nodePort: 30080   # reachable on every node at this port
`}
          suggestions={['kubectl apply -f manifest.yaml', 'kubectl get services', 'kubectl get endpoints', 'kubectl describe service portfolio']}
        />
        <ul className="my-4 pl-5 list-disc text-muted space-y-1.5 marker:text-accent">
          <li>
            <B>ClusterIP</B> (default): reachable only inside the cluster, for internal services.
          </li>
          <li>
            <B>NodePort</B>: also opens a port (30000–32767) on every node.
          </li>
          <li>
            <B>LoadBalancer</B>: asks the cloud for an external load balancer with a public address.
          </li>
        </ul>
      </>
    ),
    exercises: [
      {
        id: 'k-service',
        title: 'Expose the portfolio',
        prompt:
          'The portfolio Deployment is already running (containers listen on 8080). Write a NodePort Service named web that selects app: portfolio, listens on port 80, forwards to targetPort 8080, and uses nodePort 30080.',
        ...k8s({
          setup: PORTFOLIO_DEPLOYMENT,
          starter: y`
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: ClusterIP
  selector:
    app: wrong-label
  ports:
    - port: 80
`,
          checks: [
            { name: 'Service web is a NodePort on 30080', test: (c) => (c.services.web?.type === 'NodePort' && c.services.web.nodePort === 30080) || `type ${c.services.web?.type}, nodePort ${c.services.web?.nodePort}` },
            { name: 'It finds the 3 portfolio pods', test: (c) => (c.services.web && endpoints(c, c.services.web).length === 3) || `endpoints: ${c.services.web ? endpoints(c, c.services.web).length : 0}` },
            { name: 'A request reaches a pod', test: (c) => {
              const r = request(c, 'web');
              return r.pod ? true : r.error;
            } },
          ],
          hint: 'type: NodePort, selector app: portfolio, and under the port: targetPort: 8080 and nodePort: 30080.',
          solution: y`
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: NodePort
  selector:
    app: portfolio
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080
`,
        }),
      },
    ],
    quiz: [
      { q: 'How does a Service know which pods to send traffic to?', options: ['By pod name', 'By its label selector', 'By node', 'By image'], answer: 1, why: 'Any Running pod whose labels match the selector becomes an endpoint.' },
      { q: 'port: 80, targetPort: 8080 means…', options: ['The Service listens on 8080', 'Clients use port 80; the Service forwards to port 8080 in the container', 'Two Services', 'Nothing'], answer: 1, why: 'targetPort must match what the container listens on.' },
    ],
  },
  {
    id: 'k-config',
    module: 'k8s-apps',
    title: 'Configuration and resources',
    minutes: 12,
    goals: ['Keep settings out of the image with ConfigMaps and Secrets', 'Pass them to containers as environment variables', 'Set CPU and memory requests and limits'],
    body: () => (
      <>
        <P>
          Build the image once and configure it per environment. A <Term id="configmap">ConfigMap</Term> holds settings; a <B>Secret</B> holds passwords and keys (base64
          encoded, and access-controlled). Containers read them as environment variables.
        </P>
        <Code file="deployment with config and resources">{`
spec:
  containers:
    - name: web
      image: shivam/portfolio:1.6
      envFrom:
        - configMapRef:
            name: portfolio-config     # every key becomes an env variable
      resources:
        requests:                      # what the scheduler reserves
          cpu: 100m                    # 0.1 of a CPU core
          memory: 128Mi
        limits:                        # the most it may use
          memory: 256Mi`}</Code>
        <ClusterLab
          title="Requests decide where pods fit"
          hint="Each node here has 1000m of CPU. Apply this Deployment: its pods ask for 600m each. How many can run? Look at kubectl get nodes and the Pending pod."
          yaml={y`
apiVersion: apps/v1
kind: Deployment
metadata:
  name: heavy
spec:
  replicas: 4
  selector:
    matchLabels:
      app: heavy
  template:
    metadata:
      labels:
        app: heavy
    spec:
      containers:
        - name: worker
          image: python:3.13
          resources:
            requests:
              cpu: 600m
`}
          suggestions={['kubectl apply -f manifest.yaml', 'kubectl get pods -o wide', 'kubectl get nodes', 'kubectl scale deployment heavy --replicas=3']}
        />
        <Callout title="Requests vs limits">
          <B>Requests</B> are what the scheduler reserves, so pods only land where they fit; too large and they stay <F>Pending</F>. <B>Limits</B> cap usage: a container over
          its memory limit is killed and restarted.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'k-configmap',
        title: 'Configure without rebuilding',
        prompt:
          'Add a ConfigMap named portfolio-config with PORTFOLIO_MODE: "production", then a Deployment named portfolio (2 replicas, image shivam/portfolio:1.6, container web) that loads it with envFrom and requests cpu 100m and memory 128Mi. Separate the two documents with ---.',
        ...k8s({
          starter: y`
apiVersion: v1
kind: ConfigMap
metadata:
  name: portfolio-config
data: {}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: portfolio
spec:
  replicas: 2
  selector:
    matchLabels:
      app: portfolio
  template:
    metadata:
      labels:
        app: portfolio
    spec:
      containers:
        - name: web
          image: shivam/portfolio:1.6
`,
          checks: [
            { name: 'ConfigMap has PORTFOLIO_MODE=production', test: (c) => c.configmaps['portfolio-config']?.data?.PORTFOLIO_MODE === 'production' || 'add data: PORTFOLIO_MODE: "production"' },
            { name: 'Pods load the ConfigMap with envFrom', test: (c) => c.deployments.portfolio?.template.envFrom.includes('portfolio-config') || 'add envFrom: - configMapRef: name: portfolio-config' },
            { name: 'Requests: cpu 100m, memory 128Mi', test: (c) => (c.deployments.portfolio?.template.cpu === 100 && c.deployments.portfolio.template.memory === '128Mi') || `cpu ${c.deployments.portfolio?.template.cpu}m, memory ${c.deployments.portfolio?.template.memory}` },
            { name: '2 pods Running', test: (c) => running(c, 'portfolio').length === 2 || `${running(c, 'portfolio').length} running` },
          ],
          hint: 'Under data add PORTFOLIO_MODE: "production". Under the container add envFrom with a configMapRef named portfolio-config, and resources.requests with cpu: 100m and memory: 128Mi.',
          solution: y`
apiVersion: v1
kind: ConfigMap
metadata:
  name: portfolio-config
data:
  PORTFOLIO_MODE: "production"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: portfolio
spec:
  replicas: 2
  selector:
    matchLabels:
      app: portfolio
  template:
    metadata:
      labels:
        app: portfolio
    spec:
      containers:
        - name: web
          image: shivam/portfolio:1.6
          envFrom:
            - configMapRef:
                name: portfolio-config
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
`,
        }),
      },
    ],
    quiz: [
      { q: 'Why use a ConfigMap instead of baking settings into the image?', options: ['Images cannot hold settings', 'One image can run in test and production with different settings, without rebuilding', 'It is faster', 'For security of passwords'], answer: 1, why: 'Configuration varies by environment; the image should not.' },
      { q: 'A pod is Pending with "Insufficient cpu". The fix is…', options: ['Restart the pod', 'Lower its CPU request or add capacity (nodes)', 'Change the image', 'Delete the Service'], answer: 1, why: 'The scheduler cannot find a node with enough unreserved CPU.' },
    ],
  },
  {
    id: 'k-rollout',
    module: 'k8s-ops',
    title: 'Rolling updates and rollbacks',
    minutes: 14,
    goals: ['Update an app with zero downtime', 'Recognise ImagePullBackOff and CrashLoopBackOff', 'Roll back with one command'],
    body: () => (
      <>
        <P>
          Change a Deployment's image and Kubernetes performs a <Term id="rollingupdate">rolling update</Term>: start a new pod, wait until it is Running, retire an old
          one, repeat. Users never see the app go down. If the new version is broken, the old pods keep serving and you roll back.
        </P>
        <ClusterLab
          title="Update, break, roll back"
          hint="1) Update to 1.6 and watch pods replace one by one. 2) Set a typo image (1.7) and see ImagePullBackOff while the old pods keep serving. 3) Roll back."
          setup={PORTFOLIO_DEPLOYMENT}
          suggestions={[
            'kubectl set image deployment/portfolio web=shivam/portfolio:1.6',
            'kubectl rollout status deployment/portfolio',
            'kubectl set image deployment/portfolio web=shivam/portfolio:1.7',
            'kubectl rollout undo deployment/portfolio',
            'kubectl rollout history deployment/portfolio',
            'kubectl get pods',
          ]}
        />
        <ul className="my-4 pl-5 list-disc text-muted space-y-1.5 marker:text-accent">
          <li>
            <B>ImagePullBackOff</B>: the image name or tag does not exist (or the registry needs credentials).
          </li>
          <li>
            <B>CrashLoopBackOff</B>: the container starts and keeps crashing; read <F>kubectl logs POD</F>.
          </li>
          <li>
            <B>Pending</B>: no node has room (resources) or the pod cannot be scheduled.
          </li>
        </ul>
        <Callout title="Probes">
          Real apps add a <B>readinessProbe</B> (only send traffic when the app answers) and a <B>livenessProbe</B> (restart it if it hangs), so a rollout waits for pods that
          are truly ready, not just started.
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'k-ship',
        title: 'Ship version 1.6, recover from a bad release',
        prompt:
          'The portfolio runs version 1.5. Release shivam/portfolio:broken first, read the logs of a crashing pod, roll back, then release shivam/portfolio:1.6. Finish with all 3 pods Running 1.6.',
        ...k8s({
          mode: 'commands',
          setup: PORTFOLIO_DEPLOYMENT,
          suggestions: ['kubectl set image deployment/portfolio web=shivam/portfolio:broken', 'kubectl get pods', 'kubectl rollout undo deployment/portfolio', 'kubectl rollout status deployment/portfolio'],
          checks: [
            { name: 'You released the broken image', test: (c) => c.events.some((e) => e.includes('(shivam/portfolio:broken)')) || 'run kubectl set image … web=shivam/portfolio:broken first' },
            { name: 'You rolled back', test: (c) => c.events.some((e) => e.includes('rolled back')) || 'use kubectl rollout undo deployment/portfolio' },
            { name: '3 pods Running shivam/portfolio:1.6, none left on other versions', test: (c) => {
              const r = running(c, 'portfolio');
              const others = c.pods.filter((p) => p.labels.app === 'portfolio' && p.image !== 'shivam/portfolio:1.6' && p.status !== 'Terminating');
              return (r.length === 3 && r.every((p) => p.image === 'shivam/portfolio:1.6') && !others.length) || `${r.filter((p) => p.image === 'shivam/portfolio:1.6').length} running 1.6; ${others.length} on other versions`;
            } },
          ],
          hint: 'kubectl set image deployment/portfolio web=shivam/portfolio:broken → kubectl logs <crashing pod> → kubectl rollout undo deployment/portfolio → kubectl set image deployment/portfolio web=shivam/portfolio:1.6',
        }),
      },
    ],
    quiz: [
      { q: 'During a rolling update with a broken new image, users…', options: ['See errors immediately', 'Keep being served by the old pods while the new ones fail', 'Lose all traffic', 'Are redirected'], answer: 1, why: 'Old pods are only removed once new ones are Running.' },
      { q: 'A pod shows CrashLoopBackOff. First step?', options: ['Delete the cluster', 'Read kubectl logs for the pod', 'Scale to zero', 'Change the Service'], answer: 1, why: 'The logs usually say why the app exits.' },
    ],
  },
  {
    id: 'k-project',
    module: 'k8s-ops',
    title: 'Project: deploy the portfolio',
    minutes: 18,
    goals: ['Write a complete manifest: ConfigMap, Deployment and Service', 'Use the kubectl commands you need every day', 'Know where to go next with real clusters'],
    body: () => (
      <>
        <P>Everything together. Here are the commands you will use daily on any cluster:</P>
        <Code file="kubectl cheat sheet">{`
kubectl get pods -o wide              # what is running, where
kubectl describe pod NAME             # why is it not running? (events at the bottom)
kubectl logs NAME                     # what did the app say?
kubectl apply -f manifest.yaml        # create or update from YAML
kubectl scale deployment NAME --replicas=5
kubectl set image deployment/NAME CONTAINER=IMAGE
kubectl rollout status|undo deployment/NAME
kubectl delete -f manifest.yaml       # remove what the file created`}</Code>
        <Callout title="Where next">
          Run a real cluster on your laptop with <B>minikube</B> or <B>kind</B>, package apps with <B>Helm</B>, and expose them to the internet with an <B>Ingress</B> or the
          newer <B>Gateway API</B>. Managed clusters are EKS (AWS), AKS (Azure) and GKE (Google).
        </Callout>
      </>
    ),
    exercises: [
      {
        id: 'k-full',
        title: 'The full portfolio stack',
        prompt:
          'In one manifest: a ConfigMap portfolio-config (PORTFOLIO_MODE: "production"); a Deployment portfolio with 3 replicas of shivam/portfolio:1.6 (container web, port 8080) using the ConfigMap via envFrom and requesting cpu 200m; and a NodePort Service portfolio on port 80 → 8080, nodePort 30080. Then the portfolio should answer requests.',
        ...k8s({
          starter: y`
# ConfigMap, then ---, then Deployment, then ---, then Service
`,
          checks: [
            { name: 'ConfigMap portfolio-config with PORTFOLIO_MODE=production', test: (c) => c.configmaps['portfolio-config']?.data?.PORTFOLIO_MODE === 'production' || 'missing or wrong ConfigMap' },
            { name: '3 pods Running shivam/portfolio:1.6', test: (c) => (running(c, 'portfolio').length === 3 && running(c, 'portfolio').every((p) => p.image === 'shivam/portfolio:1.6')) || `${running(c, 'portfolio').length} running` },
            { name: 'Pods use envFrom and request cpu 200m', test: (c) => (c.deployments.portfolio?.template.envFrom.includes('portfolio-config') && c.deployments.portfolio.template.cpu === 200) || 'check envFrom and resources.requests.cpu: 200m' },
            { name: 'NodePort Service on 80 → 8080, nodePort 30080', test: (c) => {
              const s = c.services.portfolio;
              return (s && s.type === 'NodePort' && s.port === 80 && Number(s.targetPort) === 8080 && s.nodePort === 30080) || `service: ${s ? `${s.type} ${s.port}→${s.targetPort} node ${s.nodePort}` : 'missing'}`;
            } },
            { name: 'Requests reach the app', test: (c) => {
              const r = request(c, 'portfolio');
              return r.pod ? true : r.error;
            } },
          ],
          hint: 'Copy the pieces from the earlier lessons: the ConfigMap from "Configuration and resources", the Deployment from "Deployments", the Service from "Services". Remember containerPort: 8080 and targetPort: 8080.',
          solution: y`
apiVersion: v1
kind: ConfigMap
metadata:
  name: portfolio-config
data:
  PORTFOLIO_MODE: "production"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: portfolio
spec:
  replicas: 3
  selector:
    matchLabels:
      app: portfolio
  template:
    metadata:
      labels:
        app: portfolio
    spec:
      containers:
        - name: web
          image: shivam/portfolio:1.6
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef:
                name: portfolio-config
          resources:
            requests:
              cpu: 200m
---
apiVersion: v1
kind: Service
metadata:
  name: portfolio
spec:
  type: NodePort
  selector:
    app: portfolio
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080
`,
        }),
      },
    ],
    quiz: [
      { q: 'A pod will not start. Which command shows the events explaining why?', options: ['kubectl get nodes', 'kubectl describe pod NAME', 'kubectl version', 'kubectl apply'], answer: 1, why: 'describe lists the pod\'s recent events, such as image pull errors or scheduling failures.' },
      { q: 'How do you remove everything a manifest created?', options: ['Delete the nodes', 'kubectl delete -f manifest.yaml', 'kubectl scale to 0', 'Restart kubectl'], answer: 1, why: 'delete -f removes the objects described in the file.' },
    ],
  },
];

export const k8sCourse = {
  id: 'k8s',
  title: 'Kubernetes',
  tagline: 'Run apps in containers that scale, heal and update themselves',
  blurb:
    'Containers and pods, Deployments that heal themselves, Services, configuration and resources, zero-downtime rollouts and rollbacks. Practise real kubectl commands and YAML on a simulated 3-node cluster you can watch.',
  levels: 'Beginner → Intermediate',
  icon: 'k8s',
  modules,
  lessons,
};
