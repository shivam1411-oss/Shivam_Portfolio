import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import lessonParts from './scripts/vite-lesson-parts.mjs';
import { PAID_ROOTS } from './scripts/paid-roots.mjs';

const PAYWALL = process.env.VITE_PAYWALL === 'on';

/** With the paywall on, build every paid course's lessons and knowledge base as their own files. */
function emitPaidChunks() {
  return {
    name: 'lab-emit-paid',
    buildStart() {
      if (!PAYWALL) return;
      for (const [course, roots] of Object.entries(PAID_ROOTS)) {
        for (const [kind, file] of Object.entries(roots)) this.emitFile({ type: 'chunk', id: resolve(__dirname, file), name: `paid-${course}-${kind}`, preserveSignature: 'exports-only' });
      }
    },
  };
}

// Relative base so the build works on GitHub Pages (project or custom domain).
export default defineConfig({
  base: './',
  plugins: [lessonParts({ catalogPath: resolve(__dirname, 'src/learn/catalog.generated.json') }), react(), tailwindcss(), emitPaidChunks()],
  build: {
    manifest: true, // read by scripts/split-paid.mjs, then removed from the published site
    rollupOptions: {
      output: {
        // Every page uses React, the animation library and a handful of icons. Left alone, each icon becomes
        // its own 0.3 KB file and a page needs 15 to 20 requests, any one of which can stall on a slow
        // connection. One shared file is fetched once, cached, and reused by every page.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler|motion|motion-dom|motion-utils|framer-motion|lucide-react)\//.test(id)) return 'vendor';
          // The site's own small pieces that every page shares (theme, animation helpers, the code matrix).
          if (id.includes('vite/preload-helper') || /\/src\/(theme\/|components\/(motion|codeMatrix|CodeTrail|CursorReveal|ThemeToggle)\.)/.test(id)) return 'shared';
          return undefined;
        },
      },
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        learn: resolve(__dirname, 'learn.html'),
        terms: resolve(__dirname, 'terms.html'),
        refund: resolve(__dirname, 'refund.html'),
      },
    },
  },
});
