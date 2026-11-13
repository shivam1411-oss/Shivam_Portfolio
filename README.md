# Shivam_Portfolio
Portfolio for recruiters to connect

Built with React, Vite, Tailwind CSS v4 and Motion, with light and dark themes.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
```

Pushing to `main` deploys `dist/` to GitHub Pages via `.github/workflows/deploy.yml`
(set **Settings → Pages → Source** to **GitHub Actions**).

Content lives in `src/data/content.js`; theme colors are CSS variables at the top of `src/index.css`.

## Site updates (changelog)

Every change to the website since the first page is listed in `src/data/changelog.js`, in plain words with its
commits. The portfolio shows it as the **Updates** section (`#updates`, newest first, filterable by period and type)
and the Learning Lab shows the same list at `learn.html#/timeline`. When you ship a change, add an entry at the
bottom of the list: `{ phase, date, category, title, plain, commits, lessons? }`.

## Learning Lab

`learn.html` opens on a landing page that takes the portfolio apart into its layers (an interactive 3D exploded view,
each layer linked to the lesson that explains it), then hosts interactive courses, each split into modules and lessons with a quiz:

- **Learn the Code**: 22 beginner lessons on how this site was built, including how the Python course runs, is tested
  and deploys, with playgrounds, plus a timeline of every change.
- **Python**: 22 lessons from beginner to advanced (6 modules). Examples run in the browser and 24 exercises
  are checked by tests. There is also a free **Playground**.
- **Data Analysis with pandas** (15 lessons, NumPy foundations to a monthly portfolio report), **SQL with Python**
  (7 lessons on SQLite: GROUP BY, JOINs, parameters, window functions, pandas) and **Charts with Matplotlib**
  (4 lessons). They share made-up collections data in `src/learn/python/datasets.js`, written to `data/` before each run.
