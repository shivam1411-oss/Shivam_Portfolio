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

## Learn the code

`learn.html` is a beginner course on how this site was built: 18 interactive lessons (React, Tailwind,
themes, Motion, the canvas effects, performance, the Lab maths, the AI chat, deploying and the Android app),
each with the real code, a playground and a quiz, plus a timeline of every change and a glossary.
Progress is saved in the browser. It is not linked from the portfolio and is hidden from search engines;
open it at `/learn.html` (or `npm run dev` → http://localhost:5173/learn.html). Lessons live in `src/learn/lessons.jsx`.

## Android app

The site is also packaged as an Android app with [Capacitor](https://capacitorjs.com) (`android/`).

```bash
npm run apk   # outputs apk/Shivam-Soni-Portfolio.apk
```

Uses Android Studio's bundled Java and the SDK in `~/Library/Android/sdk`. Gradle builds in
`~/Library/Caches/ShivamPortfolioAndroid` because iCloud Drive (which syncs `~/Documents`) breaks builds inside the project. The site is bundled inside
the APK, so rebuild and reinstall the app after changing the site.

The app icon (code-matrix cubes with "SHIVAM SONI") is drawn by `scripts/app-icon.swift`:

```bash
swift scripts/app-icon.swift android/app/src/main/res /tmp
```

## Mac app

`desktop/` packages the site as a macOS app with [Electron](https://www.electronjs.org). It opens on
Learn the Code; the **Go** menu switches to the portfolio (⌘1 Learn the Code, ⌘2 Portfolio, ⌘3 Privacy Policy).
Links to LinkedIn, WhatsApp, email and phone open in your usual apps.

```bash
npm run desktop   # build the site and open it in the app, to try changes
npm run mac       # outputs desktop/release/Shivam Soni-1.0.0-universal.dmg (Apple silicon + Intel)
```

Like the Android app, the site is bundled inside, so rebuild after changing it. The app is signed ad hoc,
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
