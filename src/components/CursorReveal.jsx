import { useEffect, useRef } from 'react';

// Tuning per input type. Phones get bigger cubes, fewer droplets and no glow to stay smooth.
const SETTINGS = {
  mouse: { maskScale: 0.3, spacing: 16, maxDrops: 140, cell: 14, maxDpr: 1.5, glow: 8, dropScale: 1 },
  touch: { maskScale: 0.22, spacing: 22, maxDrops: 60, cell: 18, maxDpr: 1, glow: 0, dropScale: 0.45 },
};

const TRAIL = 22; // cells lit behind each falling stream head

// Real code, read top-to-bottom down each column (whitespace squeezed out).
const CODE = `
SELECT bucket, SUM(balance) AS exposure FROM ar_book WHERE dpd BETWEEN 30 AND 150 GROUP BY bucket;
WITH roll AS (SELECT acct_id, LAG(bucket) OVER (PARTITION BY acct_id ORDER BY month) AS prev FROM dpd_hist)
SELECT prev, bucket, COUNT(*) FROM roll GROUP BY prev, bucket;
cei = (opening_ar + sales - closing_ar) / (opening_ar + sales - current_ar) * 100
dso = ar_balance / credit_sales * days
df = pd.read_sql(query, conn); df['slip'] = df.gross_slip.sub(df.recoveries).div(df.portfolio)
if challenger.cure_rate > champion.cure_rate: strategy.scale(challenger)
for seg in segments: seg.treatment = assign(seg.risk, seg.behaviour, seg.recovery_score)
UPDATE strategy SET channel = 'digital' WHERE risk_band IN ('A','B') AND dpd < 60;
const roll = (b) => b.next / b.prev; return accounts.filter(a => a.dpd > 90).map(roll);
=SUMIFS(Balance,Bucket,">=30",Bucket,"<=150") =INDEX(MATCH(Agency,Range,0)) => {} [] () != && ||
`.replace(/\s+/g, '');
const GLITCH = '01{}[]()<>=+*/;:#$%&|!?'.split('');

const themes = {
  dark: { tile: '#0d1614', hi: 'rgba(255,255,255,0.07)', lo: 'rgba(0,0,0,0.5)', glyph: '63,209,191', base: 0.28, head: '#e8fffb', ripple: '255,255,255' },
  light: { tile: '#e9efed', hi: 'rgba(255,255,255,0.9)', lo: 'rgba(15,23,42,0.1)', glyph: '15,138,126', base: 0.4, head: '#0c3b36', ripple: '15,138,126' },
};

const rand = (min, max) => min + Math.random() * (max - min);
const glitch = () => GLITCH[(Math.random() * GLITCH.length) | 0];


/**
 * A hidden "cubic code matrix" behind the page: a dense grid of beveled tiles
 * spelling out real SQL/Python/Excel code down each column, lit by falling
 * Matrix-style streams. The cursor (or a finger on touch screens) leaves a trail of
 * wobbling, spreading "water" droplets that reveal it; they drift with the motion,
 * ripple outward and dry up, so the matrix is covered again once the cursor leaves.
 */
