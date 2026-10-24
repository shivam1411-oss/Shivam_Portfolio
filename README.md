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
