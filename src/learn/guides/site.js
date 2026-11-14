// Beginner guide for each "Learn the Code" lesson (same shape as guides/python.js).

export const siteGuide = {
  'big-picture': {
    idea: 'You write many small source files; a build tool (Vite) turns them into the few optimised files the browser actually downloads.',
    terms: ['html', 'react', 'vite', 'npm', 'bundle'],
    mistakes: [
      ['Editing files in dist/ by hand', 'dist/ is rebuilt every time. Change the files in src/ and rebuild.'],
      ['Opening index.html straight from the folder and seeing a blank page', 'Run npm run dev (or npm run preview after a build); the site needs a local server.'],
    ],
    faq: [
      ['Do I need to know JavaScript to change my site?', 'For text and numbers, no: edit src/data/content.js. For layout and features, the lessons ahead show you how the code works.'],
      ['What is node_modules?', 'The libraries the site uses, downloaded by npm install. Never edit or commit it; it can always be re-downloaded.'],
    ],
    recap: ['index.html has one empty div; React fills it.', 'npm run build turns src/ into dist/.', 'Content lives in src/data/, components in src/components/.'],
  },
  components: {
    idea: 'The page is a tree of components, and props pass information from a parent component down to its children.',
    terms: ['component', 'props', 'jsx'],
    mistakes: [
      ['Lower-case component names: <hero />', 'Components start with a capital letter: <Hero />. Lower-case means a plain HTML tag.'],
      ['Trying to change a prop inside the child', 'Props are read-only. Ask the parent to change it by calling a function it passed down.'],
    ],
    faq: [
      ['How small should a component be?', 'One clear job. If a file is hard to name or very long, it probably wants splitting.'],
      ['What are the curly brackets in JSX?', 'They switch from HTML-like markup back to JavaScript: {balance} shows a value, onClick={open} passes a function.'],
    ],
    recap: ['A component is a function that returns what to show.', 'Props flow down; events flow up through functions.', 'Shared state lives in the closest common parent.'],
  },
  state: {
    idea: 'State is what a component remembers; changing it with a setter makes React redraw just that part of the page.',
    terms: ['state', 'hook', 'effect', 'render'],
    mistakes: [
      ['Changing state directly: values.balance = 5', 'Always use the setter with a new value: setValues({ ...values, balance: 5 }).'],
      ['Forgetting clean-up in useEffect', 'Return a function that removes listeners and stops loops, or they pile up.'],
    ],
    faq: [
      ['Why not just use a normal variable?', 'A normal variable resets on every render and does not trigger an update; state survives and redraws.'],
      ['What is the [] at the end of useEffect?', 'The list of values the effect depends on. [] means run once when the component appears.'],
    ],
    recap: ['useState gives a value and a setter.', 'useEffect runs side effects after drawing, with clean-up.', 'useRef remembers without redrawing.'],
  },
  data: {
    idea: 'Text and numbers live in plain data files, and components loop over them, so content changes never touch the layout.',
    terms: ['component', 'props'],
    mistakes: [
      ['Breaking the data file with a missing comma or quote', 'Each object and item is separated by a comma, and text is in quotes. The build will point to the line.'],
      ['Forgetting key= when mapping a list', 'React needs a unique key on each item: key={job.period}.'],
    ],
    faq: [
      ['Where do I change my job title?', 'In the experience list in src/data/content.js; the timeline updates itself.'],
      ['Why separate data from components?', 'You can update content safely without risking the design, and reuse the same data in several places.'],
    ],
    recap: ['content.js, impact.js and playbook.js hold the content.', 'Components use .map() to turn lists into page sections.', 'Edit data, not layout, for content changes.'],
  },
  styling: {
    idea: 'Tailwind classes style elements right in the markup, and CSS variables let one class switch every colour between light and dark.',
    terms: ['tailwind', 'css', 'cssvar'],
    mistakes: [
      ['Building class names from pieces: "bg-" + colour', 'Tailwind only finds full class names written in the code. Write bg-accent in full.'],
      ['Hard-coding colours like text-black', 'Use the theme tokens (text-fg, bg-surface) so dark mode works.'],
    ],
    faq: [
      ['Is it messy to have so many classes?', 'It looks busy at first, but everything about an element is in one place and there are no stray CSS files to keep in sync.'],
      ['Where do I change the brand colour?', 'The --accent variables at the top of src/index.css, once for light and once for dark.'],
    ],
    recap: ['Each Tailwind class does one thing (p-4, rounded-xl, text-fg).', 'Colours are CSS variables, redefined under .dark.', '@utility creates your own classes, like glass.'],
  },
  themes: {
    idea: 'One dark class on the page decides the theme; a tiny script picks it before the page appears, and the toggle saves your choice.',
    terms: ['localstorage', 'mediaquery', 'viewtransition'],
    mistakes: [
      ['Setting the theme in React only', 'React loads a moment later, causing a flash of the wrong theme; the head script avoids that.'],
      ['Ignoring the visitor\'s system setting', 'Without a saved choice, follow prefers-color-scheme.'],
    ],
    faq: [
      ['Why does the circle animation not happen on my phone?', 'Phones switch instantly because full-page snapshots are slow there.'],
      ['How do I reset to the system theme?', 'Clear the saved "theme" value (the storage inspector in the Welcome screen lesson can do it).'],
    ],
    recap: ['The .dark class on <html> switches all colour variables.', 'A head script chooses the theme before first paint.', 'The toggle saves your choice in localStorage.'],
  },
  animation: {
    idea: 'With Motion you describe where something starts and ends, and the library animates between them.',
    terms: ['motion', 'reducedmotion'],
    mistakes: [
      ['Animating width, height or blur', 'Animate transform (x, y, scale, rotate) and opacity; they are cheap for the browser.'],
      ['Animations that replay on every scroll', 'viewport={{ once: true }} plays an entrance once.'],
    ],
    faq: [
      ['What is an easing?', 'The speed curve of an animation. The site\'s ease starts fast and settles gently.'],
      ['Do animations hurt accessibility?', 'They can. The site honours the reduced-motion setting and turns effects off for people who ask.'],
    ],
    recap: ['initial → animate (or whileInView) describes the motion.', 'Stagger plays children one after another.', 'Respect prefers-reduced-motion.'],
  },
  canvas: {
    idea: 'A canvas is one element you paint pixels on; an animation loop updates positions and redraws, usually 60 times a second.',
    terms: ['canvas', 'raf', 'dpr'],
    mistakes: [
      ['Starting a loop and never stopping it', 'Cancel it with cancelAnimationFrame in the effect\'s clean-up.'],
      ['A blurry canvas on sharp screens', 'Size it by devicePixelRatio and scale the drawing (setTransform), capped for speed.'],
    ],
    faq: [
      ['Why not animate HTML elements?', 'Thousands of moving elements would be slow; one canvas redraw is cheap.'],
      ['What is a frame budget?', 'At 60 frames a second each frame has about 16 ms for all the work.'],
    ],
    recap: ['requestAnimationFrame(tick) runs tick before the next screen refresh.', 'Each frame: update, clear, draw.', 'Stop the loop when nothing moves.'],
  },
  welcome: {
    idea: 'The welcome screen decodes your name with a timer, and sessionStorage remembers you have seen it during this visit.',
    terms: ['sessionstorage', 'localstorage'],
    mistakes: [
      ['Using localStorage for once-per-visit', 'localStorage remembers forever; sessionStorage resets when the session ends.'],
      ['Assuming storage always works', 'Wrap it in try/catch; private windows can block it.'],
    ],
    faq: [
      ['How do I see the welcome screen again?', 'Open the site in a new tab or window, or remove "intro-seen" with the storage inspector.'],
      ['Why is the site downloaded during the welcome screen?', 'So it is ready the moment you click enter.'],
    ],
    recap: ['setInterval drives the decoding effect.', 'sessionStorage: once per visit; localStorage: remembered.', 'The site loads in the background while you watch.'],
  },
  reveal: {
    idea: 'A mask decides where a hidden picture may show; the water effect paints soft blobs as the mask and draws the code matrix only inside them.',
    terms: ['canvas'],
    mistakes: [
      ['Drawing the hidden layer before the mask', 'Draw the mask first, then the layer with source-in, so it only appears where the mask is.'],
      ['Full-resolution masks', 'A soft mask can be drawn small and scaled up for a fraction of the work.'],
    ],
    faq: [
      ['What is compositing?', 'Rules for how new pixels combine with existing ones; source-in keeps new pixels only where old ones exist.'],
      ['Why do the droplets wobble?', 'Each blob\'s radius is nudged by sine waves that drift over time.'],
    ],
    recap: ['Mask + hidden layer + compositing = reveal.', 'source-in keeps the new drawing inside the mask.', 'Small masks and drawing only the visible area keep it fast.'],
  },
  performance: {
    idea: 'Smooth pages stay within a 16 ms budget per frame; the fix for phones was replacing expensive effects with cheap look-alikes.',
    terms: ['gpu', 'mediaquery', 'dpr'],
    mistakes: [
      ['Large blur filters', 'A radial gradient that fades to transparent looks similar and costs almost nothing.'],
      ['The same heavy effects on every device', 'Detect touch screens with (pointer: coarse) and use lighter settings.'],
    ],
    faq: [
      ['How do I know if a page is slow?', 'Browser developer tools have a Performance panel that shows how long each frame takes.'],
      ['Why is transform cheap?', 'The graphics chip can move, scale and rotate an already-drawn layer without repainting it.'],
    ],
    recap: ['About 16 ms per frame at 60 fps.', 'Animate transform and opacity; avoid big blurs.', 'Lighter settings on touch screens.'],
  },
  splitting: {
    idea: 'Code splitting sends the code needed first right away and downloads the rest in the background or only when needed.',
    terms: ['bundle', 'chunk'],
    mistakes: [
      ['Importing heavy libraries everywhere at the top', 'Use import() inside the feature that needs it, like the PDF viewer.'],
      ['Splitting everything into tiny pieces', 'Each piece is a request; split where it clearly helps.'],
    ],
    faq: [
      ['What does React.lazy do?', 'Shows a component once its separately downloaded chunk arrives.'],
      ['How much did splitting save?', 'About 37% less JavaScript before the welcome screen appears.'],
    ],
    recap: ['import("./Site") becomes its own chunk.', 'lazy + Suspense render it when ready.', 'Prefetch during the welcome screen hides the wait.'],
  },
  responsive: {
    idea: 'Mobile first: classes without a prefix style phones, and md: or lg: versions take over on bigger screens.',
    terms: ['breakpoint', 'tailwind'],
    mistakes: [
      ['Designing for desktop and squeezing it onto phones', 'Start with the phone layout and add md:/lg: changes for bigger screens.'],
      ['Tiny text on phones', 'Keep labels at least 10–11px and body text larger.'],
    ],
    faq: [
      ['What widths do md and lg mean?', 'md is from 768px, lg from 1024px wide.'],
      ['How do I test on a phone size?', 'Browser developer tools have a device toolbar that resizes the page.'],
    ],
    recap: ['Unprefixed classes are the mobile base.', 'md: and lg: change things on bigger screens.', 'order-* rearranges elements per screen size.'],
  },
  lab: {
    idea: 'Each Analytical Lab method is described as data (formula, sliders, calculation, SQL), and one component draws them all.',
    terms: ['ztest', 'state'],
    mistakes: [
      ['Dividing by zero in a calculator', 'Guard with a check (bucket > 0 ? … : 0), like NULLIF in SQL.'],
      ['Calling a small difference a win', 'Check significance: with small groups the same lift can be luck.'],
    ],
    faq: [
      ['How do I add a sixth method?', 'Add an object to src/data/playbook.js with its formula, inputs, compute function and SQL.'],
      ['What does |z| ≥ 1.96 mean?', 'The difference is large enough to be 95% confident it is not chance.'],
    ],
    recap: ['playbook.js holds every method as data.', 'compute() turns slider values into a result and verdict.', 'The z-test decides champion-challenger outcomes.'],
  },
  contact: {
    idea: 'Pop-ups share one Modal component; masked phone numbers protect your privacy while links still work.',
    terms: ['component', 'chunk'],
    mistakes: [
      ['Putting the real number in the visible text', 'Show the masked value, keep the full number only in the link.'],
      ['Treating every key in the code as secret', 'EmailJS public keys are designed for browsers; API keys like Claude\'s are not.'],
    ],
    faq: [
      ['Can bots still find the number?', 'A determined scraper reading links could, but masking stops casual copying and on-screen exposure.'],
      ['How is the resume emailed?', 'EmailJS sends it from the browser using a template you set up in its dashboard.'],
    ],
    recap: ['value is what people see; href is where the tap goes.', 'Heavy features (PDF) load only when opened.', 'Public keys can live in the site; secret keys cannot.'],
  },
  chat: {
    idea: 'The AI chat talks to Claude through your own small server (a Worker) so the secret API key never reaches the browser.',
    terms: ['worker', 'apikey', 'cors', 'ratelimit', 'streaming'],
    mistakes: [
      ['Putting an API key in website code', 'Anyone can read it. Keep it as a Worker secret.'],
      ['No limits on a paid API', 'Rate limits and message caps keep costs predictable.'],
    ],
    faq: [
      ['Why is the chat hidden?', 'It only appears once the Worker is deployed and its address is set in CHAT_API_URL.'],
      ['What is streaming?', 'Sending the answer word by word as it is written, so the reply appears quickly.'],
    ],
    recap: ['Browser → Worker → Claude, never browser → Claude.', 'The Worker checks origin, rate and message shape first.', 'Answers stream back as they are generated.'],
  },
  deploy: {
    idea: 'Every push to main triggers GitHub Actions to build the site and publish it to GitHub Pages automatically.',
    terms: ['git', 'commit', 'branch', 'actions', 'pages', 'opengraph'],
    mistakes: [
      ['Committing node_modules or dist', 'They are rebuilt; .gitignore keeps them out.'],
      ['Working directly on main for big changes', 'Use a branch and a pull request, then merge when it is ready.'],
    ],
    faq: [
      ['How long does a deploy take?', 'Usually one to a few minutes; GitHub can be slower on busy days.'],
      ['What if a deploy fails?', 'The live site stays on the last good version. The Actions tab shows which step failed and why.'],
    ],
    recap: ['commit → push → Actions builds → paid lessons upload → Pages serves.', 'npm ci installs exact versions for repeatable builds.', 'Secrets stay in GitHub; Open Graph tags give shared links a preview card.'],
  },
  android: {
    idea: 'Capacitor wraps the built website inside an Android app, so the same code runs as an installable APK.',
    terms: ['capacitor', 'apk', 'versioncode', 'signing'],
    mistakes: [
      ['Expecting the app to update with the website', 'The site is bundled inside; rebuild with npm run apk and reinstall.'],
      ['Building inside an iCloud-synced folder', 'iCloud duplicates files; the build output lives outside it on purpose.'],
      ['Sharing a build signed with a different key', 'The phone refuses it as an update. Build on the same Mac (same key) so it installs over the old app.'],
    ],
    faq: [
      ['Can it go on the Play Store?', 'Yes, with a signed release build and a Play Console account.'],
      ['Does the app work offline?', 'Yes, the site is inside it; only features like email and AI chat need the internet.'],
    ],
    recap: ['webDir: dist puts the built site into the app.', 'npm run apk bumps the version, builds, syncs and packages it.', 'Same signing key + higher versionCode = a smooth update.'],
  },
  'learning-lab': {
    idea: 'The Learning Lab reads every course from one list, and the address after # decides which course or lesson to show.',
    terms: ['localstorage', 'state'],
    mistakes: [
      ['Copying page code for each new course', 'Add the course to src/learn/courses.js; the pages are shared.'],
      ['Reusing a lesson id across courses without the course id', 'Progress keys include the course (python/loops) so they never clash.'],
    ],
    faq: [
      ['Is my progress synced across devices?', 'Yes, once you sign in: it is kept in the browser and in your account, and merged (see "Accounts and synced progress").'],
      ['Why use # in the address?', 'Changing what follows # switches pages without reloading, and works on any static host.'],
    ],
    recap: ['courses.js lists every course.', 'parseHash turns the address into a page.', 'Progress keys are course/lesson.'],
  },
  'python-browser': {
    idea: 'Python runs in your browser as WebAssembly inside a web worker, so long programs never freeze the page.',
    terms: ['pyodide', 'wasm', 'webworker'],
    mistakes: [
      ['Running heavy code on the page\'s main thread', 'Use a worker; the page stays responsive.'],
      ['Expecting every Python package', 'Only packages built for Pyodide (like pandas and Matplotlib) can run here.'],
    ],
    faq: [
      ['How does Step through work?', 'Python\'s built-in tracing records each line as it runs, with the variables and output at that moment.'],
      ['Why does pandas take a few seconds the first time?', 'It is downloaded once (about 8 MB), then the browser caches it.'],
    ],
    recap: ['Pyodide is real Python compiled to WebAssembly.', 'The worker runs code; messages carry output back.', 'Stop replaces the worker to end any program.'],
  },
  'python-tests': {
    idea: 'Exercises are data with tests attached; the tests are small Python checks run right after your code.',
    terms: ['test'],
    mistakes: [
      ['A starter that already passes', 'Every starter is checked to fail at least one test.'],
      ['Tests that only check one input', 'Good tests try several values, including edge cases.'],
    ],
    faq: [
      ['Can I see the tests?', 'You see each test\'s name and, if it fails, the message; the test code itself is in the lesson files.'],
      ['How were the courses checked?', 'Every solution and starter was run in real Python and again in a real browser.'],
    ],
    recap: ['Tests are assert statements run after your code.', 'OUTPUT holds what you printed; SOURCE your code.', 'Solutions must pass and starters must fail.'],
  },
  'python-deploy': {
    idea: 'Python and its packages are copied into the site at build time and loaded from your own domain, only when a lesson needs them.',
    terms: ['cdn', 'npm', 'actions'],
    mistakes: [
      ['Committing 30 MB of generated files', 'They are rebuilt on every build and ignored by Git.'],
      ['Trusting downloaded files blindly', 'Each package is checked against the SHA-256 fingerprint in Pyodide\'s list.'],
    ],
    faq: [
      ['Why not use the public CDN directly?', 'Hosting on your own site avoids depending on another server at run time and works offline in the app.'],
      ['When does pandas download for visitors?', 'Only when they open a lesson whose code imports it.'],
    ],
    recap: ['prebuild copies Python and packages into public/pyodide.', 'Checksums guard every downloaded file.', 'Packages load on first import, then stay cached.'],
  },
  readable: {
    idea: 'One soft text-shadow in the page colour, set on main and inherited by every line, erases the moving code just around the words.',
    terms: ['textshadow', 'cssvar', 'canvas'],
    mistakes: [
      ['Adding a shadow to each paragraph by hand', 'Set it once on a parent; text-shadow is inherited.'],
      ['Keeping the halo on solid panels', 'On a dark panel in the light theme it becomes a white glow around white text. Solid backgrounds switch it off.'],
    ],
    faq: [
      ['Why not just make the background effects fainter?', 'They were made subtler too, but the halo fixes readability without losing the effect.'],
      ['Why does a "/" matter in the rule?', 'bg-accent/5 is a faint see-through tint, so text on it still needs the halo; solid colours do not.'],
    ],
    recap: ['Halo = text-shadow in var(--bg), on main and footer.', 'Solid backgrounds, gradients and buttons with a background turn it off.', 'bg-[#…] panels have their own rule (the gloss fix).'],
  },
  'tilt-shine': {
    idea: 'A wide gradient clipped to the letters slides sideways as the phone tilts, which looks like light moving across glossy text.',
    terms: ['gyroscope', 'cssvar', 'raf'],
    mistakes: [
      ['Measuring tilt from flat', 'People hold phones at an angle; measure from a baseline that follows them.'],
      ['Putting fast sensor values in React state', 'Write the CSS variable straight to the element; React does not need to redraw.'],
    ],
    faq: [
      ['Does it work on computers?', 'Yes, the mouse position moves the shine instead.'],
      ['Why does the shine drift back?', 'The baseline slowly catches up with how you hold the phone, so the gleam returns to the middle.'],
    ],
    recap: ['background-clip: text paints the gradient inside the letters.', '--shine moves the gradient; deviceorientation or the mouse sets it.', 'The loop eases towards the target and stops when it arrives.'],
  },
  accounts: {
    idea: 'Supabase gives the Lab sign-in and a database; row-level security makes the database itself check who may read or change each row.',
    terms: ['supabase', 'rls', 'token', 'localstorage'],
    mistakes: [
      ['Thinking a public key is a leak', 'The public key only works through the policies; secrets stay on the server.'],
      ['Letting the browser write purchases', 'Then anyone could unlock courses. Only server functions mark a purchase paid.'],
    ],
    faq: [
      ['Do I need an account to learn?', 'No. Free lessons work without one; progress is then saved only in this browser.'],
      ['What happens if two devices disagree?', 'Progress is merged: a lesson done on either device counts as done.'],
    ],
    recap: ['products, purchases and progress are the three tables.', 'Policies compare user_id with auth.uid() on every query.', 'Progress saves locally first, then to the account 1.5 s later.'],
  },
  paywall: {
    idea: 'Paid lessons are built into separate files that are never published; private storage hands them only to learners who own the course.',
    terms: ['chunk', 'bundle', 'supabase', 'rls'],
    mistakes: [
      ['Hiding paid content behind a button only', 'Published files can be downloaded by anyone. Keep paid files off the public site.'],
      ['Giving a paid file its own CSS', 'The paid loader handles JavaScript only; the build stops with a clear error if this happens.'],
    ],
    faq: [
      ['Is "Learn the Code" ever paid?', 'No. It is listed in FREE_COURSES and stays free from start to finish.'],
      ['How do I test the paid view locally?', 'Build with VITE_PAYWALL=on, or set VITE_PAYWALL_TEST_OWNED to pretend you own a course.'],
    ],
    recap: ['?part=free / ?part=paid splits each course file.', 'split-paid.mjs moves paid files to dist-paid/, upload-paid.mjs stores them privately.', 'owns(course) decides every download.'],
  },
  payments: {
    idea: 'The browser only asks to buy; server functions set the price, check Razorpay\'s signature and the payment itself, and only then unlock the course.',
    terms: ['razorpay', 'edgefunction', 'hmac', 'webhook'],
    mistakes: [
      ['Trusting a price or "paid" flag sent by the browser', 'Anything from the browser can be edited. The server decides and checks.'],
      ['Pasting the key secret where the key id belongs', 'create-order checks the id starts with rzp_test_ or rzp_live_ and says so clearly.'],
    ],
    faq: [
      ['Does this site see my card or UPI details?', 'No. They go only to Razorpay\'s window.'],
      ['What if I close the tab right after paying?', 'Razorpay\'s webhook still tells the server, which unlocks the course.'],
    ],
    recap: ['create-order → Razorpay window → verify-payment.', 'HMAC proves the payment came from Razorpay.', 'The webhook is the safety net; the admin page handles refunds and free grants.'],
  },
  'checkout-guard': {
    idea: 'Every checkout step has a time limit and a clean way out, so a problem with the payment window can never leave the page frozen.',
    terms: ['timeout', 'razorpay'],
    mistakes: [
      ['Waiting forever for a network answer', 'Give every request a time limit with AbortSignal.timeout.'],
      ['Assuming open() means the window is showing', 'Check that it actually appeared, and clean up if it did not.'],
    ],
    faq: [
      ['Was I charged if the window did not open?', 'No. The message says so, and no payment was started.'],
      ['Why does the payment window still not open?', 'That is decided in the Razorpay account: the website must be approved and live mode switched on.'],
    ],
    recap: ['Script 20 s, order 25 s, window 15 s, verify 60 s.', 'Blocking alerts are caught until the window appears.', 'Every message says whether money moved.'],
  },
};