export default function CursorReveal() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const { maskScale: MASK_SCALE, spacing: SPACING, maxDrops: MAX_DROPS, cell: CELL, maxDpr, glow, dropScale } = isTouch ? SETTINGS.touch : SETTINGS.mouse;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const mask = document.createElement('canvas');
    const mctx = mask.getContext('2d');
    const art = document.createElement('canvas'); // the matrix, rendered before masking
    const actx = art.getContext('2d');

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let cells = []; // glyph per cell, row-major
    let heads = []; // per column: { y, speed }
    let drops = [];
    let frame = 0;
    let time = 0;
    let pointer = null; // { x, y } while the cursor is inside the window
    let lastEmit = null;
    let lastMove = 0;
    let lastScroll = window.scrollY;

    const resize = () => {
      // Mobile browsers resize the viewport as the address bar shows/hides while scrolling;
      // ignore those small height changes so the matrix doesn't reshuffle mid-reveal.
      if (isTouch && w === window.innerWidth && Math.abs(h - window.innerHeight) < 160) return;
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      for (const [c, cx] of [
        [canvas, ctx],
        [art, actx],
      ]) {
        c.width = w * dpr;
        c.height = h * dpr;
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      mask.width = Math.ceil(w * MASK_SCALE);
      mask.height = Math.ceil(h * MASK_SCALE);

      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      // Each column starts at a random point in the code and reads downward.
      cells = new Array(cols * rows);
      for (let col = 0; col < cols; col++) {
        const start = (Math.random() * CODE.length) | 0;
        for (let row = 0; row < rows; row++) cells[row * cols + col] = CODE[(start + row) % CODE.length];
      }
      heads = Array.from({ length: cols }, () => ({ y: rand(-rows, rows), speed: rand(0.18, 0.5) }));
    };
    resize();

    const addDrop = (x, y, vx = 0, vy = 0, big = false) => {
      if (drops.length >= MAX_DROPS) drops.shift();
      drops.push({
        x: x + rand(-25, 25),
        y: y + rand(-25, 25),
        vx: vx * 0.12 + rand(-0.4, 0.4),
        vy: vy * 0.12 + rand(-0.2, 0.6), // a slight downward pull, like running water
        r: (big ? rand(150, 220) : rand(90, 150)) * dropScale,
        grow: rand(0.5, 1.3) * dropScale,
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

    // Draw only the cubes inside the revealed area; the rest is masked away anyway.
    const drawMatrix = (theme, box) => {
      const c0 = Math.max(0, Math.floor(box.x0 / CELL));
      const c1 = Math.min(cols - 1, Math.floor(box.x1 / CELL));
      const r0 = Math.max(0, Math.floor(box.y0 / CELL));
      const r1 = Math.min(rows - 1, Math.floor(box.y1 / CELL));
      const s = CELL - 1;

      actx.clearRect(0, 0, w, h);
      actx.font = `600 ${Math.round(CELL * 0.72)}px "JetBrains Mono", ui-monospace, monospace`;
      actx.textAlign = 'center';
      actx.textBaseline = 'middle';

      for (let col = c0; col <= c1; col++) {
        const head = heads[col].y;
        for (let row = r0; row <= r1; row++) {
          const x = col * CELL;
          const y = row * CELL;

          // Cube: flat face with a light top-left edge and a shaded bottom-right edge.
          actx.fillStyle = theme.tile;
          actx.fillRect(x, y, s, s);
          actx.fillStyle = theme.hi;
          actx.fillRect(x, y, s, 1);
          actx.fillRect(x, y, 1, s);
          actx.fillStyle = theme.lo;
          actx.fillRect(x, y + s - 1, s, 1);
          actx.fillRect(x + s - 1, y, 1, s);

          const d = head - row;
          const lit = d >= 0 && d < TRAIL ? 1 - d / TRAIL : 0;
          const i = row * cols + col;
          let ch = cells[i];
          if (lit > 0.6 && Math.random() < 0.06) ch = glitch(); // brief glitch near the head
          if (d >= 0 && d < 1) {
            actx.fillStyle = theme.head;
            actx.shadowColor = `rgb(${theme.glyph})`;
            actx.shadowBlur = glow;
          } else {
            actx.fillStyle = `rgba(${theme.glyph},${theme.base + lit * (1 - theme.base)})`;
            actx.shadowBlur = 0;
          }
          actx.fillText(ch, x + s / 2, y + s / 2 + 0.5);
        }
      }
      actx.shadowBlur = 0;
    };

    const tick = () => {
      time++;

      // Keep the area under a resting cursor gently "wet".
      if (pointer && time - lastMove > 6 && time % 7 === 0) addDrop(pointer.x, pointer.y);

      for (const head of heads) {
        head.y += head.speed;
        if (head.y - TRAIL > rows) {
          head.y = rand(-rows * 0.5, 0);
          head.speed = rand(0.18, 0.5);
        }
      }

      drops = drops.filter((d) => d.age < d.life);

      // 1) Paint the mask and track the revealed area's bounds.
      const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
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
        const reach = d.r * 1.3;
        box.x0 = Math.min(box.x0, d.x - reach);
        box.y0 = Math.min(box.y0, d.y - reach);
        box.x1 = Math.max(box.x1, d.x + reach);
        box.y1 = Math.max(box.y1, d.y + reach);
      }

      // 2) Matrix shown only where the mask is painted.
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);
      if (drops.length) {
        const theme = document.documentElement.classList.contains('dark') ? themes.dark : themes.light;
        drawMatrix(theme, box);
        ctx.drawImage(mask, 0, 0, w, h);
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(art, 0, 0, w, h);

        // 3) Faint expanding ripple rings on the revealed water.
        ctx.globalCompositeOperation = 'source-atop';
        ctx.lineWidth = 1.5;
        for (const d of drops) {
          if (!d.ripple) continue;
          const t = Math.min(d.age / d.life, 1);
          ctx.strokeStyle = `rgba(${theme.ripple},${0.25 * d.alpha * (1 - t)})`;
          blobPath(ctx, d.x, d.y, d.r * (0.45 + t * 0.6), d.seed + 50);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
      }

      frame = drops.length || pointer ? requestAnimationFrame(tick) : 0;
    };

    const moveTo = (x, y) => {
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

    const onMove = (e) => e.pointerType === 'mouse' && moveTo(e.clientX, e.clientY);

    // Touch: the water follows the finger while it is down (dragging also scrolls the page as usual).
    const onTouch = (e) => {
      const t = e.touches[0];
      if (t) moveTo(t.clientX, t.clientY);
    };

    // Scrolling slides the page under a still cursor; let the water stream the other way.
    // (On touch the finger itself moves while scrolling, so the touch trail already covers it.)
    const onScroll = () => {
      const delta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (!pointer || !delta || isTouch) return;
      const count = Math.min(Math.ceil(Math.abs(delta) / 40), 3);
      for (let i = 0; i < count; i++) addDrop(pointer.x, pointer.y, 0, -Math.sign(delta) * rand(15, 30));
    };

    const onLeave = () => {
      pointer = null;
      lastEmit = null;
    };
    const onOut = (e) => !e.relatedTarget && onLeave();

    // Reduced motion: no flowing animation, the matrix simply stays hidden.
    if (reduce) return undefined;

    const passive = { passive: true };
    window.addEventListener('pointermove', onMove, passive);
    window.addEventListener('touchstart', onTouch, passive);
    window.addEventListener('touchmove', onTouch, passive);
    window.addEventListener('touchend', onLeave, passive);
    window.addEventListener('touchcancel', onLeave, passive);
    window.addEventListener('scroll', onScroll, passive);
    window.addEventListener('resize', resize);
    window.addEventListener('blur', onLeave);
    document.addEventListener('mouseout', onOut);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onLeave);
      window.removeEventListener('touchcancel', onLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('blur', onLeave);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="fixed inset-0 -z-[5] pointer-events-none w-full h-full" />;
}
