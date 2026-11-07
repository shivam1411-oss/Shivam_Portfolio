import { code } from './util';

export const siteKb = {
  intro: 'Web development from "how does a web page reach my screen?" to security, rendering strategies and architecture. Runnable examples show a live page you can edit; others come from real projects like shops, blogs, portfolios and dashboards.',
  topics: [
    // ------------------------------------------------------------ beginner
    {
      id: 'how-the-web-works',
      level: 'beginner',
      title: 'How the web works',
      summary: 'Your browser asks a server for a page using a URL; the server sends back HTML, CSS and JavaScript, and the browser turns them into what you see.',
      body: [
        'Typing `https://shop.example.com/cart` starts a chain: **DNS** turns the name into an IP address, the browser opens a secure (**HTTPS**) connection, sends an **HTTP request** (GET /cart), and the **server** replies with a status code (200 OK, 404 Not Found, 500 Server Error) and the content.',
        'The page is built from three languages: **HTML** (structure and content), **CSS** (appearance) and **JavaScript** (behaviour). The browser downloads each, then images and fonts, and renders the page.',
      ],
      code: code`
        You type:   https://shop.example.com/cart
        DNS:        shop.example.com  →  93.184.216.34
        Request:    GET /cart HTTP/2
                    Host: shop.example.com
                    Cookie: session=abc123
        Response:   HTTP/2 200 OK
                    Content-Type: text/html
                    <!doctype html><html>…</html>
        Then:       style.css, app.js, logo.png, fonts…  →  page painted on screen
      `,
      lang: 'text',
      points: ['URL → DNS → request → response → render.', 'Status codes: 2xx ok, 3xx redirect, 4xx your mistake, 5xx server\'s.', 'HTML structure, CSS style, JS behaviour.'],
      realWorld: 'When an online shop shows "404", the server received the request but has no page at that address.',
      check: { q: 'What does DNS do?', options: ['Draws the page', 'Turns a domain name into an IP address', 'Encrypts passwords', 'Stores cookies'], answer: 1, why: 'It is the internet\'s phone book.' },
      lesson: 'big-picture',
    },
    {
      id: 'html',
      level: 'beginner',
      title: 'HTML: the structure of a page',
      summary: 'HTML marks up content with tags like <h1>, <p>, <a> and <img>. Semantic tags describe meaning, which helps search engines and screen readers.',
      body: [
        'Tags usually come in pairs (`<p>…</p>`) and can have **attributes** (`<a href="…">`). Headings go from `<h1>` (one per page) to `<h6>`. Lists use `<ul>`/`<ol>` with `<li>`; images need `alt` text describing them.',
        '**Semantic** tags like `<header>`, `<nav>`, `<main>`, `<article>` and `<footer>` say what each part is for. Edit the page and watch the preview.',
      ],
      code: code`
        <header>
          <h1>Ananya's Bakery</h1>
          <nav><a href="#menu">Menu</a> · <a href="#visit">Visit us</a></nav>
        </header>
        <main>
          <section id="menu">
            <h2>Today's bakes</h2>
            <ul>
              <li>Sourdough loaf: Rs 180</li>
              <li>Cardamom buns: Rs 60</li>
            </ul>
            <img width="240" height="120" alt="A loaf of bread on a warm background" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='120'%3E%3Crect width='240' height='120' rx='14' fill='%23f5d0a9'/%3E%3Cellipse cx='120' cy='68' rx='70' ry='34' fill='%23b7792f'/%3E%3Cpath d='M80 60q15-12 30 0M110 56q15-12 30 0M140 60q12-10 22 0' stroke='%23f5d0a9' stroke-width='4' fill='none'/%3E%3C/svg%3E">
          </section>
          <section id="visit">
            <h2>Visit us</h2>
            <p>Open <strong>7 am to 7 pm</strong>, 12 MG Road.</p>
          </section>
        </main>
        <footer><small>© 2026 Ananya's Bakery</small></footer>
      `,
      lang: 'html',
      run: true,
      points: ['Tags mark up content; attributes add details.', 'One <h1>, then h2, h3 in order.', 'Semantic tags and alt text help everyone.'],
      realWorld: 'Screen-reader users jump between headings and landmarks like <nav> and <main> to scan a page quickly.',
      check: { q: 'What is the alt attribute on an image for?', options: ['Styling', 'A text description for screen readers and when the image fails', 'The image size', 'A link'], answer: 1, why: 'It makes images accessible.' },
      lesson: 'components',
    },
    {
      id: 'css',
      level: 'beginner',
      title: 'CSS: colours, spacing and the box model',
      summary: 'CSS selects elements and sets their style. Every element is a box made of content, padding, border and margin.',
      body: [
        'A rule is **selector { property: value; }**. Select by tag (`p`), class (`.card`) or id (`#hero`). When rules conflict, the more specific one wins, and later rules beat earlier ones of equal specificity.',
        'The **box model**: content, then **padding** (inside space), **border**, **margin** (outside space). `box-sizing: border-box` makes width include padding and border, which is much easier to reason about. **CSS variables** (`--brand: teal`) keep colours consistent.',
      ],
      code: code`
        <style>
          :root { --brand: #0f766e; }
          * { box-sizing: border-box; }
          body { font-family: system-ui, sans-serif; background: #f6f7f8; padding: 16px; }
          .card { background: white; border: 1px solid #ddd; border-radius: 14px; padding: 16px; margin-bottom: 12px; max-width: 320px; }
          .card h3 { margin: 0 0 6px; color: var(--brand); }
          .price { font-size: 22px; font-weight: 800; }
          .btn { background: var(--brand); color: white; border: 0; border-radius: 999px; padding: 8px 14px; }
        </style>
        <div class="card">
          <h3>Yoga mat</h3>
          <p class="price">Rs 899</p>
          <button class="btn">Add to cart</button>
        </div>
      `,
      lang: 'html',
      run: true,
      points: ['selector { property: value }.', 'Box model: content, padding, border, margin.', 'CSS variables keep a design consistent.'],
      realWorld: 'Sports brands change one --brand colour variable to re-theme their whole site for a new season.',
      check: { q: 'Padding is the space…', options: ['Outside the border', 'Inside the border, around the content', 'Between pages', 'In the HTML'], answer: 1, why: 'Margin is outside; padding is inside.' },
      lesson: 'styling',
    },
    {
      id: 'javascript',
      level: 'beginner',
      title: 'JavaScript: making pages respond',
      summary: 'JavaScript runs in the browser to react to clicks and typing, change the page, and talk to servers.',
      body: [
        'Variables use `const` (will not be reassigned) and `let`. Functions group steps. The **DOM** is the browser\'s live model of the page: `document.querySelector(".total")` finds an element, and changing its `textContent` updates the screen.',
        '`element.addEventListener("click", handler)` runs code when something happens. Try changing the tip percentages in the example.',
      ],
      code: code`
        <p>Bill: Rs <input id="bill" type="number" value="1200" style="width:90px"></p>
        <p>
          Tip: <button data-tip="0">0%</button> <button data-tip="10">10%</button> <button data-tip="15">15%</button>
        </p>
        <h3 id="total">Total: Rs 1200</h3>
        <script>
          const bill = document.querySelector("#bill");
          const total = document.querySelector("#total");
          let tip = 0;

          function update() {
            const amount = Number(bill.value) * (1 + tip / 100);
            total.textContent = "Total: Rs " + amount.toFixed(0) + " (tip " + tip + "%)";
          }
          document.querySelectorAll("button").forEach((b) =>
            b.addEventListener("click", () => { tip = Number(b.dataset.tip); update(); })
          );
          bill.addEventListener("input", update);
        </script>
      `,
      lang: 'html',
      run: true,
      points: ['const and let declare variables.', 'querySelector finds elements in the DOM.', 'addEventListener reacts to user actions.'],
      realWorld: 'Restaurant bill-splitting tools are a few lines of JavaScript listening to inputs and updating totals.',
      check: { q: 'What is the DOM?', options: ['A database', 'The browser\'s live model of the page that JavaScript can change', 'A CSS framework', 'A server'], answer: 1, why: 'Change the DOM and the page updates.' },
      lesson: 'state',
    },
    {
      id: 'devtools-git',
      level: 'beginner',
      title: 'Developer tools and Git basics',
      summary: 'Browser DevTools let you inspect and debug any page. Git records every change to your code so you can go back and collaborate.',
      body: [
        'Press F12 (or Cmd+Option+I): **Elements** shows the HTML and CSS of anything you click, **Console** shows errors and lets you run JavaScript, **Network** lists every file downloaded with its size and time, and **Lighthouse** audits speed and accessibility.',
        '**Git** saves snapshots called **commits**. `git status` shows what changed, `git add` stages it, `git commit -m "message"` saves it, and `git push` sends it to GitHub. Every change to this portfolio is a commit you can read.',
      ],
      code: code`
        git clone https://github.com/you/portfolio.git
        cd portfolio
        # …edit index.html…
        git status                      # see changed files
        git add index.html
        git commit -m "Add contact section"
        git push                        # upload to GitHub
        git log --oneline               # history of snapshots
      `,
      lang: 'bash',
      points: ['DevTools: Elements, Console, Network, Lighthouse.', 'Commits are snapshots with messages.', 'add → commit → push.'],
      realWorld: 'Front-end developers spend much of their day in DevTools tweaking CSS live before copying it into code.',
      check: { q: 'Which DevTools panel shows how long each file took to download?', options: ['Elements', 'Console', 'Network', 'Sources'], answer: 2, why: 'Network lists every request with timings.' },
      lesson: 'welcome',
    },
    // ------------------------------------------------------------ intermediate
    {
      id: 'responsive',
      level: 'intermediate',
      title: 'Responsive layouts: Flexbox, Grid and media queries',
      summary: 'One page must work on phones, tablets and desktops. Flexbox arranges items in a row or column; Grid handles two-dimensional layouts; media queries adapt to screen size.',
      body: [
        '**Flexbox** (`display: flex`) lines items up and distributes space with `gap`, `justify-content` and `align-items`; `flex-wrap: wrap` lets them flow onto new lines. **Grid** (`display: grid`) defines rows and columns; `repeat(auto-fit, minmax(160px, 1fr))` creates as many columns as fit.',
        'Design **mobile first**: base styles for small screens, then `@media (min-width: 768px) { … }` to enhance. Always include the viewport meta tag. Drag the preview narrower by resizing your window to see cards re-flow.',
      ],
      code: code`
        <style>
          body { font-family: system-ui; margin: 12px; }
          .bar { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-top: 12px; }
          .tile { background: #e0f2fe; border-radius: 12px; padding: 14px; text-align: center; }
          @media (min-width: 600px) { .tile { background: #dcfce7; } }
        </style>
        <div class="bar"><strong>🏏 Match Centre</strong><button>Live scores</button></div>
        <div class="grid">
          <div class="tile">IND 287/4</div><div class="tile">AUS 251</div>
          <div class="tile">ENG 199/7</div><div class="tile">SA 312/6</div>
        </div>
      `,
      lang: 'html',
      run: true,
      points: ['Flexbox for one direction, Grid for two.', 'auto-fit + minmax makes responsive grids without media queries.', 'Mobile first, then min-width media queries.'],
      realWorld: 'Sports sites show one score per row on phones and four across on desktops with a single grid rule.',
      check: { q: 'Which is better for a 2-D layout of cards in rows and columns?', options: ['Flexbox only', 'CSS Grid', 'Tables', 'Absolute positioning'], answer: 1, why: 'Grid controls rows and columns together.' },
      lesson: 'responsive',
    },
    {
      id: 'modern-js',
      level: 'intermediate',
      title: 'Modern JavaScript: arrays, modules and async/await',
      summary: 'Array methods transform data cleanly, modules split code into files, and async/await makes network calls readable.',
      body: [
        '`map` (transform each item), `filter` (keep some), `reduce` (combine into one) and `find` replace most loops. Destructuring (`const { name } = user`) and spread (`[...a, x]`) make copies easy. Template literals build strings with embedded values.',
        'Network requests take time, so they return **promises**. `async`/`await` lets you write them top-to-bottom, with `try/catch` for errors. `fetch` is the built-in way to call APIs.',
      ],
      code: code`
        <pre id="out" style="font-family: ui-monospace, monospace"></pre>
        <script type="module">
          const out = document.querySelector("#out");
          const log = (...a) => (out.textContent += a.join(" ") + "\n");

          const cart = [
            { item: "Headphones", price: 2499, qty: 1 },
            { item: "Cable", price: 299, qty: 3 },
            { item: "Case", price: 799, qty: 0 },
          ];
          const inCart = cart.filter((c) => c.qty > 0);
          const lines = inCart.map(({ item, price, qty }) => item + " × " + qty + " = Rs " + price * qty);
          const total = inCart.reduce((sum, c) => sum + c.price * c.qty, 0);
          lines.forEach((l) => log(l));
          log("Total: Rs", total);

          const wait = (ms) => new Promise((r) => setTimeout(r, ms));
          async function checkStock() {
            log("Checking stock…");
            await wait(700);                 // stands in for: await fetch("/api/stock")
            log("All items in stock ✓");
          }
          checkStock();
        </script>
      `,
      lang: 'html',
      run: true,
      points: ['map, filter, reduce, find over loops.', 'Destructuring and spread for clean copies.', 'async/await with try/catch for network calls.'],
      realWorld: 'Every shopping cart total on the web is some version of filter + map + reduce.',
      check: { q: 'What does arr.filter(fn) return?', options: ['One value', 'A new array with items where fn returned true', 'The original array changed', 'A promise'], answer: 1, why: 'filter never changes the original array.' },
      lesson: 'data',
    },
    {
      id: 'npm-build',
      level: 'intermediate',
      title: 'npm, packages and build tools',
      summary: 'npm installs JavaScript packages listed in package.json. Build tools like Vite bundle and optimise your code for the browser.',
      body: [
        '`package.json` lists dependencies and scripts (`npm run dev`, `npm run build`); `package-lock.json` pins exact versions so every install is identical. `node_modules` holds the installed code and is never committed.',
        '**Vite** (used by this portfolio) serves files instantly during development with hot reload, and for production **bundles**, **minifies** and **splits** code into cached chunks. Versions follow **semver**: MAJOR.MINOR.PATCH, where a major bump may break things.',
      ],
      code: code`
        npm create vite@latest my-site -- --template react
        cd my-site
        npm install                 # reads package.json, writes package-lock.json
        npm run dev                 # dev server with hot reload
        npm run build               # optimised files in dist/

        # package.json
        {
          "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
          "dependencies": { "react": "^19.2.0" },
          "devDependencies": { "vite": "^7.0.0" }
        }
      `,
      lang: 'bash',
      points: ['package.json declares; package-lock pins.', 'Never commit node_modules.', 'Build = bundle + minify + split.'],
      realWorld: 'This portfolio runs npm run build in GitHub Actions to produce the files that GitHub Pages serves.',
      check: { q: 'What does ^19.2.0 allow npm to install?', options: ['Only 19.2.0', 'Any 19.x.y at or above 19.2.0', 'Version 20', 'Anything'], answer: 1, why: 'The caret allows minor and patch updates within major 19.' },
      lesson: 'splitting',
    },
    {
      id: 'git-ci',
      level: 'intermediate',
      title: 'Branches, pull requests and GitHub Actions',
      summary: 'Work happens on branches, is reviewed in pull requests, and is checked and deployed automatically by CI/CD pipelines.',
      body: [
        'A **branch** is an independent line of work. When ready, open a **pull request (PR)**: teammates review the diff, automated checks run, and it is **merged** into main. Merge conflicts happen when two branches change the same lines; Git asks you to choose.',
        '**GitHub Actions** runs workflows defined in `.github/workflows/*.yml` on events like push or pull_request: install, test, build and deploy. This portfolio deploys this way on every merge to main.',
      ],
      code: code`
        # .github/workflows/deploy.yml
        name: Deploy
        on:
          push:
            branches: [main]
        jobs:
          build:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v5
              - uses: actions/setup-node@v5
                with: { node-version: 22, cache: npm }
              - run: npm ci
              - run: npm test --if-present
              - run: npm run build
              - uses: actions/upload-pages-artifact@v5
                with: { path: dist }
      `,
      lang: 'yaml',
      points: ['Branch → PR → review → merge.', 'CI runs checks on every PR.', 'CD deploys automatically after merge.'],
      realWorld: 'Open-source projects require passing CI and an approving review before any PR can merge.',
      check: { q: 'Where do GitHub Actions workflows live?', options: ['package.json', '.github/workflows/', 'node_modules', 'README.md'], answer: 1, why: 'YAML files in .github/workflows.' },
      lesson: 'deploy',
    },
    {
      id: 'hosting',
      level: 'intermediate',
      title: 'Hosting, domains and HTTPS',
      summary: 'Static sites can be hosted free on GitHub Pages, Netlify, Vercel or Cloudflare Pages. A custom domain points at them with DNS records, and HTTPS is automatic.',
      body: [
        '**Static hosting** serves pre-built files from a CDN (content delivery network) close to each visitor. Dynamic sites need a server or serverless functions for things like logins and databases.',
        'A **custom domain** uses DNS records: an `A`/`AAAA` record points the root domain at the host\'s IPs; a `CNAME` points `www` at another name. Hosts issue free TLS certificates (Let\'s Encrypt) so the site loads over HTTPS.',
      ],
      code: code`
        DNS records for a portfolio on GitHub Pages
        Type    Name   Value
        A       @      185.199.108.153
        A       @      185.199.109.153
        A       @      185.199.110.153
        A       @      185.199.111.153
        CNAME   www    yourname.github.io.
        Then: repository Settings → Pages → Custom domain → "Enforce HTTPS"
      `,
      lang: 'text',
      points: ['Static hosting on a CDN is fast and often free.', 'A records for the root, CNAME for www.', 'HTTPS certificates are automatic on modern hosts.'],
      realWorld: 'This portfolio is served by GitHub Pages at a custom domain with an automatic certificate.',
      check: { q: 'Which DNS record points www.example.com at another host name?', options: ['A', 'CNAME', 'MX', 'TXT'], answer: 1, why: 'CNAME aliases one name to another.' },
      lesson: 'deploy',
    },
    // ------------------------------------------------------------ advanced
    {
      id: 'accessibility',
      level: 'advanced',
      title: 'Accessibility (a11y)',
      summary: 'Accessible sites work for everyone: keyboard users, screen-reader users, people with low vision or motion sensitivity. Most of it is good HTML.',
      body: [
        'Use real elements (`<button>`, `<a>`, `<label>`), keep a logical heading order, give images alt text, and make every action reachable by **keyboard** with a visible focus outline. Text contrast should meet WCAG AA (4.5:1 for normal text).',
        'Use ARIA only to fill gaps (`aria-label` on icon buttons, `aria-live` for updates). Respect `prefers-reduced-motion` to tone down animation, as this portfolio does. Test with the keyboard alone and a screen reader.',
      ],
      code: code`
        <style>
          button { font: inherit; padding: 8px 12px; border-radius: 8px; border: 2px solid #334155; background: white; }
          button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
          .dot { width: 14px; height: 14px; border-radius: 50%; background: #0f766e; display: inline-block; animation: pulse 1s infinite alternate; }
          @keyframes pulse { to { transform: scale(1.6); } }
          @media (prefers-reduced-motion: reduce) { .dot { animation: none; } }
        </style>
        <label for="q">Search recipes</label>
        <input id="q" placeholder="e.g. paneer">
        <button aria-label="Search">🔍</button>
        <p aria-live="polite" id="status"><span class="dot"></span> 3 results</p>
        <p><small>Press Tab to move between controls and see the focus ring.</small></p>
      `,
      lang: 'html',
      run: true,
      points: ['Semantic HTML first; ARIA second.', 'Everything works by keyboard with visible focus.', 'Enough contrast; respect reduced motion.'],
      realWorld: 'Government and banking sites must meet accessibility standards (WCAG) by law in many countries.',
      check: { q: 'An icon-only button needs…', options: ['Nothing', 'An accessible name such as aria-label', 'A bigger icon', 'A tooltip only'], answer: 1, why: 'Screen readers need text to announce.' },
      lesson: 'themes',
    },
    {
      id: 'performance',
      level: 'advanced',
      title: 'Web performance and Core Web Vitals',
      summary: 'Fast sites keep visitors. Google\'s Core Web Vitals measure loading (LCP), responsiveness (INP) and visual stability (CLS).',
      body: [
        '**LCP** (Largest Contentful Paint) should be under 2.5 s: optimise the hero image, preload key fonts, ship less JavaScript. **INP** (Interaction to Next Paint) under 200 ms: avoid long tasks on the main thread. **CLS** (Cumulative Layout Shift) under 0.1: give images width and height so the page does not jump.',
        'Techniques: **code splitting** and lazy loading (load the Python runtime only on Python lessons), modern image formats (AVIF/WebP) with `loading="lazy"`, compression, caching with hashed file names, and a CDN. Measure with Lighthouse and real-user data.',
      ],
      code: code`
        <!-- Reserve space (no layout shift) and load lazily -->
        <img src="hero.avif" width="1200" height="600" alt="Mountains at dawn" fetchpriority="high">
        <img src="gallery-1.webp" width="400" height="300" alt="Lake" loading="lazy">

        <!-- Preload the font used above the fold -->
        <link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin>

        // Load heavy code only when needed (React)
        const Editor = React.lazy(() => import("./Editor"));
      `,
      lang: 'html',
      points: ['LCP < 2.5 s, INP < 200 ms, CLS < 0.1.', 'Split and lazy-load code; optimise images.', 'Measure with Lighthouse and field data.'],
      realWorld: 'Retailers have repeatedly reported that faster pages raise conversion rates.',
      check: { q: 'Images without width/height often hurt which metric?', options: ['LCP', 'CLS', 'INP', 'DNS'], answer: 1, why: 'Content jumps when the image loads.' },
      lesson: 'performance',
    },
    {
      id: 'seo',
      level: 'advanced',
      title: 'SEO and sharing metadata',
      summary: 'Search engines and social apps read your page\'s metadata. Good titles, descriptions, structure and speed help people find and share it.',
      body: [
        'Each page needs a unique `<title>` and `<meta name="description">`. **Open Graph** and Twitter tags control the preview card when a link is shared on WhatsApp, LinkedIn or X. **Structured data** (JSON-LD) describes things like a person, product or recipe.',
        'Also: a `sitemap.xml`, a `robots.txt`, canonical URLs to avoid duplicates, descriptive link text, and fast, mobile-friendly pages. Pages you want hidden (like this Learning Lab) use `<meta name="robots" content="noindex">`.',
      ],
      code: code`
        <title>Ananya Rao · Product Designer in Bengaluru</title>
        <meta name="description" content="Portfolio of Ananya Rao: fintech and health app design case studies.">
        <link rel="canonical" href="https://ananya.design/">
        <meta property="og:title" content="Ananya Rao · Product Designer">
        <meta property="og:image" content="https://ananya.design/og.png">
        <script type="application/ld+json">
        { "@context": "https://schema.org", "@type": "Person", "name": "Ananya Rao",
          "jobTitle": "Product Designer", "url": "https://ananya.design" }
        </script>
      `,
      lang: 'html',
      points: ['Unique title and description per page.', 'Open Graph tags shape share previews.', 'Structured data, sitemaps and canonical URLs.'],
      realWorld: 'Recipe sites add structured data so search results show ratings and cooking time.',
      check: { q: 'Which tags control the preview when a link is shared on social apps?', options: ['<h1>', 'Open Graph meta tags', '<footer>', 'CSS'], answer: 1, why: 'og:title, og:image and friends.' },
    },
    {
      id: 'animation',
      level: 'advanced',
      title: 'Animation: CSS transitions, requestAnimationFrame and canvas',
      summary: 'Animate cheap properties (transform, opacity) with CSS, use requestAnimationFrame for frame-by-frame JavaScript, and canvas for thousands of moving things.',
      body: [
        'CSS **transitions** animate between states; **keyframes** run sequences. Animating `transform` and `opacity` stays smooth because the GPU can composite them without re-layout. `requestAnimationFrame` calls your function before each repaint (usually 60 times a second).',
        '**Canvas** draws pixels with JavaScript, which is ideal for particles, games and effects like this site\'s code-rain background. Pause animations when the tab is hidden and respect reduced-motion settings.',
      ],
      code: code`
        <canvas id="c" width="320" height="160" style="background:#0b1020;border-radius:12px"></canvas>
        <script>
          const ctx = document.getElementById("c").getContext("2d");
          const stars = Array.from({ length: 60 }, () => ({ x: Math.random() * 320, y: Math.random() * 160, s: 0.3 + Math.random() * 1.5 }));
          function frame() {
            ctx.fillStyle = "rgba(11,16,32,0.35)";
            ctx.fillRect(0, 0, 320, 160);
            ctx.fillStyle = "#e0f2fe";
            for (const st of stars) {
              st.x -= st.s;
              if (st.x < 0) { st.x = 320; st.y = Math.random() * 160; }
              ctx.fillRect(st.x, st.y, st.s * 1.5, st.s * 1.5);
            }
            requestAnimationFrame(frame);
          }
          frame();
        </script>
      `,
      lang: 'html',
      run: true,
      points: ['Animate transform and opacity.', 'requestAnimationFrame for JS animation loops.', 'Canvas for many moving pixels.'],
      realWorld: 'Browser games and data-art sites render thousands of particles per frame on canvas.',
      check: { q: 'Which properties animate most smoothly?', options: ['width and height', 'transform and opacity', 'margin and top', 'font-size'], answer: 1, why: 'They avoid layout and can be composited by the GPU.' },
      lesson: 'canvas',
    },
    {
      id: 'web-apis',
      level: 'advanced',
      title: 'Browser storage, Web Workers and offline apps',
      summary: 'Browsers can store data, run code off the main thread, and even work offline: the building blocks of app-like websites.',
      body: [
        '**localStorage** keeps small key-value strings per site (this Lab saves your progress there); **IndexedDB** stores larger structured data; cookies are sent to the server with every request. **Web Workers** run heavy code (like the Python interpreter here) without freezing the page.',
        '**Service workers** sit between the page and the network to cache files, enabling offline use and installable **Progressive Web Apps (PWAs)**. **WebAssembly** runs compiled languages like C, Rust or Python (via Pyodide) at near-native speed.',
      ],
      code: code`
        <p>Visits on this page: <b id="n">?</b></p>
        <button id="heavy">Count primes in a worker</button> <span id="res"></span>
        <script>
          let n = 1;
          try { n = Number(localStorage.getItem("kb-demo-visits") || 0) + 1; localStorage.setItem("kb-demo-visits", n); } catch {}
          document.getElementById("n").textContent = n;

          const src = "onmessage = (e) => { let c = 0; for (let i = 2; i < e.data; i++) { let p = true; for (let d = 2; d * d <= i; d++) if (i % d === 0) { p = false; break; } if (p) c++; } postMessage(c); }";
          const worker = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
          worker.onmessage = (e) => (document.getElementById("res").textContent = e.data + " primes below 2,000,000 (page stayed responsive)");
          document.getElementById("heavy").onclick = () => { document.getElementById("res").textContent = "working…"; worker.postMessage(2000000); };
        </script>
      `,
      lang: 'html',
      run: true,
      points: ['localStorage for small data; IndexedDB for more.', 'Web Workers keep the page responsive.', 'Service workers enable offline PWAs.'],
      realWorld: 'Note-taking web apps store notes in IndexedDB and sync later, so they work on a train with no signal.',
      check: { q: 'Why run heavy calculations in a Web Worker?', options: ['They become free', 'The page stays responsive while it works', 'Workers have more memory', 'It is required'], answer: 1, why: 'The main thread stays free for clicks and painting.' },
      lesson: 'python-browser',
    },
    // ------------------------------------------------------------ expert
    {
      id: 'security',
      level: 'expert',
      title: 'Web security essentials',
      summary: 'The big risks: cross-site scripting (XSS), leaked secrets, misconfigured CORS and cookies, and vulnerable dependencies. Defence is layered.',
      body: [
        '**XSS**: never insert untrusted text as HTML (`innerHTML`); use `textContent` or a framework that escapes by default, as React does. A **Content-Security-Policy** header limits where scripts may load from. **CSRF** is blocked with SameSite cookies and tokens.',
        'Anything shipped to the browser is public: never put API secrets in front-end code (this portfolio\'s AI chat calls a server-side function instead). Configure **CORS** to allow only trusted origins, mark cookies `HttpOnly; Secure; SameSite`, keep dependencies updated (`npm audit`), and serve everything over HTTPS.',
      ],
      code: code`
        // ❌ XSS: a comment like <img src=x onerror="steal()"> runs as code
        commentBox.innerHTML = userComment;
        // ✅ Safe: shown as text
        commentBox.textContent = userComment;

        // Response headers
        Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self' https://images.example.com
        Set-Cookie: session=…; HttpOnly; Secure; SameSite=Lax
        Access-Control-Allow-Origin: https://app.example.com

        // ❌ Never in front-end code
        const OPENAI_KEY = "sk-…";   // anyone can read it in DevTools
      `,
      lang: 'js',
      points: ['Escape output; avoid innerHTML with user data.', 'CSP, secure cookies and strict CORS.', 'Secrets stay on the server.'],
      realWorld: 'Leaked API keys found in public JavaScript bundles are a routine cause of large cloud bills and breaches.',
      check: { q: 'Is an API key safe in a minified JavaScript bundle?', options: ['Yes, minification hides it', 'No, anything sent to the browser can be read', 'Only on HTTPS', 'Only if base64-encoded'], answer: 1, why: 'Browsers can always read what they run.' },
      lesson: 'chat',
    },
    {
      id: 'rendering-strategies',
      level: 'expert',
      title: 'Rendering strategies: CSR, SSR, SSG and islands',
      summary: 'Where HTML is produced changes speed, SEO and cost. Pick per page: static, server-rendered, client-rendered or a mix.',
      body: [
        '**CSR** (client-side rendering): the browser downloads JavaScript that builds the page, which suits app-like tools (this Lab). **SSG** (static site generation): HTML built at deploy time, fastest for content that rarely changes. **SSR** (server-side rendering): HTML built per request for fresh, personalised pages, then **hydrated** to become interactive.',
        '**Islands architecture** (Astro) ships static HTML with small interactive islands; **React Server Components** (Next.js) stream server-rendered parts and send less JavaScript. **Edge rendering** runs SSR close to users. Choose by how often content changes and how interactive it is.',
      ],
      code: code`
        Page type                 Strategy       Why
        Blog post / docs          SSG            rarely changes, must be fast and indexable
        Product page (price/stock) SSR / ISR     fresh data + SEO
        Account dashboard         CSR            private, highly interactive
        Marketing page + 1 form   Islands        mostly static, tiny interactive part
      `,
      lang: 'text',
      points: ['CSR, SSR, SSG, islands, RSC.', 'Hydration makes server HTML interactive.', 'Choose per page, not per site.'],
      realWorld: 'News sites pre-render articles (SSG) but server-render live blogs during elections.',
      check: { q: 'A documentation site that changes weekly is best served by…', options: ['CSR', 'SSG', 'A desktop app', 'SSR on every request'], answer: 1, why: 'Pre-built static HTML is fastest and cheapest.' },
    },
    {
      id: 'browser-pipeline',
      level: 'expert',
      title: 'How browsers render: the critical path',
      summary: 'Browsers parse HTML into the DOM, CSS into the CSSOM, combine them, calculate layout, paint pixels and composite layers. Knowing this explains most performance advice.',
      body: [
        'Steps: **parse** HTML (DOM) and CSS (CSSOM) → **style** → **layout** (sizes and positions) → **paint** → **composite** layers on the GPU. CSS blocks rendering and normal scripts block parsing, so use `defer`/`type="module"` and keep critical CSS small.',
        'Changing layout properties (width, top) forces re-layout of much of the page; reading layout (offsetHeight) right after writing styles causes **layout thrashing**. The main thread also runs your JavaScript, so long tasks (>50 ms) delay clicks.',
      ],
      code: code`
        // ❌ Layout thrashing: read/write/read/write forces a layout each time
        for (const el of items) {
          el.style.height = el.offsetHeight + 10 + "px";
        }

        // ✅ Batch reads, then writes
        const heights = items.map((el) => el.offsetHeight);
        items.forEach((el, i) => (el.style.height = heights[i] + 10 + "px"));

        // ✅ Animate with transform (composite only)
        el.style.transform = "translateX(100px)";
      `,
      lang: 'js',
      points: ['DOM + CSSOM → layout → paint → composite.', 'Use defer/module scripts; keep critical CSS small.', 'Batch reads and writes; avoid long tasks.'],
      realWorld: 'Infinite-scroll feeds stay smooth by measuring in batches and animating only transforms.',
      check: { q: 'Which change triggers only compositing (cheapest)?', options: ['width', 'transform', 'font-size', 'padding'], answer: 1, why: 'Transforms do not affect layout.' },
    },
    {
      id: 'testing-quality',
      level: 'expert',
      title: 'Testing and code quality at scale',
      summary: 'Professional front-ends combine type checking, linting, unit and component tests, end-to-end tests and visual checks, all automated in CI.',
      body: [
        '**TypeScript** catches type errors before running. **ESLint** and **Prettier** enforce rules and formatting. **Unit/component tests** (Vitest, Testing Library) check logic and UI pieces; **end-to-end tests** (Playwright) drive a real browser through user journeys; **visual regression** tests compare screenshots.',
        'The testing pyramid: many fast unit tests, fewer integration tests, a few E2E tests for critical flows. Add accessibility checks (axe) and performance budgets to CI so quality cannot silently drop.',
      ],
      code: code`
        // checkout.spec.ts (Playwright end-to-end test)
        import { test, expect } from "@playwright/test";

        test("guest can buy a mug", async ({ page }) => {
          await page.goto("/");
          await page.getByRole("link", { name: "Mugs" }).click();
          await page.getByRole("button", { name: "Add to cart" }).first().click();
          await page.getByRole("link", { name: /cart \(1\)/i }).click();
          await page.getByLabel("Email").fill("asha@example.com");
          await page.getByRole("button", { name: "Pay now" }).click();
          await expect(page.getByText("Order confirmed")).toBeVisible();
        });
      `,
      lang: 'js',
      points: ['Types, lint, unit, E2E, visual tests.', 'Pyramid: many fast tests, few slow ones.', 'Automate quality gates in CI.'],
      realWorld: 'This Learning Lab\'s lessons are verified with Playwright tests that run every example and exercise in a real browser.',
      check: { q: 'Which test type drives a real browser through a full user journey?', options: ['Unit', 'Lint', 'End-to-end', 'Type check'], answer: 2, why: 'E2E tests behave like a real user.' },
      lesson: 'python-tests',
    },
    {
      id: 'architecture',
      level: 'expert',
      title: 'Front-end architecture and scaling teams',
      summary: 'Large front-ends need design systems, clear boundaries, monitoring and sometimes multiple deployable parts.',
      body: [
        'A **design system** (tokens, components, guidelines) keeps hundreds of screens consistent. **Monorepos** (pnpm workspaces, Turborepo, Nx) share code between apps; **micro-frontends** let teams deploy parts independently, at the cost of complexity.',
        'In production, add **observability**: error tracking (Sentry), real-user monitoring of Web Vitals, feature flags for safe rollouts, and analytics that respect privacy. Document decisions in ADRs (architecture decision records) so future developers know why.',
      ],
      code: code`
        apps/
          shop/            # customer site (Next.js)
          admin/           # internal dashboard (Vite + React)
        packages/
          ui/              # design-system components: Button, Card, Modal
          tokens/          # colours, spacing, typography as CSS variables
          api-client/      # typed API calls shared by both apps
        turbo.json         # cached builds: only rebuild what changed
        docs/adr/0007-use-feature-flags-for-releases.md
      `,
      lang: 'text',
      points: ['Design systems keep UIs consistent.', 'Monorepos share code; micro-frontends split deployments.', 'Monitor errors and real-user performance.'],
      realWorld: 'Large companies maintain public design systems (for example Material, Carbon and Polaris) used by thousands of developers.',
      check: { q: 'What does a design system mainly provide?', options: ['Hosting', 'Shared tokens, components and guidelines for consistent UI', 'A database', 'Faster DNS'], answer: 1, why: 'It is the single source of UI truth.' },
    },
  ],
};
