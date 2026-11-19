import { useEffect, useRef } from 'react';
import { createMatrix, currentMatrixTheme } from './codeMatrix';
import { deerMask } from './deerMask';

// Fades the panel out towards its edges so it blends into the page.
const FADE = 'radial-gradient(ellipse 72% 78% at 50% 50%, #000 50%, transparent 100%)';

/**
 * The code-cube matrix with the low-poly stag head drawn in it, sized to its parent (place it with
 * `className`, e.g. "absolute inset-0 -z-10"). It only animates while on screen, and stays still for
 * reduced motion.
 */
export default function DeerMatrix({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Narrow phones get smaller cubes so the stag has enough of them to read.
    const cell = window.innerWidth < 640 ? 12 : 15;
    const maxDpr = isTouch ? 1 : 1.5;
    const matrix = createMatrix(cell, { shape: deerMask });
    let dpr = 1;
    let w = 0;
    let h = 0;
    let frame = 0;
    let tickCount = 0;

    const draw = () => matrix.drawFull(ctx, currentMatrixTheme('panel'), 0, dpr);

    const resize = () => {
      const nw = canvas.clientWidth;
      const nh = canvas.clientHeight;
      // Phones resize slightly as the address bar shows and hides; don't reshuffle for that.
      if (!nw || !nh || (nw === w && Math.abs(nh - h) < (isTouch ? 160 : 2))) return;
      w = nw;
      h = nh;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      matrix.resize(w, h);
      draw();
    };

    const tick = () => {
      // ~30fps, like the welcome screen.
      if (tickCount++ % 2 === 0) {
        matrix.step();
        matrix.step();
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame && !reduce) frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(canvas);
    const viewObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    viewObserver.observe(canvas);
    // Redraw when the light/dark theme changes (needed when it is not animating).
    const themeObserver = new MutationObserver(() => w && draw());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      stop();
      sizeObserver.disconnect();
      viewObserver.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none w-full h-full ${className}`}
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
    />
  );
}
