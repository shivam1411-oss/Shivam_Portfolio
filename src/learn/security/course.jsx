import { B, Callout, Code, F, H, P, Term } from '../ui';
import { CrawlerGate, FormGuard, HeaderReader, RobotsChecker, SecretSorter, VisitJourney } from './widgets';

// "Cloudflare & Web Security": how shivam-soni.com is delivered and protected, taught on the real setup.
// Every record, header, file and limit quoted here is the live site's own (checked when written).

const modules = [
  { id: 'sec-front', title: 'Cloudflare in front', level: 'Beginner', blurb: 'How a visit finds the site, and what Cloudflare does standing between visitors and GitHub Pages.' },
  { id: 'sec-bots', title: 'Bots and AI crawlers', level: 'Intermediate', blurb: 'Asking crawlers politely with robots.txt, then enforcing it at the edge without losing search.' },
  { id: 'sec-secrets', title: 'Secrets, forms and email', level: 'Intermediate', blurb: 'Which keys may ship in a website, and how a public form sends email without being abused.' },
];

const lessons = [
  // ---------------------------------------------------------------- Cloudflare in front
  {
    id: 'sec-journey',
    module: 'sec-front',
    title: 'How a visit reaches the site',
    minutes: 12,
    goals: ['What DNS and nameservers do', 'What it means for Cloudflare to "proxy" a site', 'Why the hosting address stays hidden'],
    body: () => (
      <>
        <P>
          shivam-soni.com is built by GitHub Actions and hosted on <Term id="pages">GitHub Pages</Term>. But visitors never talk to GitHub directly. Every visit goes to{' '}
          <B>Cloudflare</B> first, which checks it, answers it from a nearby copy if it can, and only otherwise asks GitHub. This lesson follows one visit, step by step.
        </P>
        <H>Step 1: the address book</H>
        <P>
          A browser cannot connect to a name, only to a numeric IP address. It asks <Term id="dns">DNS</Term> for one. Which server gives the official answer is decided by the
          domain's <Term id="nameserver">nameservers</Term>, set where the domain was bought. For this site they are Cloudflare's:
        </P>
        <Code file="dig shivam-soni.com NS / A (live answers)">{`
shivam-soni.com.  NS  jobs.ns.cloudflare.com.
shivam-soni.com.  NS  khloe.ns.cloudflare.com.

shivam-soni.com.  A   104.21.18.99      ← Cloudflare's address
shivam-soni.com.  A   172.67.181.144    ← Cloudflare's address`}</Code>
        <P>
          Notice the addresses: they are Cloudflare's, not GitHub's. The DNS record inside Cloudflare points at GitHub Pages, but because it is <B>proxied</B> (shown as an
          orange cloud in the dashboard), Cloudflare hands out its own addresses instead. That makes Cloudflare a <Term id="proxy">reverse proxy</Term>: it receives every visit
          and fetches from the real server, the <Term id="origin">origin</Term>, only when it needs to.
        </P>
        <VisitJourney />
        <H>What standing in front makes possible</H>
        <ul className="my-4 pl-5 list-disc text-muted space-y-1.5 marker:text-accent">
          <li>
            <B>One secure address.</B> Cloudflare holds the <Term id="https">HTTPS</Term> certificate and sends <F>http://</F> and <F>www.</F> to{' '}
            <F>https://shivam-soni.com/</F>.
          </li>
          <li>
            <B>A checkpoint.</B> Requests can be inspected and refused before they reach GitHub, which is how AI training crawlers are turned away (module 2).
          </li>
          <li>
            <B>Speed.</B> Copies of files are kept in data centres around the world, the <Term id="edge">edge</Term>, so most requests never travel to GitHub (next lesson).
          </li>
          <li>
            <B>Email for the domain.</B> The same DNS points mail for <F>hello@shivam-soni.com</F> to Cloudflare Email Routing, which forwards it to a private inbox (module 3).
          </li>
        </ul>
        <Callout title="Moving the nameservers was the whole switch">
          Nothing in the website's code changed to put Cloudflare in front. The domain's nameservers were changed to Cloudflare's, the DNS records were recreated there with the
          proxy on, and from then on Cloudflare answered every lookup. The privacy policy was updated the same day to say so.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'Why does dig shivam-soni.com return 104.21.18.99 instead of a GitHub address?',
        options: ['The site moved off GitHub', 'The record is proxied, so Cloudflare answers with its own addresses and fetches from GitHub itself', 'DNS is broken', 'GitHub rents addresses from Cloudflare'],
        answer: 1,
        why: 'With the orange cloud on, visitors connect to Cloudflare, which then talks to the origin.',
      },
      {
        q: 'What decides which server gives the official DNS answers for a domain?',
        options: ['The website\'s code', 'Its nameservers', 'The browser', 'GitHub Pages'],
        answer: 1,
        why: 'The nameservers hold the domain\'s records; changing them to Cloudflare\'s moved DNS there.',
      },
      {
        q: 'Which of these could NOT happen if the proxy were switched off (DNS only)?',
        options: ['The site would still load', 'Cloudflare could turn away crawlers before they reach the site', 'DNS would still work', 'HTTPS would still work through GitHub'],
        answer: 1,
        why: 'Without the proxy, requests go straight to GitHub, so Cloudflare never sees them to check them.',
      },
    ],
  },
  {
    id: 'sec-edge',
    module: 'sec-front',
    title: 'Caching, HTTPS and headers at the edge',
    minutes: 11,
    goals: ['Read response headers like a pro', 'What cf-cache-status HIT, MISS and DYNAMIC mean', 'Why renamed files make long caching safe'],
    body: () => (
      <>
        <P>
          Every response comes with <Term id="header">headers</Term>: labelled lines that say who answered, how long the answer may be kept, and more. They are the quickest way to
          see what Cloudflare is doing. In a terminal, <F>curl -I</F> prints only the headers.
        </P>
        <Code file="terminal">{`
curl -I https://shivam-soni.com/
# HTTP/2 200
# server: cloudflare
# cf-cache-status: DYNAMIC
# cache-control: max-age=600
# via: 1.1 varnish
# x-github-request-id: 74B0:…`}</Code>
        <P>
          The first line is the <Term id="statuscode">status code</Term>. <F>server: cloudflare</F> says the answer came through Cloudflare; <F>x-github-request-id</F> shows
          GitHub Pages produced it behind the scenes.
        </P>
        <HeaderReader />
        <H>The cache, in three words</H>
        <ul className="my-4 pl-5 list-disc text-muted space-y-1.5 marker:text-accent">
          <li>
            <B>HIT</B>: served from Cloudflare's own <Term id="cache">cache</Term>, without asking GitHub. The JavaScript and CSS files are usually HITs.
          </li>
          <li>
            <B>MISS</B>: Cloudflare may keep this file but did not have it yet, so it fetched it and keeps it for next time.
          </li>
          <li>
            <B>DYNAMIC</B>: not cached at all. Cloudflare does not keep HTML pages unless told to, so the page itself always comes fresh from GitHub.
          </li>
        </ul>
        <Callout title="Why caching the JavaScript for hours is safe">
          Vite names every built file after its content: <F>main-DYKZSKHQ.js</F>. Change one character of code and the next build produces a different name, and the fresh HTML
          page points to it. An old copy can sit in a cache for four hours (<F>max-age=14400</F>) and do no harm, because nothing asks for that name any more.
        </Callout>
        <H>HTTPS and one address</H>
        <Code file="terminal">{`
curl -I http://shivam-soni.com/
# HTTP/1.1 301 Moved Permanently
# location: https://shivam-soni.com/

curl -I https://www.shivam-soni.com/
# HTTP/2 301
# location: https://shivam-soni.com/`}</Code>
        <P>
          A <Term id="redirect">redirect</Term> (301) sends the browser to the right address before anything else is downloaded. Plain <F>http://</F> is never served, and{' '}
          <F>www.</F> is folded into the bare domain, so every link and search result points to one place.
        </P>
      </>
    ),
    quiz: [
      {
        q: 'A response says cf-cache-status: HIT. Where did it come from?',
        options: ['GitHub Pages, just now', 'Cloudflare\'s stored copy, without asking GitHub', 'The visitor\'s own computer', 'Nowhere: it failed'],
        answer: 1,
        why: 'HIT means the edge already had it.',
      },
      {
        q: 'Why is the HTML page DYNAMIC while the JS files are HITs?',
        options: ['HTML is secret', 'Cloudflare caches files like JS and CSS by default but not HTML pages', 'GitHub refuses', 'The page is too big'],
        answer: 1,
        why: 'Static assets are cached by default; HTML needs an explicit rule.',
      },
      {
        q: 'What status code means "this has moved, go here instead"?',
        options: ['200', '301', '403', '429'],
        answer: 1,
        why: '301 Moved Permanently, with the new address in the location header.',
      },
    ],
  },

  // ---------------------------------------------------------------- Bots and AI crawlers
  {
    id: 'sec-robots',
    module: 'sec-bots',
    title: 'Asking crawlers politely',
    minutes: 12,
    goals: ['How robots.txt groups work', 'The extra signals: Content-Signal, ai.txt, TDM and page tags', 'Why a dotted folder nearly went missing'],
    body: () => (
      <>
        <P>
          A <Term id="crawler">crawler</Term> is a program that reads web pages by itself. Some are welcome: search engines, and AI assistants that read a page to answer a
          question and link back. Others copy the site to train AI models, which this site does not allow. The first line of defence is to <B>ask</B>, in files every reputable
          crawler reads before it starts.
        </P>
        <H>robots.txt</H>
        <Code file="public/robots.txt (shortened)">{`
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: CCBot
# …21 more AI training crawlers
Disallow: /`}</Code>
        <P>
          A crawler finds the one group that names it in a <F>User-agent</F> line and follows only that group. If no group names it, it follows the <F>*</F> group. So Googlebot
          reads "Allow: /", and GPTBot reads "Disallow: /". The name a crawler uses is its <Term id="useragent">User-Agent</Term>.
        </P>
        <RobotsChecker />
        <Callout title="Google-Extended is not a crawler">
          Google crawls with Googlebot for everything. <F>Google-Extended</F> is a name Google checks in robots.txt to decide whether what Googlebot fetched may train Gemini.
          Disallowing it keeps the site in Google Search and out of Gemini training. <F>Applebot-Extended</F> works the same way for Apple.
        </Callout>
        <H>The other signals</H>
        <Code file="public/ai.txt, public/.well-known/tdmrep.json, every page's <head>">{`
# ai.txt: one rule for AI training, everything
User-Agent: *
Disallow: /

// tdmrep.json: the EU text-and-data-mining reservation
[{ "location": "/*", "tdm-reservation": 1, "tdm-policy": "https://shivam-soni.com/privacy.html" }]

<meta name="robots" content="noai, noimageai" />
<meta name="tdm-reservation" content="1" />`}</Code>
        <P>
          <F>Content-Signal</F> in robots.txt says the same in one line: search yes, AI input (answering questions) yes, AI training no. The TDM reservation has legal weight in
          the EU, where text and data mining is allowed unless the owner reserves the right in a machine-readable way.
        </P>
        <Callout tone="warn" title="The file that did not get published">
          Anything in <F>public/</F> is copied into the built site. But the first deploy served <F>/.well-known/tdmrep.json</F> as a 404. The upload step skips files and folders
          whose names start with a dot, unless told otherwise:
        </Callout>
        <Code file=".github/workflows/deploy.yml">{`
- uses: actions/upload-pages-artifact@v5
  with:
    path: dist
    include-hidden-files: true   # publish dist/.well-known; .git and .github stay out`}</Code>
        <P>
          The lesson: after deploying a new public file, request it from the live site and check it is a 200, not a 404. "It is in the repository" is not the same as "it is
          published".
        </P>
      </>
    ),
    quiz: [
      {
        q: 'robots.txt has a * group that allows everything and a GPTBot group that disallows everything. What does GPTBot do?',
        options: ['Follows both and gets confused', 'Follows only its own group: Disallow', 'Follows the * group because it comes first', 'Ignores robots.txt'],
        answer: 1,
        why: 'A crawler uses the most specific group that names it.',
      },
      {
        q: 'Disallowing Google-Extended does what?',
        options: ['Removes the site from Google Search', 'Keeps the site in Search but out of Gemini training', 'Blocks Googlebot', 'Nothing at all'],
        answer: 1,
        why: 'It is a training opt-out token read by Googlebot, not a separate crawler.',
      },
      {
        q: 'Why was tdmrep.json missing after the first deploy?',
        options: ['It had a typo', 'Its folder .well-known starts with a dot, and the upload skipped hidden files until include-hidden-files: true', 'Cloudflare blocked it', 'JSON cannot be published'],
        answer: 1,
        why: 'upload-pages-artifact excludes dotfiles by default.',
      },
    ],
  },
  {
    id: 'sec-bot-wall',
    module: 'sec-bots',
    title: 'Blocking AI crawlers at the edge',
    minutes: 13,
    goals: ['Why a request is not a wall', 'How Cloudflare blocks crawlers before they reach the site', 'Why blocking a whole category also blocked search engines'],
    body: () => (
      <>
        <P>
          robots.txt is a request. Reputable crawlers obey it; others may not, and nothing in the file can stop them. The wall is Cloudflare: because every visit passes through it
          first, it can refuse known AI training crawlers with a <F>403 Forbidden</F> before the request ever reaches GitHub Pages.
        </P>
        <Code file="terminal (live)">{`
curl -I -A "GPTBot/1.2" https://shivam-soni.com/
# HTTP/2 403

curl -I -A "Mozilla/5.0 (compatible; Googlebot/2.1)" https://shivam-soni.com/
# HTTP/2 200`}</Code>
        <P>
          <F>-A</F> sets the <Term id="useragent">User-Agent</Term>, so this is how you test the rules from a terminal. But a User-Agent is only a name a program gives itself.
          Cloudflare does not rely on it alone: it recognises crawlers by where their requests come from and how they behave, and marks the confirmed ones as{' '}
          <Term id="verifiedbot">verified bots</Term>. A scraper calling itself "Googlebot" from a home connection is not treated as Google.
        </P>
        <H>The trap: blocking a whole category</H>
        <P>
          Cloudflare's AI crawler settings group crawlers into categories: Search, Training and Agents. The obvious move is to set Training to Block. On this site, that also
          blocked Googlebot, BingBot, Applebot and PetalBot, because those companies use what their search crawler collects to train AI too, so Cloudflare files them under
          Training as well. The site would have dropped out of search.
        </P>
        <CrawlerGate />
        <H>What is switched on</H>
        <Code file="Cloudflare → AI Crawl Control → Crawlers (as configured)">{`
Training category      Allow     (so search engines keep working)
Blocked one by one     GPTBot, ClaudeBot, CCBot, Bytespider, Amazonbot,
                       FacebookBot, Meta-ExternalAgent, Google-CloudVertexBot,
                       TikTok Spider, Timpibot, ProRataInc, Novellum AI Crawl
Allowed                Googlebot, BingBot, Applebot, Baidu, PetalBot,
                       OAI-SearchBot, Claude-User and the other search/assistant bots
AI Labyrinth           On   (bots that ignore the rules get lost in fake pages)
Bot Preference Sync    Off  (keeps the per-crawler choices from being overwritten)`}</Code>
        <Callout title="Request and wall, together">
          The files in the last lesson cover every polite crawler, including ones Cloudflare has not catalogued yet. The edge rules cover the big crawlers whether or not they are
          polite. Neither is enough alone; together they are the strongest a public website can be without hiding behind a login.
        </Callout>
        <Callout tone="warn" title="Test after every change">
          After changing bot settings, run the two <F>curl -A</F> lines above, plus one for a browser. A training crawler should get 403, search engines and browsers 200. That
          check is what caught the category problem.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'Why is robots.txt not enough on its own?',
        options: ['It is too short', 'It is a request: a crawler that ignores it can still read everything', 'Browsers ignore it', 'It only works on GitHub'],
        answer: 1,
        why: 'Only something in front of the site, like Cloudflare, can actually refuse a request.',
      },
      {
        q: 'Why did setting the whole Training category to Block hurt the site?',
        options: ['It blocked all humans', 'Some search engines also train AI, so they were filed under Training and got blocked too', 'It deleted robots.txt', 'Cloudflare charges for it'],
        answer: 1,
        why: 'Googlebot, BingBot, Applebot and PetalBot were all in that category.',
      },
      {
        q: 'Someone sends requests with User-Agent "Googlebot" from a home internet connection. How does Cloudflare treat them?',
        options: ['As Google, because the name says so', 'Not as a verified bot: the name is only a claim, and the requests do not come from Google\'s network', 'It blocks all of Google', 'It cannot tell'],
        answer: 1,
        why: 'Verified bots are confirmed by where requests come from, not by what they call themselves.',
      },
    ],
  },

  // ---------------------------------------------------------------- Secrets, forms and email
  {
    id: 'sec-secrets',
    module: 'sec-secrets',
    title: 'Keeping secrets off the website',
    minutes: 11,
    goals: ['Why everything in a website is public', 'Publishable keys versus secret keys', 'Where each secret on this site lives'],
    body: () => (
      <>
        <P>
          A website is downloaded in full to every visitor's browser. Any key, password or token written into its code can be read by anyone who opens the developer tools, even
          if it is "hidden" in a minified file. So the rule is simple: if a value lets someone act as you, it must never be in the website.
        </P>
        <H>Two kinds of key</H>
        <P>
          Services that are used from websites give you two keys. A <Term id="publishablekey">publishable key</Term> identifies your project and is made to be seen; what it can
          do is limited on the service's side. A <Term id="secretkey">secret key</Term> proves you are the owner and can do anything.
        </P>
        <Code file="src/learn/supabase.config.js">{`
// Public Supabase settings for CodeJack. The publishable key is meant to be in the website:
export const SUPABASE_URL = 'https://jiwvwgrtxgmrinikmgyb.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_…';`}</Code>
        <P>
          The publishable key is safe here because the database checks <Term id="rls">row-level security</Term> on every read and write: with this key, a learner can only see
          their own progress and purchases. The secret key skips those rules, so it lives only where visitors can never reach it.
        </P>
        <SecretSorter />
        <H>Where the secrets live</H>
        <Code file="three safes, one per platform">{`
GitHub → Settings → Secrets and variables → Actions
  SUPABASE_SECRET_KEY     used by the deploy job to upload paid lessons

Supabase → Edge Functions → Secrets
  BREVO_API_KEY            sends the resume email
  RAZORPAY_KEY_SECRET      creates and verifies payments
  RAZORPAY_WEBHOOK_SECRET  checks that payment notices really come from Razorpay
  (the Supabase secret key is given to every function automatically)

Cloudflare Worker (npx wrangler secret put …)
  ANTHROPIC_API_KEY       the AI chat`}</Code>
        <P>
          Each platform hands the secret to its own server code at run time and never shows it again, not in logs and not in the repository. The website only ever calls the
          server code, which does the privileged work and returns the result.
        </P>
        <Callout tone="warn" title="Never paste a secret into a chat, a ticket or a commit">
          A secret that has been pasted anywhere outside its safe should be treated as leaked: create a new one at the service and delete the old one. It takes two minutes and
          removes all doubt.
        </Callout>
      </>
    ),
    quiz: [
      {
        q: 'A secret key is only inside a minified JavaScript file. Is it safe?',
        options: ['Yes, minified code cannot be read', 'No: the file is downloaded by every visitor and can be searched', 'Only on phones', 'Yes, if the site uses HTTPS'],
        answer: 1,
        why: 'Minifying shortens code; it does not hide it.',
      },
      {
        q: 'Why may the Supabase publishable key be in the website?',
        options: ['It expires quickly', 'Row-level security limits every read and write it makes, so it cannot see other people\'s data', 'Nobody looks for it', 'It is encrypted'],
        answer: 1,
        why: 'The protection is on the database side, not in hiding the key.',
      },
      {
        q: 'Where does the Brevo API key live?',
        options: ['In src/data/content.js', 'In the Supabase Edge Function secrets', 'In robots.txt', 'In the visitor\'s browser storage'],
        answer: 1,
        why: 'Only the send-resume function needs it, so only it receives it.',
      },
    ],
  },
  {
    id: 'sec-forms',
    module: 'sec-secrets',
    title: 'A form that cannot be abused',
    minutes: 14,
    goals: ['The checks a public form needs', 'Rate limits that store no personal data', 'How email proves it really came from your domain'],
    body: () => (
      <>
        <P>
          "Get Resume" lets anyone type a name and email address and receive the resume from <F>resume@shivam-soni.com</F>. Without protection, a script could make it send
          thousands of emails, to strangers, in the site's name. The <Term id="edgefunction">Edge Function</Term> <F>send-resume</F> runs a series of checks before sending
          anything.
        </P>
        <Code file="supabase/functions/send-resume/index.ts (the checks, in order)">{`
if (req.method !== 'POST') return json(req, 405, …);
if (String(body.company || '').trim())               // the honeypot
  return json(req, 200, { ok: true });               //   a bot filled the hidden field: fake success
if (name.length < 2)        return json(req, 400, …);
if (!EMAIL.test(email))     return json(req, 400, …);

const LIMITS = { perEmailDay: 3, perIpHour: 10, totalDay: 250 };
if (byEmail >= LIMITS.perEmailDay || byIp >= LIMITS.perIpHour || total >= LIMITS.totalDay)
  return json(req, 429, { error: 'Too many requests…' });

// only now: fetch the PDF and ask Brevo to send it`}</Code>
        <Callout title="CORS is not a lock">
          The function's <Term id="cors">CORS</Term> headers name the site as the only page allowed to read its answers. Browsers respect that, but a script running anywhere
          else simply ignores it and sends the request anyway. That is why every check below runs on the server, for every request, whoever sends it.
        </Callout>
        <P>
          The <Term id="honeypot">honeypot</Term> is a form field called "company" that people cannot see. A person leaves it empty; a bot that fills in every field gives
          itself away. It gets a cheerful 200 so it does not learn it was caught, and no email is sent.
        </P>
        <FormGuard />
        <H>Rate limits without personal data</H>
        <P>
          To count requests, the function must remember who asked. But a table of email addresses and IP addresses would be personal data to protect. So it stores only{' '}
          <Term id="hash">hashes</Term>, made with a secret key so they cannot be reversed by guessing, and deletes them after two days.
        </P>
        <Code file="supabase/functions/send-resume/index.ts">{`
/** HMAC-SHA256 so the table never holds an email address or IP in the clear. */
async function hash(secret: string, value: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  …
}`}</Code>
        <Code file="supabase/resume.sql">{`
create table if not exists public.resume_requests (
  id bigint generated always as identity primary key,
  email_hash text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
alter table public.resume_requests enable row level security;
-- No policies on purpose: only the Edge Function (with the secret key) can read or write it.`}</Code>
        <Callout title="Row-level security with no policies">
          With RLS on and no policies, the publishable key in the website can do nothing at all with this table: not read it, not add to it. Only the function, which holds the
          secret key, can. That is the safest default for any table the browser never needs.
        </Callout>
        <H>Proving the email is really from shivam-soni.com</H>
        <P>
          Anyone can write any "From" address on an email, so inboxes check proof published in the sender domain's DNS. Brevo signs every email with <Term id="dkim">DKIM</Term>;
          the public halves of its keys are in DNS, and <Term id="dmarc">DMARC</Term> tells inboxes how to treat mail that fails.
        </P>
        <Code file="dig (live answers)">{`
brevo1._domainkey.shivam-soni.com  CNAME  b1.shivam-soni-com.dkim.brevo.com.
brevo2._domainkey.shivam-soni.com  CNAME  b2.shivam-soni-com.dkim.brevo.com.
_dmarc.shivam-soni.com             TXT    "v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com"
shivam-soni.com                    MX     route1.mx.cloudflare.net. (+ route2, route3)
shivam-soni.com                    TXT    "v=spf1 include:_spf.mx.cloudflare.net ~all"`}</Code>
        <P>
          Incoming mail is a separate path: the <Term id="mx">MX records</Term> send it to Cloudflare Email Routing, which forwards <F>hello@</F> to a private inbox, so the real
          address never appears on the site. Replies to the resume email go to <F>hello@</F> the same way. <Term id="spf">SPF</Term> lists who may send for the domain.
        </P>
        <Callout tone="warn" title="The failure that taught the most">
          The first live send returned 500. The function's log showed Brevo's answer: 401, "unrecognised IP address". Brevo was set to accept API calls only from listed IP
          addresses, and Supabase runs functions from addresses that change. The fix was to switch that list off in Brevo, since the key itself is the protection and it never
          leaves the function. Reading the server's own log, not guessing from the browser, found it in one step.
        </Callout>
        <H>Protecting the preview too</H>
        <P>
          The resume pop-up previews the PDF before sending. The preview is drawn on a canvas with the phone number and email address painted over in masked form, and the site's
          address tiled faintly across it, so a screenshot cannot be used to harvest contact details and still says where it came from. The full PDF only goes to the email
          address someone entered.
        </P>
      </>
    ),
    quiz: [
      {
        q: 'A bot fills in the hidden "company" field. What does the function return?',
        options: ['403 Forbidden', '200 { ok: true }, without sending anything', '429 Too many requests', '500 error'],
        answer: 1,
        why: 'A fake success gives the bot nothing to learn from.',
      },
      {
        q: 'Why are emails and IPs stored as HMAC hashes?',
        options: ['To save space', 'So the limits can be counted without the table holding personal data that could leak', 'Brevo requires it', 'Hashes are faster to send'],
        answer: 1,
        why: 'The same input gives the same hash for counting, but the hash cannot be turned back into the address.',
      },
      {
        q: 'resume_requests has RLS on and no policies. Who can read it?',
        options: ['Everyone', 'Signed-in learners', 'Only code holding the secret key, such as the Edge Function', 'Nobody, ever'],
        answer: 2,
        why: 'No policy means the publishable key gets nothing; the secret key bypasses RLS.',
      },
      {
        q: 'What lets an inbox trust that an email from resume@shivam-soni.com is genuine?',
        options: ['The From line', 'A DKIM signature checked against keys published in the domain\'s DNS', 'The subject', 'The attachment'],
        answer: 1,
        why: 'DKIM is a signature only the real sender (Brevo, for this domain) can make.',
      },
    ],
  },
];

export const securityCourse = {
  id: 'security',
  title: 'Cloudflare & Web Security',
  tagline: 'Deliver a website fast and keep bots, abuse and leaked keys out',
  blurb:
    'DNS and nameservers, Cloudflare as a reverse proxy, caching and HTTPS at the edge, robots.txt and blocking AI crawlers without losing search, secret keys, and a public form that sends email without being abused. Taught on this site\'s real setup.',
  levels: 'Beginner → Intermediate',
  icon: 'security',
  modules,
  lessons,
};
