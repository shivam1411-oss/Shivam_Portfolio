import { useEffect, useRef } from 'react';
import { profile } from '../data/content';

const MASK_SCALE = 0.3; // low-res mask: cheap to draw and naturally soft when scaled up
const SPACING = 16; // px of cursor travel per new droplet
const MAX_DROPS = 140;

const rand = (min, max) => min + Math.random() * (max - min);

// Only for devices with a real cursor; touch screens have nothing to follow.
const hasFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Full-screen photo kept hidden behind the page. The cursor leaves a trail of
 * wobbling, spreading "water" droplets that reveal it; they drift with the motion,
 * ripple outward and dry up, so the photo is covered again once the cursor leaves.
 */
export default function CursorReveal() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!hasFinePointer()) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const mask = document.createElement('canvas');
    const mctx = mask.getContext('2d');
    const photo = new Image();
    photo.src = profile.photoFull;

    let w = 0;
    let h = 0;
    let cover = null;
    let drops = [];
    let frame = 0;
    let time = 0;
    let pointer = null; // { x, y } while the cursor is inside the window
    let lastEmit = null;
    let lastMove = 0;
    let lastScroll = window.scrollY;

    const computeCover = () => {
      if (!photo.naturalWidth) return;
      const s = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
      const dw = photo.naturalWidth * s;
      const dh = photo.naturalHeight * s;
      cover = { x: (w - dw) / 2, y: (h - dh) * 0.3, w: dw, h: dh };
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mask.width = Math.ceil(w * MASK_SCALE);
      mask.height = Math.ceil(h * MASK_SCALE);
      computeCover();
    };
    resize();
    photo.onload = computeCover;

    const addDrop = (x, y, vx = 0, vy = 0, big = false) => {
      if (drops.length >= MAX_DROPS) drops.shift();
      drops.push({
        x: x + rand(-25, 25),
        y: y + rand(-25, 25),
        vx: vx * 0.12 + rand(-0.4, 0.4),
        vy: vy * 0.12 + rand(-0.2, 0.6), // a slight downward pull, like running water
        r: big ? rand(150, 220) : rand(90, 150),
        grow: rand(0.5, 1.3),
        life: rand(110, 170),
        age: 0,
        seed: rand(0, 1000),
        ripple: Math.random() < 0.35,
      });
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // Wobbly closed outline: radius modulated by a few drifting sine waves.
    const blobPath = (c, x, y, r, seed, scale = 1) => {
      c.beginPath();
      const n = 28;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const k =
          1 +
          0.14 * Math.sin(3 * a + time * 0.045 + seed) +
          0.09 * Math.sin(5 * a - time * 0.06 + seed * 1.7) +
          0.05 * Math.sin(8 * a + time * 0.09 + seed * 0.3);
        const px = (x + Math.cos(a) * r * k) * scale;
        const py = (y + Math.sin(a) * r * k) * scale;
        i ? c.lineTo(px, py) : c.moveTo(px, py);
      }
      c.closePath();
    };

    const tick = () => {
      time++;

      // Keep the area under a resting cursor gently "wet".
      if (pointer && time - lastMove > 6 && time % 7 === 0) addDrop(pointer.x, pointer.y);

      drops = drops.filter((d) => d.age < d.life);

      // 1) Paint the mask.
      mctx.clearRect(0, 0, mask.width, mask.height);
      for (const d of drops) {
        d.age++;
        d.x += d.vx;
        d.y += d.vy;
        d.vx *= 0.985;
        d.vy = d.vy * 0.985 + 0.012;
        d.r += d.grow;
        d.grow *= 0.99;
        const t = Math.min(d.age / d.life, 1);
        const alpha = t < 0.12 ? t / 0.12 : Math.pow(1 - (t - 0.12) / 0.88, 1.4);
        const g = mctx.createRadialGradient(d.x * MASK_SCALE, d.y * MASK_SCALE, 0, d.x * MASK_SCALE, d.y * MASK_SCALE, d.r * 1.15 * MASK_SCALE);
        g.addColorStop(0, `rgba(0,0,0,${alpha})`);
        g.addColorStop(0.6, `rgba(0,0,0,${alpha * 0.85})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        mctx.fillStyle = g;
        blobPath(mctx, d.x, d.y, d.r, d.seed, MASK_SCALE);
        mctx.fill();
        d.alpha = alpha;
      }

      // 2) Photo shown only where the mask is painted.
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);
      if (cover && drops.length) {
        ctx.drawImage(mask, 0, 0, w, h);
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(photo, cover.x, cover.y, cover.w, cover.h);

        // 3) Faint expanding ripple rings on the revealed water.
        ctx.globalCompositeOperation = 'source-atop';
        ctx.lineWidth = 1.5;
        for (const d of drops) {
          if (!d.ripple) continue;
          const t = d.age / d.life;
          ctx.strokeStyle = `rgba(255,255,255,${0.22 * d.alpha * (1 - t)})`;
          blobPath(ctx, d.x, d.y, d.r * (0.45 + t * 0.6), d.seed + 50);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
      }

      frame = drops.length || pointer ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      pointer = { x, y };
      lastMove = time;
      if (!lastEmit) {
        lastEmit = { x, y };
        addDrop(x, y, 0, 0, true);
        return;
      }
      const dx = x - lastEmit.x;
      const dy = y - lastEmit.y;
      const steps = Math.min(Math.floor(Math.hypot(dx, dy) / SPACING), 8);
      for (let i = 1; i <= steps; i++) {
        addDrop(lastEmit.x + (dx * i) / steps, lastEmit.y + (dy * i) / steps, dx, dy, i === steps && Math.random() < 0.3);
      }
      if (steps) lastEmit = { x, y };
    };

    // Scrolling slides the page under a still cursor; let the water stream the other way.
    const onScroll = () => {
      const delta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (!pointer || !delta) return;
      const count = Math.min(Math.ceil(Math.abs(delta) / 40), 3);
      for (let i = 0; i < count; i++) addDrop(pointer.x, pointer.y, 0, -Math.sign(delta) * rand(15, 30));
    };

    const onLeave = () => {
      pointer = null;
      lastEmit = null;
    };
    const onOut = (e) => !e.relatedTarget && onLeave();

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('blur', onLeave);
    document.addEventListener('mouseout', onOut);

    // Reduced motion: no flowing animation, the photo simply stays hidden.
    if (reduce) {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('blur', onLeave);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="fixed inset-0 -z-[5] pointer-events-none w-full h-full" />;
}
