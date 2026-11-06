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

`learn.html` hosts interactive courses, each split into modules and lessons with a quiz:

- **Learn the Code**: 18 beginner lessons on how this site was built, with playgrounds, plus a timeline of every change.
- **Python**: 22 lessons from beginner to advanced (6 modules). Examples run in the browser and 24 exercises
  are checked by tests. There is also a free **Playground**.

Python runs in the browser with [Pyodide](https://pyodide.org) inside a web worker, so nothing is sent to a server
and a runaway loop can be stopped. `scripts/copy-pyodide.mjs` copies it from `node_modules` into `public/pyodide/`
before `npm run dev` and `npm run build` (about 12 MB, downloaded only when a Python lesson is opened), so it works
offline in the Mac and Android apps. Progress and code are saved in the browser. The page is not linked from the
portfolio and is hidden from search engines; open it at `/learn.html`.

**Adding a course:** write its modules and lessons (see `src/learn/python/` for one with runnable exercises) and add
an entry to `src/learn/courses.js`. A lesson is `{ id, module, title, minutes, goals, body, exercises?, quiz? }`;
an exercise is `{ id, title, prompt, starter, tests, hint?, solution?, stdin? }`, where each test is Python code
with `assert`s run after the learner's code (`OUTPUT` holds what was printed, `SOURCE` the code itself).

## Mac app

`desktop/` packages the site as a macOS app with [Electron](https://www.electronjs.org). It opens on
the Learning Lab; the **Go** menu switches to the portfolio (⌘1 Learning Lab, ⌘2 Portfolio, ⌘3 Privacy Policy).
Links to LinkedIn, WhatsApp, email and phone open in your usual apps.

```bash
npm run desktop   # build the site and open it in the app, to try changes
npm run mac       # outputs desktop/release/Shivam Soni-1.0.0-universal.dmg (Apple silicon + Intel)
```

Like the Android app, the site (including Python) is bundled inside, so rebuild after changing it. The app is signed ad hoc,
not with an Apple Developer ID: a copy you build yourself opens normally, but a .dmg downloaded from the
internet (e.g. from the **Build macOS app** workflow in the Actions tab) has to be opened the first time with
right-click → **Open**, or via **System Settings → Privacy & Security → Open Anyway**. The icon is
`desktop/build/icon.png`, the Android icon's code-matrix design on the macOS icon grid.

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
app, build with `VITE_CHAT_API_URL=<worker url> npm run apk` (or `npm run mac` for the Mac app).
