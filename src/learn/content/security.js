import { securityCourse } from '../security/course';
import { securityGuide } from '../guides/security';
import { securitySteps } from '../guides/security-steps';
import { startGuide, withGuide } from './util';

export default withGuide(
  {
    ...securityCourse,
    audience: 'Anyone who runs or helps run a website: owners, analysts, product people and new developers.',
    needs: 'Nothing. A computer helps for the optional steps that use the browser\'s developer tools or a terminal.',
    outcomes: ['Explain how DNS and a Cloudflare proxy deliver a site', 'Block AI training crawlers without losing search', 'Keep secret keys off a website and protect a public form'],
    start: startGuide({
      intro:
        'This course explains how shivam-soni.com is delivered and protected, using its real setup: the DNS records, the response headers, robots.txt, the Cloudflare bot rules and the function behind the "Get Resume" form. Every playground uses values taken from the live site.',
      need: [
        'No coding experience and nothing to install.',
        'About 12 minutes for each lesson.',
        'Optional: a terminal for the curl and dig steps (built into macOS and Linux; on Windows use PowerShell or skip them).',
      ],
      order: [
        'Start with "How a visit reaches the site": everything else builds on the proxy idea.',
        'Then caching and headers, so you can read what Cloudflare is doing.',
        'Module 2 covers crawlers: first asking politely, then enforcing at the edge.',
        'Module 3 covers secret keys and a public form that sends email safely.',
      ],
      doing: 'A numbered walkthrough in the lesson\'s playground, and sometimes on the live site: one small action per step, and what you should see. Tick each step as you go.',
    }),
  },
  securityGuide,
  securitySteps
);
