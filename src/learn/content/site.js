import { lessons, modules } from '../lessons';
import { siteGuide } from '../guides/site';
import { siteSteps } from '../guides/site-steps';
import { startGuide, withGuide } from './util';

export default withGuide(
  {
    id: 'site',
    title: 'Learn the Code',
    tagline: 'How this portfolio was built, change by change',
    blurb:
      'React, Tailwind, animations, canvas effects, performance, the AI chat, deploying through Cloudflare, the Android app, and how Python was made to run in this Learning Lab, explained from zero with the real code and playgrounds.',
    levels: 'Beginner',
    icon: 'site',
    audience: 'Anyone curious how a modern website is built, with no coding experience needed.',
    needs: 'Nothing. Every term is explained as you go.',
    outcomes: ['Read and change the site\'s code with confidence', 'Explain React, Tailwind, canvas animation and deployment', 'Know how the AI chat and in-browser Python work'],
    modules,
    lessons,
    extras: [{ hash: '#/timeline', label: 'What changed, in order' }],
    start: startGuide({
      intro:
        'This course explains how this very website was built, one change at a time, for someone who has never coded. You will not write a program here. Instead, every idea comes with a small playground to click, drag and break, and many steps send you to look at the real site.',
      need: [
        'No coding experience and nothing to install.',
        'About 10 minutes for each lesson.',
        'A computer is best for a few steps that look at the page source or resize the window; everything else works on a phone.',
      ],
      order: [
        'Start with "From one HTML file to a React app" for the big picture.',
        'Then go module by module: Foundations, Look & feel, The effects, Speed & devices, Features, Shipping it.',
        'The last two modules explain the Learning Lab itself: Python in the browser, then accounts and payments.',
        '"What changed, in order", at the bottom of this page, is the timeline of every change the lessons describe.',
      ],
      doing: 'A numbered walkthrough using the lesson\'s own playground or the live site: one small action per step, and what you should see. Tick each step as you go.',
    }),
  },
  siteGuide,
  siteSteps
);
