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