- **React** (7 lessons): components, props, state, lists, forms and effects with a live preview. JSX is compiled in
  the browser with [Sucrase](https://github.com/alangpierce/sucrase) and exercises are checked by clicking and typing
  in the learner's app (`src/learn/react/ReactRunner.jsx`).
- **Jira** (6 lessons): work items, boards and workflows, Scrum sprint planning, JQL and automation. JQL runs against
  a practice project with a small query engine (`src/learn/jira/jql.js`); no Jira account is needed.
- **Kubernetes** (7 lessons): containers, pods, Deployments, Services, ConfigMaps and rolling updates. A simulated
  3-node cluster (`src/learn/k8s/sim.js`) accepts real `kubectl` commands and YAML and shows pods starting, crashing
  and healing.

Python runs in the browser with [Pyodide](https://pyodide.org) inside a web worker, so nothing is sent to a server
and a runaway loop can be stopped. `scripts/copy-pyodide.mjs` copies it from `node_modules` into `public/pyodide/`
before `npm run dev` and `npm run build` (about 12 MB, downloaded only when a Python lesson is opened), so it works
offline in the Android app. The same script downloads the pandas, NumPy, sqlite3 and Matplotlib packages (and their
dependencies) from Pyodide's CDN once, checks each against the SHA-256 in `pyodide-lock.json`, and caches them in
`node_modules/.cache/pyodide-packages`. Lessons load a package only when their code imports it. Progress and code are saved in the browser. The page is not linked from the
portfolio and is hidden from search engines; open it at `/learn.html`.

Every lesson is built for beginners: a one-sentence **big idea**, **words to know** as flip cards, **common mistakes**,
**questions beginners ask**, and a **recap** (written per course in `src/learn/guides/`). Every code box has
**Step through**, which runs the program one line at a time and shows the variables and output at each step. The
Courses page suggests two learning paths (data: Python → pandas → SQL → charts; technology: React → Jira →
Kubernetes), and each course says who it is for, what you need and what you will learn.

**Knowledge base** (`#/kb`, `src/learn/kb/`): every course also has a reference of 20 topics in four levels
(Beginner, Intermediate, Advanced, Expert), 160 in all. Each topic has a plain-English explanation, an example (Python,
SQL, Matplotlib and React examples run in the browser, HTML examples render live, Kubernetes ones open a practice
cluster, JQL runs in the sandbox), key points, a real-world use from outside collections and a check-yourself question.
Readers can search, filter by level and mark topics as understood (saved in the browser). A topic is
`{ id, level, title, summary, body, code, lang, run?, points, realWorld, check, lesson? }`.

**Loading speed:** the Lab loads a small catalogue (`src/learn/catalog.generated.json`, written by
`scripts/gen-learn-catalog.mjs` before every dev start and build) and downloads each course's lessons and each
knowledge base only when opened. Python and the code editor start loading when a code box nears the screen.

**Paid courses (paywall):** Learn the Code is free; in every other course the first module is free and the rest
is paid (`src/learn/paywall.config.js`). It is switched off unless the site is built with `VITE_PAYWALL=on`, so the
live site is fully free until sign-in and payments are ready. With it on:

- `scripts/vite-lesson-parts.mjs` splits each course file into its free and paid lessons at build time
  (`course.jsx?part=free` / `?part=paid`), so lessons stay in one file per course for editing.
- `scripts/split-paid.mjs` (runs after `vite build`) moves the files only paid content needs from `dist/` to
  `dist-paid/<course>/` for upload to the private Supabase bucket `paid-lessons`, and writes `dist/paid-manifest.json`.
- `src/learn/access.js` downloads a course's paid files from storage only for learners who own it and runs them in
  the page; others see the lesson title, goals and an unlock card (`src/learn/Paywall.jsx`). Prices come from the
  Supabase `products` table. The database setup is `supabase/schema.sql`.
- Local testing: `VITE_PAYWALL=on VITE_PAID_BASE=http://localhost:4175/ VITE_PAYWALL_TEST_OWNED=react npm run build`
  and serve `dist-paid/` with CORS on port 4175. Never set `VITE_PAYWALL_TEST_OWNED` for the real site.

**Accounts** (`#/account`, `src/learn/account/`): email + password sign-up with email confirmation, sign in,
forgot/reset password and a profile page, using Supabase Auth (`supabase.config.js` holds the public URL and
publishable key). The Supabase library loads only when needed (an existing login, an email link, or the account
page). When signed in, lesson progress and "understood" knowledge-base topics are merged with the browser's and
saved to the `progress` table, and owned courses are read from `purchases`. Email templates to paste into Supabase
(Authentication → Emails → Templates) are in `supabase/email-templates/`; their links use `?token_hash=…&type=…`
so they work even when opened on another device.

**Adding a course:** write its modules and lessons (see `src/learn/python/` for one with runnable exercises) and add
`src/learn/content/<id>.js`, list it in `src/learn/courses.js` and `src/learn/catalog.js`, with a beginner guide in `src/learn/guides/` and a knowledge base in `src/learn/kb/`. A lesson is `{ id, module, title, minutes, goals, body, exercises?, quiz? }`;
an exercise is `{ id, title, prompt, starter, tests, hint?, solution?, stdin? }`, where each test is Python code
with `assert`s run after the learner's code (`OUTPUT` holds what was printed, `SOURCE` the code itself). React
exercises set `kind: 'react'` with JavaScript tests; Jira and Kubernetes exercises set their own `kind` and `component`.

## AI assistant (chat)

The "Ask my AI" widget answers questions on AR, R2R, collections and automation using Claude.
The Anthropic API key lives only in a Cloudflare Worker (`chat-worker/`), never in the site.

```bash
cd chat-worker && npm install
npx wrangler login                          # once
npx wrangler secret put ANTHROPIC_API_KEY   # paste your Anthropic API key
npx wrangler deploy                         # prints the Worker URL
```

Then set the repository variable `CHAT_API_URL` (Settings → Secrets and variables → Actions → Variables)
to the Worker URL. The site build picks it up; without it the widget stays hidden. For the Android
app, build with `VITE_CHAT_API_URL=<worker url> npm run apk`.
