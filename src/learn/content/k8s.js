import { k8sCourse } from '../k8s/course';
import { k8sGuide } from '../guides/tech';
import { withGuide } from './util';

export default withGuide(
  {
    ...k8sCourse,
    audience: 'Beginners who want to know how modern apps are deployed and kept running.',
    needs: 'Nothing. A simulated cluster runs in your browser; the Learn the Code deploy lessons are a helpful warm-up.',
    outcomes: ['Explain containers, pods, nodes and the control plane', 'Write Deployment, Service and ConfigMap YAML', 'Scale, update and roll back an app with kubectl'],
  },
  k8sGuide
);
