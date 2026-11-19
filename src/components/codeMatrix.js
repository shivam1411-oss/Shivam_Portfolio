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

// base/max: glyph opacity when unlit / at the brightest point of a stream. glow: allow a halo on stream heads.
// shape/tint: for a picture drawn in the grid (createMatrix's `shape` option), the unlit glyph opacity and the
// strength of the picture's colour washed over the cube face, where the picture fully covers a cube.
// vivid: use the picture's bright palette (for dark backgrounds) instead of its soft one.
export const matrixThemes = {
  dark: { tile: '#0d1614', hi: 'rgba(255,255,255,0.07)', lo: 'rgba(0,0,0,0.5)', glyph: '63,209,191', base: 0.28, max: 1, shape: 1, tint: 0.62, vivid: true, head: '#e8fffb', glow: true, ripple: '255,255,255', rippleAlpha: 0.25 },
  light: { tile: '#e9efed', hi: 'rgba(255,255,255,0.9)', lo: 'rgba(15,23,42,0.1)', glyph: '15,138,126', base: 0.4, max: 1, shape: 1, tint: 0.6, head: '#0c3b36', glow: true, ripple: '15,138,126', rippleAlpha: 0.25 },
  // Behind page content: dim enough that body text stays easy to read over it.
  darkSubtle: { tile: '#0c1412', hi: 'rgba(255,255,255,0.035)', lo: 'rgba(0,0,0,0.4)', glyph: '63,209,191', base: 0.07, max: 0.3, shape: 0.9, tint: 0.55, vivid: true, head: 'rgba(63,209,191,0.45)', glow: false, ripple: '63,209,191', rippleAlpha: 0.1 },
  lightSubtle: { tile: '#f0f3f2', hi: 'rgba(255,255,255,0.7)', lo: 'rgba(15,23,42,0.05)', glyph: '15,138,126', base: 0.1, max: 0.32, shape: 0.7, tint: 0.5, head: 'rgba(15,138,126,0.5)', glow: false, ripple: '15,138,126', rippleAlpha: 0.12 },
};

/** `subtle` picks the dimmer palette used behind page content; the full one is for the welcome screen. */
export const currentMatrixTheme = (subtle = false) => {
  const dark = document.documentElement.classList.contains('dark');
  if (subtle) return dark ? matrixThemes.darkSubtle : matrixThemes.lightSubtle;
  return dark ? matrixThemes.dark : matrixThemes.light;
};

export const rand = (min, max) => min + Math.random() * (max - min);
export const randomGlyph = () => GLITCH[(Math.random() * GLITCH.length) | 0];

/**
 * `shape(cols, rows, cell)`, optional, returns a picture sampled per cell (row-major): `weight`, 0 to 1, how much
 * of the cube it covers, and `rgb`, its colour there as "r,g,b" (or null), optionally `rgbVivid` for themes marked `vivid`. Covered cubes take that colour, so
 * the grid shows the picture (the welcome screen's deer head). Themes without `shape`/`tint` ignore it.
 */
export function createMatrix(cell, { shape: shapeFn } = {}) {
  let w = 0;
  let h = 0;
  let cols = 0;
  let rows = 0;
  let cells = []; // glyph per cell, row-major
  let heads = []; // per column: { y, speed }
  let shape = null; // { weight, rgb } per cell, or null
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
  const drawTile = (ctx, theme, x, y, i = -1) => {
    ctx.fillStyle = theme.tile;
    ctx.fillRect(x, y, s, s);
    const weight = i >= 0 ? weightAt(theme, i) : 0;
    if (weight > 0) {
      ctx.fillStyle = `rgba(${colours(theme)[i]},${weight * theme.tint})`;
      ctx.fillRect(x, y, s, s);
    }
    ctx.fillStyle = theme.hi;
    ctx.fillRect(x, y, s, 1);
    ctx.fillRect(x, y, 1, s);
    ctx.fillStyle = theme.lo;
    ctx.fillRect(x, y + s - 1, s, 1);
    ctx.fillRect(x + s - 1, y, 1, s);
  };

  const colours = (theme) => (theme.vivid && shape.rgbVivid ? shape.rgbVivid : shape.rgb);
  // How strongly the picture shows on cube i under this theme (0 when the theme or the matrix has none).
  function weightAt(theme, i) {
    return shape && theme.tint && shape.rgb[i] ? shape.weight[i] : 0;
  }
  // Unlit glyph colour and opacity: the theme's, or the picture's colour, brighter, inside the picture.
  const glyphColour = (theme, i) => (weightAt(theme, i) > 0.3 ? colours(theme)[i] : theme.glyph);
  const baseAlpha = (theme, i) => theme.base + weightAt(theme, i) * ((theme.shape ?? theme.base) - theme.base);

  const drawGlyph = (ctx, theme, col, row, glow) => {
    const x = col * cell;
    const y = row * cell;
    const i = row * cols + col;
    const d = heads[col].y - row;
    const lit = d >= 0 && d < TRAIL ? 1 - d / TRAIL : 0;
    let ch = cells[i];
    if (lit > 0.6 && Math.random() < 0.06) ch = randomGlyph(); // brief glitch near the head
    if (d >= 0 && d < 1) {
      ctx.fillStyle = theme.head;
      ctx.shadowColor = `rgb(${theme.glyph})`;
      ctx.shadowBlur = theme.glow ? glow : 0;
    } else {
      const base = baseAlpha(theme, i);
      ctx.fillStyle = `rgba(${glyphColour(theme, i)},${base + lit * (Math.max(theme.max, base) - base)})`;
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
      shape = shapeFn ? shapeFn(cols, rows, cell) : null;
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
          drawTile(ctx, theme, col * cell, row * cell, row * cols + col);
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
            const i = row * cols + col;
            drawTile(cctx, theme, col * cell, row * cell, i);
            cctx.fillStyle = `rgba(${glyphColour(theme, i)},${baseAlpha(theme, i)})`;
            cctx.fillText(cells[i], col * cell + s / 2, row * cell + s / 2 + 0.5);
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
          drawTile(ctx, theme, col * cell, row * cell, row * cols + col);
          drawGlyph(ctx, theme, col, row, glow);
        }
      }
      ctx.shadowBlur = 0;
    },
  };
}
