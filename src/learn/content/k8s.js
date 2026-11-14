import { k8sCourse } from '../k8s/course';
import { k8sGuide } from '../guides/tech';
import { k8sSteps } from '../guides/k8s-steps';
import { startGuide, withGuide } from './util';

export default withGuide(
  {
    ...k8sCourse,
    audience: 'Beginners who want to know how modern apps are deployed and kept running.',
    needs: 'Nothing. A simulated cluster runs in your browser; the Learn the Code deploy lessons are a helpful warm-up.',
    outcomes: ['Explain containers, pods, nodes and the control plane', 'Write Deployment, Service and ConfigMap YAML', 'Scale, update and roll back an app with kubectl'],
    start: startGuide({
      intro:
        'Kubernetes runs apps across many machines and keeps them running. Real clusters cost money and take time to set up, so this course gives you a simulated three-machine cluster inside the page. The commands and files are the real ones; you just cannot break anything.',
      need: [
        'Nothing to install: the practice cluster runs inside this page.',
        'No coding experience. You will type short commands and edit small text files.',
        'About 30 minutes for each lesson.',
        'Type commands exactly, including the spaces and dashes. If one fails, read the error: it names what it did not understand.',
      ],
      order: [
        'Start with "Containers and why Kubernetes" to meet the cluster.',
        'Then Pods, then Deployments: the two ideas everything else rests on.',
        'Then Services, configuration, and rolling updates.',
        'Finish with the project, which deploys the portfolio from one file.',
      ],
      doing: 'A numbered walkthrough in a practice cluster: one command per step, exactly what to type, and what the cluster should answer. Tick each step as you go.',
    }),
  },
  k8sGuide,
  k8sSteps
);
