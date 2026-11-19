import { code } from './util';

export const securityKb = {
  intro: 'Delivering and protecting a website, from what DNS does to running a site behind Cloudflare with bot rules, secret keys and abuse-proof forms. Examples come from shops, blogs, banks and small businesses as well as this site.',
  topics: [
    // ------------------------------------------------------------ beginner
    {
      id: 'dns-basics',
      level: 'beginner',
      title: 'DNS: from a name to an address',
      summary: 'DNS turns a domain name into the IP address a browser connects to. The domain\'s nameservers hold the official records.',
      body: [
        'Computers connect by number. **DNS** (the Domain Name System) is the lookup that turns `example.com` into an address like `93.184.215.14`. Your browser asks a resolver, which asks the domain\'s **nameservers**, which hold its records.',
        'The common records: **A** (an IPv4 address), **AAAA** (IPv6), **CNAME** (another name to look up instead), **MX** (where email for the domain goes) and **TXT** (free text, used to prove ownership and for email security).',
      ],
      code: code`
        $ dig +short example-shop.in NS
        ns1.registrar-dns.net.
        $ dig +short example-shop.in A
        203.0.113.20
        $ dig +short www.example-shop.in CNAME
        example-shop.in.
      `,
      lang: 'bash',
      points: ['DNS maps names to addresses.', 'Nameservers hold a domain\'s official records.', 'A, AAAA, CNAME, MX and TXT are the records you will meet most.'],
      realWorld: 'A bakery moves its online shop to a new host: it changes one A record, and within minutes most customers reach the new server without noticing.',
      check: { q: 'Which record says where email for a domain is delivered?', options: ['A', 'CNAME', 'MX', 'TXT'], answer: 2, why: 'MX = mail exchanger.' },
      lesson: 'sec-journey',
    },
    {
      id: 'https-basics',
      level: 'beginner',
      title: 'HTTPS and certificates',
      summary: 'HTTPS encrypts everything between browser and server and proves the server is the real owner of the name, using a certificate.',
      body: [
        'With plain **HTTP**, anyone on the path (public Wi-Fi, a network provider) can read or change the page. **HTTPS** wraps it in TLS encryption, and the server shows a **certificate** signed by a trusted authority, proving it is allowed to use that domain name.',
        'Today certificates are free and renewed automatically (Let\'s Encrypt, or Cloudflare and GitHub Pages do it for you). Every site should be HTTPS only, with plain http:// redirected.',
      ],
      code: code`
        $ curl -I http://example-shop.in/
        HTTP/1.1 301 Moved Permanently
        location: https://example-shop.in/
      `,
      lang: 'bash',
      points: ['HTTPS = encryption + proof of identity.', 'Certificates are free and automatic now.', 'Redirect http:// to https:// with a 301.'],
      realWorld: 'A customer on café Wi-Fi logs in to a bank. With HTTPS, nobody else on the network can see the password.',
      check: { q: 'What does the certificate prove?', options: ['The site is fast', 'The server is allowed to use that domain name', 'The site has no bugs', 'The visitor is human'], answer: 1, why: 'It is signed by an authority that checked control of the domain.' },
      lesson: 'sec-edge',
    },
    {
      id: 'status-codes',
      level: 'beginner',
      title: 'Status codes and headers',
      summary: 'Every response starts with a three-digit status code and carries headers that describe it. Together they explain what happened.',
      body: [
        '**2xx** success (200 OK). **3xx** go elsewhere (301 moved permanently, 302 temporarily). **4xx** your request was refused (400 bad input, 401 not signed in, 403 forbidden, 404 not found, 429 too many requests). **5xx** the server failed (500, 502, 503).',
        '**Headers** are labelled lines: `content-type` (what it is), `cache-control` (how long it may be kept), `location` (where a redirect goes), `server` (who answered). `curl -I` prints them; so does the Network tab in the browser\'s developer tools.',
      ],
      code: code`
        HTTP/2 429
        content-type: application/json
        retry-after: 60

        {"error":"Too many requests. Please try again later."}
      `,
      lang: 'text',
      points: ['4xx = the request was refused; 5xx = the server failed.', '403 forbidden, 429 too many, 301 moved.', 'Headers say who answered and how to treat the response.'],
      realWorld: 'A ticket site under heavy demand answers 429 to people refreshing too fast, instead of falling over with 500s for everyone.',
      check: { q: 'A login page says you must sign in first. Which code fits?', options: ['200', '301', '401', '503'], answer: 2, why: '401 = not authenticated.' },
      lesson: 'sec-edge',
    },
    // ------------------------------------------------------------ intermediate
    {
      id: 'reverse-proxy',
      level: 'intermediate',
      title: 'Reverse proxies and CDNs',
      summary: 'A reverse proxy receives every request for a site before the real server does; a CDN is a worldwide network of them that also keeps copies close to visitors.',
      body: [
        'With Cloudflare\'s proxy on, DNS returns Cloudflare\'s addresses. The visitor connects to the nearest Cloudflare data centre, which can answer from cache, block the request, or fetch from the **origin** (where the site really lives).',
        'Benefits: the origin\'s address is hidden, attacks and floods are absorbed at the edge, files load from nearby, and rules (redirects, bot blocking, security headers) apply without touching the site\'s code.',
      ],
      code: code`
        Visitor ──► Cloudflare edge (Mumbai) ──► Origin (GitHub Pages)
                     │ cache HIT? serve here
                     │ blocked bot? 403 here
                     └ otherwise fetch from origin
      `,
      lang: 'text',
      points: ['Proxied DNS = visitors meet the proxy first.', 'The origin is hidden behind it.', 'Caching, blocking and redirects happen at the edge.'],
      realWorld: 'A news site survives a sudden traffic spike from a viral story because the CDN serves cached copies; the origin sees a fraction of the load.',
      check: { q: 'With the proxy on, which IP does DNS give visitors?', options: ['The origin\'s', 'The proxy\'s', 'The visitor\'s own', 'None'], answer: 1, why: 'That is how every request reaches the proxy first.' },
      lesson: 'sec-journey',
    },
    {
      id: 'caching',
      level: 'intermediate',
      title: 'Caching that never serves stale code',
      summary: 'cache-control says how long a response may be kept; content-hashed file names let static files be cached for a long time safely.',
      body: [
        '`cache-control: max-age=14400` lets browsers and CDNs reuse a response for four hours. That is great for speed, and dangerous if the file changes, because visitors would keep the old one.',
        'Build tools like Vite solve this by naming files after their content (`main-DYKZSKHQ.js`). A change produces a new name, and the HTML (cached briefly or not at all) points to it. Old copies are simply never asked for again.',
      ],
      code: code`
        index.html              cache-control: max-age=600      (10 minutes)
        assets/main-DYKZ….js    cache-control: max-age=14400    (4 hours; new name on change)
        cf-cache-status: HIT | MISS | DYNAMIC | EXPIRED | BYPASS
      `,
      lang: 'text',
      points: ['Cache long only what is renamed when it changes.', 'Keep HTML short-lived so new builds appear quickly.', 'cf-cache-status shows what Cloudflare did.'],
      realWorld: 'An online store caches product images for a month; when a photo changes, the new file gets a new name, so nobody sees the old one.',
      check: { q: 'Why can main-DYKZSKHQ.js be cached for hours?', options: ['It never changes', 'A changed file gets a different name, so the old name is never requested again', 'Browsers ignore cache-control', 'It is small'], answer: 1, why: 'Content-hashed names make stale copies harmless.' },
      lesson: 'sec-edge',
    },
    {
      id: 'robots-rules',
      level: 'intermediate',
      title: 'robots.txt and AI signals',
      summary: 'robots.txt groups Allow and Disallow rules by crawler name; Content-Signal, ai.txt, TDM and meta tags state how content may be used.',
      body: [
        'Each group starts with one or more `User-agent:` lines and is followed by rules. A crawler uses the group that names it, or `*`. The most specific path rule wins within a group.',
        'Newer signals cover AI: `Content-Signal: search=yes, ai-input=yes, ai-train=no`, an `ai.txt` file, the EU text-and-data-mining reservation (`/.well-known/tdmrep.json` and a `tdm-reservation` meta tag), and `<meta name="robots" content="noai, noimageai">`.',
      ],
      code: code`
        User-agent: *
        Content-Signal: search=yes, ai-input=yes, ai-train=no
        Disallow: /checkout/
        Allow: /

        User-agent: GPTBot
        User-agent: CCBot
        Disallow: /
      `,
      lang: 'text',
      points: ['One group per crawler; * for the rest.', 'Disallow stops crawling, not necessarily listing (use noindex for that).', 'AI signals are requests, not enforcement.'],
      realWorld: 'A recipe blog lets Google and Bing index everything, keeps crawlers out of its admin pages, and opts out of AI training.',
      check: { q: 'Which line asks AI models not to train on the content while allowing search?', options: ['Disallow: /', 'Content-Signal: search=yes, ai-train=no', 'Allow: /ai', 'noindex'], answer: 1, why: 'Content signals separate search, AI input and AI training.' },
      lesson: 'sec-robots',
    },
    {
      id: 'secret-keys',
      level: 'intermediate',
      title: 'Publishable and secret keys',
      summary: 'Publishable keys identify a project and may be in a website; secret keys authorise anything and must only live on servers.',
      body: [
        'Anything a website ships is readable by its visitors. Services designed for the web therefore issue a **publishable key** (Supabase anon key, Razorpay `key_id`, Stripe `pk_…`) whose power is limited on the service side, and a **secret key** (`sb_secret_…`, Razorpay key secret, Stripe `sk_…`).',
        'Secrets live in the platform where the server code runs: GitHub Actions secrets, Supabase function secrets, Cloudflare Worker secrets, environment variables on a server. A leaked secret is rotated, not hidden.',
      ],
      code: code`
        # Cloudflare Worker
        npx wrangler secret put ANTHROPIC_API_KEY

        # Supabase Edge Function
        supabase secrets set BREVO_API_KEY=xkeysib-…

        # GitHub Actions: Settings → Secrets and variables → Actions
      `,
      lang: 'bash',
      points: ['Publishable = identify, secret = authorise.', 'Every platform has a secret store; use it.', 'Rotate any secret that was ever exposed.'],
      realWorld: 'A start-up commits a payment secret to a public repository; bots find it within minutes. Rotating it at once is the only fix.',
      check: { q: 'Which key may appear in a website?', options: ['Stripe sk_live_…', 'Supabase sb_secret_…', 'Razorpay key_id', 'An email API key'], answer: 2, why: 'key_id identifies the account; the secret stays on the server.' },
      lesson: 'sec-secrets',
    },
    // ------------------------------------------------------------ advanced
    {
      id: 'bot-management',
      level: 'advanced',
      title: 'Bot management at the edge',
      summary: 'Edge networks identify crawlers by verified network origin and behaviour, then allow, challenge or block them by rule.',
      body: [
        'A User-Agent is a self-declared name. CDNs like Cloudflare verify large crawlers by checking that requests come from the operator\'s published IP ranges or reverse DNS, and score other traffic by behaviour.',
        'Rules can target categories (search, training, agents) or individual crawlers. Categories are convenient but blunt: some operators use one crawler for both search and training, so a category block can remove you from search. Name-by-name rules, tested with `curl -A`, avoid that.',
      ],
      code: code`
        curl -s -o /dev/null -w "%{http_code}\n" -A "GPTBot/1.2" https://example-shop.in/   # expect 403
        curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0" https://example-shop.in/  # expect 200
      `,
      lang: 'bash',
      points: ['Identity comes from verification, not the User-Agent.', 'Category rules can catch search engines.', 'Test every rule change from outside.'],
      realWorld: 'A travel site blocks scrapers copying its prices while keeping Google Search and price-comparison partners allowed.',
      check: { q: 'What is the risk of blocking a whole "AI training" category?', options: ['None', 'Search engines that also train may be blocked', 'It is slower', 'It blocks humans'], answer: 1, why: 'Some crawlers serve both purposes.' },
      lesson: 'sec-bot-wall',
    },
    {
      id: 'form-abuse',
      level: 'advanced',
      title: 'Protecting public forms',
      summary: 'Public forms are abused by scripts; server-side checks (honeypot, validation, rate limits) stop them, and CORS does not.',
      body: [
        'Any form that sends email, creates records or costs money will be scripted. **CORS** only controls which web pages may read a response in a browser; a script ignores it. Every check must run on the server for every request.',
        'Layers: a **honeypot** field (bots fill it), input validation, **rate limits** per address, per IP and in total, and, for high-value forms, a challenge such as Cloudflare Turnstile. Record what you need for limits as keyed hashes, and expire them.',
      ],
      code: code`
        if (body.company) return ok();                       // honeypot: fake success
        if (!validEmail(email)) return status(400);
        if (await countRecent(emailHash, '1 day') >= 3) return status(429);
        if (await countRecent(ipHash, '1 hour') >= 10) return status(429);
        await send(); await record(emailHash, ipHash);
      `,
      lang: 'js',
      points: ['CORS is not a lock.', 'Honeypot, validation and rate limits on the server.', 'Store hashes, not raw personal data, and expire them.'],
      realWorld: 'A clinic\'s appointment form was used to send thousands of spam confirmations until a per-IP limit and honeypot were added.',
      check: { q: 'Why does a bot get 200 when it fills the honeypot?', options: ['A mistake', 'So it does not learn it was detected', 'It is required by HTTP', 'To save money'], answer: 1, why: 'An error would tell it to adapt.' },
      lesson: 'sec-forms',
    },
    // ------------------------------------------------------------ expert
    {
      id: 'email-auth',
      level: 'expert',
      title: 'SPF, DKIM and DMARC',
      summary: 'Three DNS-published policies let receiving servers verify that email claiming to be from a domain really is, and decide what to do when it is not.',
      body: [
        '**SPF** (a TXT record) lists the servers allowed to send for the domain. **DKIM** signs each message; the receiver fetches the public key from `selector._domainkey.domain` and checks the signature. **DMARC** (`_dmarc.domain`) requires that SPF or DKIM pass *and align* with the visible From domain, and says what to do otherwise: `p=none` (just report), `quarantine` or `reject`.',
        'Start at `p=none` with reports (`rua=`) to see who sends as you, fix every legitimate sender, then move to `quarantine` and finally `reject`.',
      ],
      code: code`
        example-shop.in.                 TXT   "v=spf1 include:_spf.mailprovider.com ~all"
        s1._domainkey.example-shop.in.   CNAME s1.example-shop.dkim.mailprovider.com.
        _dmarc.example-shop.in.          TXT   "v=DMARC1; p=quarantine; rua=mailto:dmarc@example-shop.in"
      `,
      lang: 'text',
      points: ['SPF = allowed senders; DKIM = signature; DMARC = policy and alignment.', 'DKIM keys are published in DNS, often as CNAMEs to the provider.', 'Move DMARC from none to reject gradually.'],
      realWorld: 'A bank moves to DMARC p=reject; phishing emails forging its domain stop reaching customers\' inboxes.',
      check: { q: 'What does DMARC add on top of SPF and DKIM?', options: ['Encryption', 'Alignment with the From domain and a policy for failures', 'Faster delivery', 'Attachments'], answer: 1, why: 'It ties the checks to the visible sender and says what to do.' },
      lesson: 'sec-forms',
    },
    {
      id: 'rls-defaults',
      level: 'expert',
      title: 'Locked-by-default databases',
      summary: 'With row-level security on and no policies, a table is closed to public keys; only trusted server code with the secret key can use it.',
      body: [
        'In Postgres-backed services like Supabase, the browser talks to the database with a publishable key. **Row-level security** decides, row by row, what that key may do. Enabling RLS with *no* policies denies everything to it.',
        'Use that for internal tables (rate limits, audit logs, payment records written by webhooks): the website never touches them, and server functions use the secret key, which bypasses RLS. Add narrow policies only for what the browser truly needs.',
      ],
      code: code`
        create table public.audit_log (id bigint generated always as identity primary key,
                                       event text not null, at timestamptz default now());
        alter table public.audit_log enable row level security;
        -- no policies: anon and authenticated users can do nothing here
      `,
      lang: 'sql',
      points: ['RLS on + no policies = closed to the browser.', 'Server code uses the secret key, which bypasses RLS.', 'Grant the browser only what it needs, row by row.'],
      realWorld: 'A fintech app keeps its fraud-check records in an RLS table with no policies, so a leaked publishable key reveals nothing.',
      check: { q: 'RLS is on and the table has no policies. What can the publishable key do with it?', options: ['Everything', 'Read only', 'Nothing', 'Insert only'], answer: 2, why: 'No policy grants anything.' },
      lesson: 'sec-forms',
    },
    {
      id: 'incident-debugging',
      level: 'expert',
      title: 'Debugging a failed integration from the server side',
      summary: 'When a server-to-server call fails, the browser only sees a generic error; the function\'s own logs show the provider\'s real answer.',
      body: [
        'A well-built function returns a safe, generic message to the browser ("could not send, try later") and logs the details. So the first step is always the server log: the provider\'s status code and message usually name the cause.',
        'Common causes: a wrong key type (an SMTP key where an API key is needed), an IP allow-list at the provider (serverless platforms use changing addresses), a missing secret, an unverified sender domain, or a timeout. Fix one, then send one real test and read the log again.',
      ],
      code: code`
        console.error('Provider rejected the email', status, text);
        // log: Provider rejected the email 401
        //      {"message":"We have detected you are using an unrecognised IP address …","code":"unauthorized"}
      `,
      lang: 'js',
      points: ['Users see a generic error; logs hold the truth.', '401 from a provider = credentials or allow-list.', 'Change one thing, test once, read the log.'],
      realWorld: 'An order-confirmation function stops working after moving hosts: the log shows the email provider\'s IP allow-list rejecting the new addresses.',
      check: { q: 'A send fails with 500 in the browser. What do you check first?', options: ['The CSS', 'The function\'s server log for the provider\'s real response', 'The DNS TTL', 'Clear the browser cache'], answer: 1, why: 'The browser only gets the safe summary.' },
      lesson: 'sec-forms',
    },
  ],
};
