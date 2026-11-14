// Step-by-step material for the Kubernetes lessons: same shape as python-steps.js (terms, process, steps), plus
// `practice(key)`, the practice cluster the steps are done in.
// It is attached to the lessons in content/ (see withGuide), so each course loads only its own practice tool.
// scripts/check-steps.mjs replays the steps: each command is run against the cluster simulator, and `expect` lists text the last command must print.
import { ClusterLab } from '../k8s/widgets';

const POD_YAML = `apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    app: web
spec:
  containers:
    - name: nginx
      image: nginx:1.27
`;
const DEPLOY_YAML = `apiVersion: apps/v1
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
const CONFIG_YAML = `apiVersion: v1
kind: ConfigMap
metadata:
  name: portfolio-config
data:
  PORTFOLIO_MODE: production
`;
const clusterBox = (props = {}) => (key) => <ClusterLab key={key} title="Practice cluster" hint="Type each command from the steps below in the box at the bottom, then press Enter." {...props} />;
const TYPE = 'In the practice cluster above these steps, type this command and press Enter.';

export const k8sSteps = {
  'k-intro': {
    terms: ['container', 'image', 'kubernetes', 'cluster', 'node', 'kubectl'],
    process: {
      title: 'How Kubernetes runs an app',
      stages: [
        ['The app is packed into an image', 'The image holds the app and everything it needs to run.'],
        ['You tell Kubernetes what you want', '"Run three copies of this image." You describe the result, not the steps.'],
        ['The control plane decides where', 'It picks nodes (machines) with room to spare.'],
        ['Each node starts containers', 'A container is a running copy of the image.'],
        ['Kubernetes keeps watching', 'If a container or a node fails, it starts replacements until the picture matches what you asked for.'],
      ],
    },
    practice: clusterBox(),
    steps: [
      { do: TYPE, code: 'kubectl get nodes', see: 'Three machines: node-1, node-2 and node-3, each with the status Ready.', expect: ['node-1', 'node-3', 'Ready'] },
      { do: 'Ask what is running. ' + TYPE, code: 'kubectl get pods', see: 'No resources found in default namespace. The cluster is empty.', expect: ['No resources found'] },
      { do: 'Ask for the version. ' + TYPE, code: 'kubectl version', see: 'The client and server versions of Kubernetes.', expect: ['ersion'] },
      { do: 'Make a typing mistake on purpose. ' + TYPE, code: 'kubectl get nods', see: 'An error: the server doesn\'t have a resource type "nods". kubectl names what it did not understand.', error: true },
      { do: 'List every command this practice cluster understands. ' + TYPE, code: 'help', see: 'A list of the commands used in this course: get, describe, apply, create, scale and more.', expect: ['kubectl get pods'] },
    ],
  },
  'k-pods': {
    terms: ['pod', 'container', 'manifest', 'kubectl', 'label'],
    process: {
      title: 'What happens when you apply a Pod manifest',
      stages: [
        ['You describe the pod in YAML', 'Its name, its labels and which image to run. This file is the manifest.'],
        ['kubectl apply sends it to the cluster', 'The control plane stores it as the state you want.'],
        ['The scheduler picks a node', 'The pod shows as Pending until a node is chosen.'],
        ['The node pulls the image and starts the container', 'The pod shows as ContainerCreating.'],
        ['The pod is Running', 'READY 1/1 means its one container is up.'],
      ],
    },
    practice: clusterBox({ yaml: POD_YAML }),
    steps: [
      { do: 'The practice cluster above these steps has a YAML editor holding a Pod manifest. Read it: the pod is named web and runs the image nginx:1.27. Then type this command and press Enter.', code: 'kubectl apply -f manifest.yaml', see: 'pod/web created', expect: ['pod/web created'] },
      { do: 'List the pods. ' + TYPE, code: 'kubectl get pods', see: 'One pod called web. Within a few seconds its STATUS becomes Running and READY shows 1/1 (run the command again if it still says ContainerCreating).', expect: ['web', 'Running'] },
      { do: 'Look at the pod in detail. ' + TYPE, code: 'kubectl describe pod web', see: 'The pod\'s node, its labels (app=web), its image (nginx:1.27) and its status.', expect: ['nginx:1.27'] },
      { do: 'Read what the container printed. ' + TYPE, code: 'kubectl logs web', see: 'The start-up lines of the web server.', expect: [] },
      { do: 'Delete the pod, then list again.', code: 'kubectl delete pod web\nkubectl get pods', see: 'pod "web" deleted, and then no pods at all. Nothing brought it back, which is why real apps use a Deployment (next lesson).', expect: ['No resources found'] },
    ],
  },
  'k-deploy': {
    terms: ['deployment', 'replica', 'pod', 'label', 'kubectl'],
    process: {
      title: 'How a Deployment heals itself',
      stages: [
        ['You state how many copies you want', 'replicas: 3'],
        ['The Deployment counts the pods carrying its label', 'It finds them by the label app: portfolio.'],
        ['Too few: it starts more', 'New pods are created from the template in the manifest.'],
        ['Too many: it removes some', 'Until the count matches.'],
        ['It never stops checking', 'Delete a pod and the count drops to 2, so a new one is started at once.'],
      ],
    },
    practice: clusterBox({ yaml: DEPLOY_YAML }),
    steps: [
      { do: 'The YAML editor in the practice cluster above these steps holds a Deployment asking for 3 replicas. Type this command and press Enter.', code: 'kubectl apply -f manifest.yaml', see: 'deployment.apps/portfolio created', expect: ['deployment.apps/portfolio created'] },
      { do: 'List the pods. ' + TYPE, code: 'kubectl get pods', see: 'Three pods whose names start with portfolio-, all Running after a few seconds.', expect: ['portfolio-', 'Running'] },
      { do: 'Check the Deployment itself. ' + TYPE, code: 'kubectl get deployments', see: 'portfolio with READY 3/3.', expect: ['3/3'] },
      { do: 'Scale up with one command. ' + TYPE, code: 'kubectl scale deployment portfolio --replicas=5', see: 'deployment.apps/portfolio scaled. Run kubectl get pods again to see five pods.', expect: ['scaled'] },
      { do: 'Scale back down, then check. Type these two commands, one after the other.', code: 'kubectl scale deployment portfolio --replicas=2\nkubectl get deployments', see: 'portfolio with READY 2/2: three pods were removed.', expect: ['2/2'] },
    ],
  },
  'k-services': {
    terms: ['service', 'label', 'selector', 'pod', 'deployment'],
    process: {
      title: 'How a request reaches a pod through a Service',
      stages: [
        ['Pods come and go', 'Each new pod gets a new address, so nothing can rely on a pod\'s own address.'],
        ['A Service has one stable address', 'It never changes while the Service exists.'],
        ['The Service finds pods by label', 'Its selector (app: portfolio) matches every Running pod carrying that label.'],
        ['A request arrives at the Service', 'It picks one of the matching pods.'],
        ['The request is passed on', 'From the Service\'s port to the pod\'s targetPort. Replace every pod and the Service still works.'],
      ],
    },
    practice: clusterBox({ setup: DEPLOY_YAML }),
    steps: [
      { do: 'The practice cluster above these steps already runs the portfolio Deployment. Check it. ' + TYPE, code: 'kubectl get pods', see: 'Three portfolio pods, all Running.', expect: ['portfolio-', 'Running'] },
      { do: 'Give those pods one stable address. ' + TYPE, code: 'kubectl expose deployment portfolio --port=80 --target-port=8080', see: 'service/portfolio created', expect: ['service/portfolio created'] },
      { do: 'List the Services. ' + TYPE, code: 'kubectl get services', see: 'A portfolio Service of type ClusterIP with its own address and port 80.', expect: ['portfolio', 'ClusterIP', '80'] },
      { do: 'See which pods stand behind it. ' + TYPE, code: 'kubectl get endpoints', see: 'The portfolio Service listed with three pod addresses.', expect: ['portfolio'] },
      { do: 'Look at the Service in detail. ' + TYPE, code: 'kubectl describe service portfolio', see: 'Its selector, app=portfolio, which is how it finds its pods.', expect: ['app=portfolio'] },
    ],
  },
  'k-config': {
    terms: ['configmap', 'pod', 'deployment', 'manifest', 'image'],
    process: {
      title: 'How a setting reaches a container',
      stages: [
        ['Settings live outside the image', 'A ConfigMap holds names and values, such as PORTFOLIO_MODE: production.'],
        ['The pod template points at it', 'The manifest says: take this value from that ConfigMap.'],
        ['The container starts with it', 'Kubernetes passes the value in as an environment variable.'],
        ['The app reads the variable', 'The same image now behaves differently in test and production.'],
        ['A missing ConfigMap stops the pod', 'It waits with an error status until the ConfigMap exists.'],
      ],
    },
    practice: clusterBox({ yaml: CONFIG_YAML }),
    steps: [
      { do: 'The YAML editor in the practice cluster above these steps holds a ConfigMap with one setting. Type this command and press Enter.', code: 'kubectl apply -f manifest.yaml', see: 'configmap/portfolio-config created', expect: ['configmap/portfolio-config created'] },
      { do: 'List the ConfigMaps. ' + TYPE, code: 'kubectl get configmaps', see: 'portfolio-config, holding 1 item.', expect: ['portfolio-config'] },
      { do: 'In the YAML editor, add a second setting on a new last line, lined up exactly under PORTFOLIO_MODE (two spaces in front): LOG_LEVEL: info. Then apply again.', code: 'kubectl apply -f manifest.yaml', yaml: CONFIG_YAML + '  LOG_LEVEL: info\n', see: 'configmap/portfolio-config configured: the existing ConfigMap was updated, not created again.', expect: ['configured'] },
      { do: 'Check the count. ' + TYPE, code: 'kubectl get configmaps', see: 'portfolio-config now holds 2 items.', expect: ['portfolio-config', '2'] },
    ],
  },
  'k-rollout': {
    terms: ['rollingupdate', 'deployment', 'image', 'pod', 'rollback'],
    process: {
      title: 'How a rolling update replaces pods',
      stages: [
        ['You change the image', 'From shivam/portfolio:1.5 to 1.6.'],
        ['One new pod is started', 'The old pods keep serving visitors.'],
        ['When it is Running, one old pod is removed', 'There is always at least the usual number ready.'],
        ['Repeat, one at a time', 'Until every pod runs the new image.'],
        ['A bad image stalls safely', 'The new pod never becomes Running, so the old ones are kept. You undo with one command.'],
      ],
    },
    practice: clusterBox({ setup: DEPLOY_YAML }),
    steps: [
      { do: 'The practice cluster above these steps already runs the portfolio Deployment on image 1.5. Update it to 1.6. ' + TYPE, code: 'kubectl set image deployment/portfolio web=shivam/portfolio:1.6', see: 'deployment.apps/portfolio image updated', expect: ['image updated'] },
      { do: 'Watch the result. ' + TYPE, code: 'kubectl rollout status deployment/portfolio', see: 'deployment "portfolio" successfully rolled out (run it again if it is still waiting).', expect: ['successfully rolled out'] },
      { do: 'See the history of versions. ' + TYPE, code: 'kubectl rollout history deployment/portfolio', see: 'Two revisions: shivam/portfolio:1.5, then shivam/portfolio:1.6.', expect: ['1.5', '1.6'] },
      { do: 'Roll out an image that does not exist. Type these two commands, one after the other.', code: 'kubectl set image deployment/portfolio web=shivam/portfolio:9.9\nkubectl get pods', see: 'The 1.6 pods are still Running, and one new pod is stuck with the status ImagePullBackOff: the image could not be downloaded.', expect: ['ImagePullBackOff', 'Running'] },
      { do: 'Undo it. Type these two commands, one after the other.', code: 'kubectl rollout undo deployment/portfolio\nkubectl rollout status deployment/portfolio', see: 'deployment "portfolio" successfully rolled out: the app is back on 1.6 and the broken pod is gone.', expect: ['successfully rolled out'] },
    ],
  },
  'k-project': {
    terms: ['manifest', 'configmap', 'deployment', 'service', 'kubectl'],
    process: {
      title: 'How to deploy a complete app',
      stages: [
        ['Settings first', 'Apply the ConfigMap, so pods can find it when they start.'],
        ['Then the app', 'Apply the Deployment: the image, how many replicas, and the labels.'],
        ['Then the address', 'A Service whose selector matches the pods\' label.'],
        ['Check each layer', 'get pods, get deployments, get services, get endpoints.'],
        ['Change it by editing and applying again', 'The manifest stays the single description of what should be running.'],
      ],
    },
    practice: clusterBox({ yaml: CONFIG_YAML + '---\n' + DEPLOY_YAML }),
    steps: [
      { do: 'The YAML editor in the practice cluster above these steps holds two objects separated by a line of three dashes: a ConfigMap and a Deployment. Apply both at once.', code: 'kubectl apply -f manifest.yaml', see: 'Two lines: configmap/portfolio-config created and deployment.apps/portfolio created.', expect: ['configmap/portfolio-config created', 'deployment.apps/portfolio created'] },
      { do: 'Check the pods. ' + TYPE, code: 'kubectl get pods', see: 'Three portfolio pods, all Running.', expect: ['portfolio-', 'Running'] },
      { do: 'Give the app an address. ' + TYPE, code: 'kubectl expose deployment portfolio --port=80 --target-port=8080', see: 'service/portfolio created', expect: ['service/portfolio created'] },
      { do: 'See everything together. ' + TYPE, code: 'kubectl get all', see: 'The pods, the Service and the Deployment in one list.', expect: ['portfolio'] },
      { do: 'Prove it heals itself: scale to 4, then check.', code: 'kubectl scale deployment portfolio --replicas=4\nkubectl get deployments', see: 'portfolio with READY 4/4.', expect: ['4/4'] },
    ],
  },
};
