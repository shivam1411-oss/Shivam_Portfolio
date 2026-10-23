import { useEffect, useRef } from 'react';

// Phones get fewer stars, no glow and a lower canvas resolution to stay smooth.
const SETTINGS = {
  mouse: { maxStars: 260, spacing: 10, maxDpr: 2, glow: 8 },
  touch: { maxStars: 110, spacing: 14, maxDpr: 1.5, glow: 0 },
};

const palettes = {
  dark: ['#ffffff', '#3fd1bf', '#9196f6', '#fde68a'],
  light: ['#0f8a7e', '#5b61d6', '#d4a017', '#3f4652'],
};

const rand = (min, max) => min + Math.random() * (max - min);

function drawStar(ctx, x, y, r, rot) {
  // Four-pointed sparkle.
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const len = i % 2 === 0 ? r : r * 0.28;
    const a = (i * Math.PI) / 4;
    ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Canvas overlay that leaves a trail of twinkling stars behind the cursor (or finger), also while scrolling. */
export default function StarTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const { maxStars: MAX_STARS, spacing: SPACING, maxDpr, glow } = isTouch ? SETTINGS.touch : SETTINGS.mouse;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let stars = [];
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
      if (stars.length >= MAX_STARS) stars.shift();
      const life = rand(45, 85);
      stars.push({
        x: x + rand(-6, 6),
        y: y + rand(-6, 6),
        vx: rand(-0.6, 0.6) + drift.x,
        vy: rand(-0.4, 0.8) + drift.y,
        size: rand(2.5, 6.5),
        rot: rand(0, Math.PI),
        vr: rand(-0.08, 0.08),
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
      stars = stars.filter((s) => s.age < s.life);
      for (const s of stars) {
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
        drawStar(ctx, s.x, s.y, s.size * (1 - t * 0.5), s.rot);
      }
      ctx.globalAlpha = 1;
      frame = stars.length ? requestAnimationFrame(tick) : 0;
    };

    // Spawn stars along the path travelled, so fast movements leave a continuous trail.
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

    // Touch: stars follow the finger while it is down (dragging still scrolls the page).
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
    // so shed stars that stream away opposite to the scroll direction.
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
