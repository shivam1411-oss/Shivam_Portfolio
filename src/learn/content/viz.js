import { vizCourse } from '../data/viz';
import { vizGuide } from '../guides/data';
import { vizSteps } from '../guides/viz-steps';
import { startGuide, withGuide } from './util';

export default withGuide(
  {
    ...vizCourse,
    audience: 'Anyone who presents numbers in reports or slides.',
    needs: 'Python basics; the later lessons use a little pandas.',
    outcomes: ['Draw line, bar, histogram and scatter charts', 'Format axes in ₹ and %', 'Design report charts that make one clear point'],
    start: startGuide({
      intro:
        'This course teaches you to draw charts with code and, more importantly, to choose the right chart and make it say one clear thing. Every chart appears right under the code that drew it, so change a number or a colour and run it again to see the difference.',
      need: [
        'Python basics: variables and lists. The last two lessons use a little pandas.',
        'Nothing to install: Matplotlib runs inside this page. The first Run in a lesson takes a few seconds while it loads.',
        'About 30 minutes for each lesson.',
      ],
      order: [
        'Start with "Figures, axes and your first chart": every chart afterwards is built the same way.',
        'Then "Choosing the right chart", which matches the question to the chart type.',
        'Then plotting straight from pandas, and several charts in one figure.',
        'Finish with "Charts that make a point".',
      ],
      doing: 'A numbered walkthrough in a practice box: one small change per step, exactly what to type, and the chart you should see. Tick each step as you go.',
    }),
  },
  vizGuide,
  vizSteps
);
