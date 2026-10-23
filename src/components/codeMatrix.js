// Shared "cubic code matrix": a grid of beveled tiles spelling out real code down
// each column, lit by falling Matrix-style streams. Used by the cursor reveal and
// the welcome screen.

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

export const matrixThemes = {
  dark: { tile: '#0d1614', hi: 'rgba(255,255,255,0.07)', lo: 'rgba(0,0,0,0.5)', glyph: '63,209,191', base: 0.28, head: '#e8fffb', ripple: '255,255,255' },
  light: { tile: '#e9efed', hi: 'rgba(255,255,255,0.9)', lo: 'rgba(15,23,42,0.1)', glyph: '15,138,126', base: 0.4, head: '#0c3b36', ripple: '15,138,126' },
};

export const currentMatrixTheme = () =>
  document.documentElement.classList.contains('dark') ? matrixThemes.dark : matrixThemes.light;

export const rand = (min, max) => min + Math.random() * (max - min);
export const randomGlyph = () => GLITCH[(Math.random() * GLITCH.length) | 0];

export function createMatrix(cell) {
  let w = 0;
  let h = 0;
  let cols = 0;
  let rows = 0;
  let cells = []; // glyph per cell, row-major
  let heads = []; // per column: { y, speed }
  let cache = null; // pre-rendered unlit grid for drawFull
  let cacheTheme = null;
  let cacheDpr = 1;
  const s = cell - 1;

  const font = `600 ${Math.round(cell * 0.72)}px "JetBrains Mono", ui-monospace, monospace`;

  const prep = (ctx) => {
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  };

  // Cube: flat face with a light top-left edge and a shaded bottom-right edge.
  const drawTile = (ctx, theme, x, y) => {
    ctx.fillStyle = theme.tile;
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = theme.hi;
    ctx.fillRect(x, y, s, 1);
    ctx.fillRect(x, y, 1, s);
    ctx.fillStyle = theme.lo;
    ctx.fillRect(x, y + s - 1, s, 1);
    ctx.fillRect(x + s - 1, y, 1, s);
  };

  const drawGlyph = (ctx, theme, col, row, glow) => {
    const x = col * cell;
    const y = row * cell;
    const d = heads[col].y - row;
    const lit = d >= 0 && d < TRAIL ? 1 - d / TRAIL : 0;
    let ch = cells[row * cols + col];
    if (lit > 0.6 && Math.random() < 0.06) ch = randomGlyph(); // brief glitch near the head
    if (d >= 0 && d < 1) {
      ctx.fillStyle = theme.head;
      ctx.shadowColor = `rgb(${theme.glyph})`;
      ctx.shadowBlur = glow;
    } else {
      ctx.fillStyle = `rgba(${theme.glyph},${theme.base + lit * (1 - theme.base)})`;
      ctx.shadowBlur = 0;
    }
    ctx.fillText(ch, x + s / 2, y + s / 2 + 0.5);
  };

  return {
    resize(width, height) {
      w = width;
      h = height;
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      // Each column starts at a random point in the code and reads downward.
      cells = new Array(cols * rows);
      for (let col = 0; col < cols; col++) {
        const start = (Math.random() * CODE.length) | 0;
        for (let row = 0; row < rows; row++) cells[row * cols + col] = CODE[(start + row) % CODE.length];
      }
      heads = Array.from({ length: cols }, () => ({ y: rand(-rows, rows), speed: rand(0.18, 0.5) }));
      cache = null;
    },

    step() {
      for (const head of heads) {
        head.y += head.speed;
        if (head.y - TRAIL > rows) {
          head.y = rand(-rows * 0.5, 0);
          head.speed = rand(0.18, 0.5);
        }
      }
    },

    /** Draw every cube inside `box` (CSS px). Used where only part of the matrix is visible. */
    drawRegion(ctx, theme, box, glow) {
      const c0 = Math.max(0, Math.floor(box.x0 / cell));
      const c1 = Math.min(cols - 1, Math.floor(box.x1 / cell));
      const r0 = Math.max(0, Math.floor(box.y0 / cell));
      const r1 = Math.min(rows - 1, Math.floor(box.y1 / cell));
      ctx.clearRect(0, 0, w, h);
      prep(ctx);
      for (let col = c0; col <= c1; col++) {
        for (let row = r0; row <= r1; row++) {
          drawTile(ctx, theme, col * cell, row * cell);
          drawGlyph(ctx, theme, col, row, glow);
        }
      }
      ctx.shadowBlur = 0;
    },

    /** Draw the whole screen: a cached unlit grid, then only the lit stream cells on top. */
    drawFull(ctx, theme, glow, dpr) {
      if (!cache || cacheTheme !== theme || cacheDpr !== dpr) {
        cache = document.createElement('canvas');
        cache.width = w * dpr;
        cache.height = h * dpr;
        const cctx = cache.getContext('2d');
        cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        prep(cctx);
        for (let col = 0; col < cols; col++) {
          for (let row = 0; row < rows; row++) {
            drawTile(cctx, theme, col * cell, row * cell);
            cctx.fillStyle = `rgba(${theme.glyph},${theme.base})`;
            cctx.fillText(cells[row * cols + col], col * cell + s / 2, row * cell + s / 2 + 0.5);
          }
        }
        cacheTheme = theme;
        cacheDpr = dpr;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(cache, 0, 0, w, h);
      prep(ctx);
      for (let col = 0; col < cols; col++) {
        const head = heads[col].y;
        const r0 = Math.max(0, Math.ceil(head - TRAIL));
        const r1 = Math.min(rows - 1, Math.floor(head));
        for (let row = r0; row <= r1; row++) {
          drawTile(ctx, theme, col * cell, row * cell);
          drawGlyph(ctx, theme, col, row, glow);
        }
      }
      ctx.shadowBlur = 0;
    },
  };
}
