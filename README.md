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
