// Step-by-step material for the "Cloudflare & Web Security" lessons: same shape as jira-steps.jsx (terms, process,
// practice, steps). `practice(key)` is the playground the steps are done in. Some steps use a terminal or the
// browser's developer tools on the live site; those say so.
import { CrawlerGate, FormGuard, HeaderReader, RobotsChecker, SecretSorter, VisitJourney } from '../security/widgets';

export const securitySteps = {
  'sec-journey': {
    terms: ['dns', 'nameserver', 'proxy', 'origin', 'edge'],
    process: {
      title: 'What happens when someone opens shivam-soni.com',
      stages: [
        ['The browser looks up the name', 'It asks DNS for shivam-soni.com; Cloudflare\'s nameservers answer.'],
        ['It gets Cloudflare\'s address', 'Because the record is proxied, the answer is a Cloudflare IP, not GitHub\'s.'],
        ['It connects securely to Cloudflare', 'HTTPS is set up with Cloudflare, which also redirects http:// and www.'],
        ['Cloudflare checks the visitor', 'Known AI training crawlers are refused here with a 403.'],
        ['Cloudflare answers or fetches', 'From its own copy if it has one, otherwise from GitHub Pages, the origin.'],
        ['The page arrives', 'Through Cloudflare, with its headers added.'],
      ],
    },
    practice: (key) => <VisitJourney key={key} />,
    steps: [
      { do: 'In the playground above these steps, keep the proxy On and click "1. Look up the address".', see: 'Two A records, 104.21.18.99 and 172.67.181.144: Cloudflare\'s addresses.' },
      { do: 'Switch the proxy to "Off (DNS only)".', see: 'The addresses change to GitHub Pages\' own (185.199.108.153 and others). Anyone could now see where the site is hosted.' },
      { do: 'With the proxy still Off, click "3. Check the visitor".', see: 'GPTBot gets 200 OK: with nothing in front, every bot reaches the site.' },
      { do: 'Switch the proxy back On and click "3. Check the visitor" again.', see: 'GPTBot now gets 403 Forbidden, refused before reaching GitHub.' },
      { do: 'Click "4. Fetch the page".', see: 'The JavaScript file is a cache HIT; the page is DYNAMIC (fetched from GitHub each time).' },
      { do: 'On a computer, open https://shivam-soni.com in a new tab, press F12 (or Cmd+Option+I on a Mac), open the Network tab and reload. Click the first request.', see: 'Under Response Headers: server: cloudflare. You have just seen the proxy for real.' },
    ],
  },
  'sec-edge': {
    terms: ['header', 'cache', 'statuscode', 'redirect', 'https'],
    process: {
      title: 'How Cloudflare decides what to send back',
      stages: [
        ['A request arrives at the nearest data centre', 'Cloudflare looks at the address and the visitor.'],
        ['Is it plain http:// or www.?', 'Then it answers 301 with the https://shivam-soni.com/ address, and stops.'],
        ['Is it a file Cloudflare keeps?', 'JavaScript, CSS, images and fonts are cached; HTML pages are not, by default.'],
        ['Does it have a fresh copy?', 'Yes: HIT, served straight away. No: MISS, fetched from GitHub and kept.'],
        ['Pages are always fetched', 'DYNAMIC: the HTML comes from GitHub on every visit, so a deploy shows quickly.'],
      ],
    },
    practice: (key) => <HeaderReader key={key} />,
    steps: [
      { do: 'In the playground above, pick "A JavaScript file".', see: 'cf-cache-status: HIT and age: 381. Cloudflare served its own copy, 381 seconds old.' },
      { do: 'Pick "The home page".', see: 'cf-cache-status: DYNAMIC, plus via and x-github-request-id from GitHub\'s servers: the page was fetched from the origin.' },
      { do: 'Pick "robots.txt".', see: 'MISS: Cloudflare may keep it but did not have it yet. The next request would likely be a HIT.' },
      { do: 'Pick "http:// (no s)".', see: '301 with location: https://shivam-soni.com/. Unencrypted visits are sent to HTTPS.' },
      { do: 'Pick "www.".', see: 'Also 301 to https://shivam-soni.com/: one address for everyone.' },
      { do: 'On a computer, open the browser developer tools on shivam-soni.com, Network tab, reload, and click a file whose name starts with main-.', see: 'cf-cache-status: HIT (or MISS the very first time), and a cache-control: max-age=14400 header.' },
    ],
  },
  'sec-robots': {
    terms: ['crawler', 'robotstxt', 'useragent'],
    process: {
      title: 'How a polite crawler reads robots.txt',
      stages: [
        ['It fetches /robots.txt first', 'From the root of the domain, before any page.'],
        ['It looks for a group that names it', 'A block of User-agent lines with its own name.'],
        ['Otherwise it uses the * group', 'The rules for everyone not named.'],
        ['It follows only that group', 'Allow and Disallow lines in other groups do not apply to it.'],
        ['It may read other signals', 'Content-Signal, ai.txt, tdmrep.json and the page\'s robots meta tag.'],
      ],
    },
    practice: (key) => <RobotsChecker key={key} />,
    steps: [
      { do: 'In the playground above, pick Googlebot.', see: 'No group names it, so it reads the * group: "May read the site".' },
      { do: 'Pick GPTBot.', see: 'The second group names GPTBot, so it follows that group only: "Asked to stay out".' },
      { do: 'Pick Google-Extended.', see: 'Asked to stay out. This is Google\'s training opt-out token: Googlebot still crawls for Search.' },
      { do: 'Pick OAI-SearchBot.', see: 'May read the site: it fetches pages to answer a question in ChatGPT search and links back, which the site allows.' },
      { do: 'Open https://shivam-soni.com/robots.txt in a new tab.', see: 'The full file: the * group with Content-Signal, then 25 named training crawlers under one Disallow: /.' },
      { do: 'Open https://shivam-soni.com/.well-known/tdmrep.json in a new tab.', see: 'A small JSON list with "tdm-reservation": 1, published since include-hidden-files: true was added to the deploy.' },
    ],
  },
  'sec-bot-wall': {
    terms: ['verifiedbot', 'useragent', 'statuscode', 'crawler'],
    process: {
      title: 'How a crawler is stopped at the edge',
      stages: [
        ['The request reaches Cloudflare', 'Before anything is sent to GitHub Pages.'],
        ['Cloudflare identifies the crawler', 'By its User-Agent, and for big crawlers by checking the request really comes from that company.'],
        ['It looks up your rule for that crawler', 'Blocked one by one, or allowed.'],
        ['Blocked crawlers get 403', 'The page is never fetched from the origin.'],
        ['Everyone else continues', 'Browsers, search engines and AI assistants get the page as usual.'],
      ],
    },
    practice: (key) => <CrawlerGate key={key} />,
    steps: [
      { do: 'In the playground above, choose "Block the Training category".', see: '4 crawlers handled wrongly: Googlebot, BingBot, Applebot and PetalBot get 403, so search would lose the site.' },
      { do: 'Choose "Block crawler by crawler".', see: 'Every crawler handled as intended: training crawlers get 403, search engines and OAI-SearchBot get 200.' },
      { do: 'Look at the OAI-SearchBot row in both policies.', see: 'It gets 200 either way: it answers questions in ChatGPT search, which is not training.' },
      { do: 'If you have a terminal, run: curl -I -A "GPTBot/1.2" https://shivam-soni.com/', see: 'HTTP/2 403: Cloudflare refused it.' },
      { do: 'Run: curl -I https://shivam-soni.com/', see: 'HTTP/2 200: an ordinary request (curl\'s own User-Agent) is let through.' },
    ],
  },
  'sec-secrets': {
    terms: ['publishablekey', 'secretkey', 'apikey', 'rls'],
    process: {
      title: 'How a secret is used without ever reaching the browser',
      stages: [
        ['The secret is stored in a platform\'s safe', 'GitHub Actions secrets, Supabase function secrets or a Wrangler secret.'],
        ['The website calls server code', 'Using only public things: a URL and a publishable key.'],
        ['The platform gives the code its secret', 'At run time, never in a file or a log.'],
        ['The server code does the privileged work', 'Sends the email, checks the payment, calls the AI.'],
        ['Only the result goes back', 'The secret never leaves the server.'],
      ],
    },
    practice: (key) => <SecretSorter key={key} />,
    steps: [
      { do: 'In the playground above, put "Supabase publishable (anon) key" in "In the website".', see: 'Right: it is made to be public, and row-level security limits what it can do.' },
      { do: 'Put "Supabase secret (service role) key" in "In the website".', see: 'Not quite: server only. It skips row-level security entirely.' },
      { do: 'Sort the remaining six items.', see: 'A score out of 8 and a reason under each answer.' },
      { do: 'Fix any wrong answers until the score reads 8 of 8.', see: 'Four items in the website (addresses and publishable keys), four server only (secret keys).' },
      { do: 'On a computer, open shivam-soni.com/learn.html, then the developer tools, Sources (or Debugger) tab, and search all files (Ctrl+Shift+F, or Cmd+Option+F on a Mac) for sb_publishable.', see: 'The publishable key is there, as designed. Search for sb_secret: nothing is found.' },
    ],
  },
  'sec-forms': {
    terms: ['honeypot', 'hash', 'statuscode', 'dkim', 'mx'],
    process: {
      title: 'What send-resume does with one request',
      stages: [
        ['It accepts only POST', 'Anything else gets 405.'],
        ['The honeypot', 'If the hidden company field is filled, reply 200 and send nothing.'],
        ['Input checks', 'A name of 2+ characters and a valid email, or 400.'],
        ['Rate limits, from hashed records', 'Over 3 per email a day, 10 per IP an hour or 250 a day: 429.'],
        ['Send through Brevo', 'With the PDF attached, signed with DKIM for shivam-soni.com.'],
        ['Record the request', 'As two HMAC hashes, deleted after two days.'],
      ],
    },
    practice: (key) => <FormGuard key={key} />,
    steps: [
      { do: 'In the playground above, press "Recruiter sends".', see: '200 and "Every check passed". Emails actually sent: 1.' },
      { do: 'Press "Same email again" three times.', see: 'The first two are sent (3 in total for that address); the third gets 429: the per-email limit.' },
      { do: 'Press "Bot fills every field".', see: '200 { "ok": true }, but "no email is sent": the honeypot caught it. The sent count does not change.' },
      { do: 'Press "Email typo".', see: '400 "Please enter a valid email address".' },
      { do: 'Press Reset, then "Flood: 12 different emails, one IP".', see: 'Ten 200s and two 429s. From the flooding IP: 10 sent, then the per-IP limit stops it.' },
      { do: 'If you have a terminal, run: dig +short brevo1._domainkey.shivam-soni.com CNAME', see: 'b1.shivam-soni-com.dkim.brevo.com.: the public half of the DKIM key Brevo signs the resume emails with.' },
    ],
  },
};
