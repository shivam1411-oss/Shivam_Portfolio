import { useEffect, useRef } from 'react';

// Phones get fewer glyphs, no glow and a lower canvas resolution to stay smooth.
const SETTINGS = {
  mouse: { maxGlyphs: 180, spacing: 14, maxDpr: 2, glow: 8 },
  touch: { maxGlyphs: 90, spacing: 18, maxDpr: 1.5, glow: 0 },
};

// Code tokens and symbols shed by the cursor.
const TOKENS = [
  '{', '}', '(', ')', '[', ']', '<', '>', '/', '*', '+', '=', ';', '#', '%', '$', '₹',
  '0', '1', '0', '1', 'λ', 'Σ', '=>', '!=', '&&', '||', '::', '++', '</>', '{}', '0x',
  'fn', 'if', 'SUM', 'SQL', 'dpd', 'AR',
];

const palettes = {
  dark: ['#ffffff', '#3fd1bf', '#9196f6', '#fde68a'],
  light: ['#0a5c54', '#3a3fb0', '#a67708', '#1f2430'], // deeper so tokens stand out over the light matrix
};

const rand = (min, max) => min + Math.random() * (max - min);

/** Canvas overlay that leaves a trail of flickering code tokens behind the cursor (or finger), also while scrolling. */
export default function CodeTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const { maxGlyphs: MAX_GLYPHS, spacing: SPACING, maxDpr, glow } = isTouch ? SETTINGS.touch : SETTINGS.mouse;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let glyphs = [];
    let frame = 0;
    let last = null; // last cursor position
    let lastScroll = window.scrollY;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const spawn = (x, y, drift = { x: 0, y: 0 }) => {
      const dark = document.documentElement.classList.contains('dark');
      const colors = dark ? palettes.dark : palettes.light;
      if (glyphs.length >= MAX_GLYPHS) glyphs.shift();
      const life = rand(45, 85);
      glyphs.push({
        x: x + rand(-6, 6),
        y: y + rand(-6, 6),
        vx: rand(-0.6, 0.6) + drift.x,
        vy: rand(-0.4, 0.8) + drift.y,
        token: TOKENS[(Math.random() * TOKENS.length) | 0],
        font: `${dark && Math.random() > 0.25 ? 500 : 700} ${Math.round(rand(12, 19))}px "JetBrains Mono", ui-monospace, monospace`,
        rot: rand(-0.35, 0.35),
        vr: rand(-0.02, 0.02),
        life,
        age: 0,
        twinkle: rand(0, Math.PI * 2),
        color: colors[(Math.random() * colors.length) | 0],
        glow: dark ? glow : 0,
      });
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      glyphs = glyphs.filter((s) => s.age < s.life);
      for (const s of glyphs) {
        s.age++;
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.97;
        s.vy = s.vy * 0.97 + 0.02;
        s.rot += s.vr;
        const t = s.age / s.life;
        const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
        const flicker = 0.75 + 0.25 * Math.sin(s.twinkle + s.age * 0.35);
        ctx.globalAlpha = Math.max(0, fade * flicker);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = s.glow;
        ctx.font = s.font;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.scale(1 - t * 0.35, 1 - t * 0.35);
        ctx.fillText(s.token, 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      frame = glyphs.length ? requestAnimationFrame(tick) : 0;
    };

    // Spawn glyphs along the path travelled, so fast movements leave a continuous trail.
    const trailTo = (x, y, drift) => {
      if (!last) {
        last = { x, y };
        return;
      }
      const dx = x - last.x;
      const dy = y - last.y;
      const steps = Math.min(Math.floor(Math.hypot(dx, dy) / SPACING), 12);
      for (let i = 1; i <= steps; i++) spawn(last.x + (dx * i) / steps, last.y + (dy * i) / steps, drift);
      if (steps) last = { x, y };
    };

    const onMove = (e) => e.pointerType === 'mouse' && trailTo(e.clientX, e.clientY);

    // Touch: glyphs follow the finger while it is down (dragging still scrolls the page).
    const onTouchStart = (e) => {
      const t = e.touches[0];
      if (!t) return;
      last = null;
      trailTo(t.clientX, t.clientY);
      for (let i = 0; i < 4; i++) spawn(t.clientX, t.clientY); // a little burst where the finger lands
    };
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (t) trailTo(t.clientX, t.clientY);
    };
    const onTouchEnd = () => {
      last = null;
    };

    // While scrolling the cursor stays put on screen but moves over the page,
    // so shed glyphs that stream away opposite to the scroll direction.
    const onScroll = () => {
      const delta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (!last || !delta || isTouch) return; // on touch the finger trail already covers scrolling
      const count = Math.min(Math.ceil(Math.abs(delta) / 25), 4);
      const dir = Math.sign(delta);
      for (let i = 0; i < count; i++) spawn(last.x, last.y, { x: 0, y: -dir * rand(1.5, 3.5) });
    };

    const onOut = (e) => {
      if (!e.relatedTarget) last = null;
    };

    const passive = { passive: true };
    window.addEventListener('pointermove', onMove, passive);
    window.addEventListener('touchstart', onTouchStart, passive);
    window.addEventListener('touchmove', onTouchMove, passive);
    window.addEventListener('touchend', onTouchEnd, passive);
    window.addEventListener('touchcancel', onTouchEnd, passive);
    window.addEventListener('scroll', onScroll, passive);
    window.addEventListener('resize', resize);
    document.addEventListener('mouseout', onOut);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="fixed inset-0 z-[90] pointer-events-none w-full h-full" />;
}
