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

## Learning Lab

`learn.html` opens on a landing page that takes the portfolio apart into its layers (an interactive 3D exploded view,
each layer linked to the lesson that explains it), then hosts interactive courses, each split into modules and lessons with a quiz:

- **Learn the Code**: 22 beginner lessons on how this site was built, including how the Python course runs, is tested
  and deploys, with playgrounds, plus a timeline of every change.
- **Python**: 22 lessons from beginner to advanced (6 modules). Examples run in the browser and 24 exercises
  are checked by tests. There is also a free **Playground**.
- **Data Analysis with pandas** (14 lessons, NumPy foundations to a monthly portfolio report), **SQL with Python**
  (6 lessons on SQLite: GROUP BY, JOINs, parameters, window functions, pandas) and **Charts with Matplotlib**
  (4 lessons). They share made-up collections data in `src/learn/python/datasets.js`, written to `data/` before each run.

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
Courses page suggests a learning path, and each course says who it is for, what you need and what you will learn.

**Adding a course:** write its modules and lessons (see `src/learn/python/` for one with runnable exercises) and add
an entry to `src/learn/courses.js`, with a beginner guide in `src/learn/guides/`. A lesson is `{ id, module, title, minutes, goals, body, exercises?, quiz? }`;
an exercise is `{ id, title, prompt, starter, tests, hint?, solution?, stdin? }`, where each test is Python code
with `assert`s run after the learner's code (`OUTPUT` holds what was printed, `SOURCE` the code itself).

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
