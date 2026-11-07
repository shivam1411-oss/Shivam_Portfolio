import { lessons, modules } from '../lessons';
import { siteGuide } from '../guides/site';
import { withGuide } from './util';

export default withGuide(
  {
    id: 'site',
    title: 'Learn the Code',
    tagline: 'How this portfolio was built, change by change',
    blurb:
      'React, Tailwind, animations, canvas effects, performance, the AI chat, deploying, the Android app, and how Python was made to run in this Learning Lab, explained from zero with the real code and playgrounds.',
    levels: 'Beginner',
    icon: 'site',
    audience: 'Anyone curious how a modern website is built, with no coding experience needed.',
    needs: 'Nothing. Every term is explained as you go.',
    outcomes: ['Read and change the site\'s code with confidence', 'Explain React, Tailwind, canvas animation and deployment', 'Know how the AI chat and in-browser Python work'],
    modules,
    lessons,
    extras: [{ hash: '#/timeline', label: 'What changed, in order' }],
  },
  siteGuide
);
