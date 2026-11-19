// Beginner guides for the "Cloudflare & Web Security" lessons (same shape as guides/tech.js).

export const securityGuide = {
  'sec-journey': {
    idea: 'DNS turns the name into an address; because the record is proxied, that address is Cloudflare\'s, so every visit meets Cloudflare before GitHub Pages.',
    terms: ['dns', 'nameserver', 'proxy', 'origin'],
    mistakes: [
      ['Thinking the site moved to Cloudflare', 'It is still built and hosted on GitHub Pages. Cloudflare stands in front of it and fetches from it.'],
      ['Turning the proxy off to "fix" something', 'DNS only (grey cloud) sends visitors straight to GitHub and switches off bot blocking, caching and redirects.'],
    ],
    faq: [
      ['Can visitors tell Cloudflare is there?', 'Only in the headers (server: cloudflare) and the IP addresses DNS returns. The page itself is the same.'],
      ['What happens if Cloudflare has an outage?', 'The site is unreachable until it recovers, because DNS points at Cloudflare. Big outages are rare and short.'],
    ],
    recap: ['Nameservers decide who answers DNS for a domain.', 'Proxied records hand out Cloudflare\'s addresses.', 'Cloudflare receives every visit, then fetches from the origin when needed.'],
  },
  'sec-edge': {
    idea: 'Response headers show what happened to a request; cf-cache-status says whether Cloudflare answered from its own copy, and 301s send everyone to one https address.',
    terms: ['header', 'cache', 'statuscode', 'redirect'],
    mistakes: [
      ['Expecting a new build to appear late because of the cache', 'Built files get new names on every change, and HTML is not cached, so a deploy shows within minutes.'],
      ['Reading only the status code', 'The other headers (server, cf-cache-status, location) say who answered and why.'],
    ],
    faq: [
      ['How do I see headers without a terminal?', 'Open the browser\'s developer tools, the Network tab, click a request and read Response Headers.'],
      ['Can I make Cloudflare cache the HTML too?', 'Yes, with a cache rule, but then you must clear the cache after each deploy or visitors may see an old page.'],
    ],
    recap: ['HIT = from the edge, MISS = fetched and kept, DYNAMIC = not cached.', 'Content-hashed file names make long caching safe.', 'http:// and www. are redirected (301) to https://shivam-soni.com/.'],
  },
  'sec-robots': {
    idea: 'robots.txt groups rules by crawler name; each crawler follows the group that names it, or the * group, and extra signals repeat the "no AI training" request.',
    terms: ['crawler', 'robotstxt', 'useragent'],
    mistakes: [
      ['Putting Disallow lines under the wrong User-agent', 'Rules belong to the User-agent lines directly above them, up to the next group.'],
      ['Assuming a file is live because it is in public/', 'Request it from the live site. Dotted folders like .well-known were skipped until include-hidden-files: true.'],
    ],
    faq: [
      ['Does Disallow remove a page from Google?', 'It stops crawling, not necessarily listing. To keep a page out of results use a noindex tag instead.'],
      ['Where must robots.txt be?', 'At the root of the domain: https://shivam-soni.com/robots.txt. Nowhere else counts.'],
    ],
    recap: ['A crawler reads only its own group, else the * group.', 'Content-Signal, ai.txt, tdmrep.json and meta tags repeat the request.', 'Always check a new public file on the live site.'],
  },
  'sec-bot-wall': {
    idea: 'Only something in front of the site can refuse a request; Cloudflare blocks named AI training crawlers one by one, because blocking the whole category also caught search engines.',
    terms: ['verifiedbot', 'useragent', 'statuscode'],
    mistakes: [
      ['Blocking the whole Training category', 'Search engines that also train AI are in it. Block training crawlers by name instead.'],
      ['Trusting the User-Agent as identity', 'It is a claim. Cloudflare verifies big crawlers by where their requests come from.'],
    ],
    faq: [
      ['How do I test the rules?', 'curl -I -A "GPTBot/1.2" https://your-site should return 403; a browser or Googlebot name should return 200.'],
      ['What is AI Labyrinth?', 'A Cloudflare feature that leads bots ignoring the rules into pages of generated filler, wasting their effort instead of revealing the block.'],
    ],
    recap: ['robots.txt asks; Cloudflare enforces.', 'Block crawlers by name to keep search working.', 'Re-test with curl -A after every change.'],
  },
  'sec-secrets': {
    idea: 'Everything in a website is readable by every visitor, so publishable keys may ship but secret keys live only in each platform\'s secret store.',
    terms: ['publishablekey', 'secretkey', 'apikey', 'rls'],
    mistakes: [
      ['Hiding a secret in minified or "obfuscated" code', 'It is still downloaded and searchable. Move it to a server.'],
      ['Leaving a pasted secret in place', 'Any secret shown outside its safe is leaked: rotate it (make a new one, delete the old).'],
    ],
    faq: [
      ['Is the Supabase URL a secret?', 'No. It is an address. Protection comes from row-level security and keeping the secret key private.'],
      ['How does server code get the secret?', 'The platform injects it at run time, e.g. Deno.env in Supabase functions or env in a Cloudflare Worker.'],
    ],
    recap: ['Publishable keys identify; secret keys authorise.', 'Secrets live in GitHub Actions, Supabase and Wrangler secret stores.', 'The website calls server code, never the secret directly.'],
  },
  'sec-forms': {
    idea: 'A public form checks every request on the server: a honeypot, input checks and hashed rate limits before it sends, and DKIM in DNS proves the email is genuine.',
    terms: ['honeypot', 'hash', 'dkim', 'dmarc', 'mx'],
    mistakes: [
      ['Relying on CORS to stop abuse', 'CORS only tells browsers who may read the answer. Scripts ignore it; the server must check everything.'],
      ['Storing raw emails and IPs for rate limits', 'Store keyed hashes and delete them after a short time.'],
    ],
    faq: [
      ['Why return 200 to a bot?', 'A fake success teaches it nothing; an error tells it to try harder.'],
      ['Why did Brevo say 401 "unrecognised IP"?', 'Its IP allow-list was on, and Supabase functions run from changing addresses. The API key is the protection, so the list was switched off.'],
    ],
    recap: ['Honeypot, validation, then limits (3 per email a day, 10 per IP an hour, 250 a day).', 'RLS with no policies: only the function can use the table.', 'DKIM signs outgoing mail; MX routes incoming mail through Cloudflare.'],
  },
};
