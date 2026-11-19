// A geometric, low-poly stag head for the welcome-screen code matrix: flat facets in three tones (sage on
// the left, tan down the middle, terracotta on the right) with thin gaps between them, and wide, thin
// antlers. It is painted on a small off-screen canvas and sampled per grid cell, so every cube gets a
// coverage (0 to 1) and the colour of the facet under it. The matrix tints its cubes with that.

const SAGE = [143, 163, 146];
const TAN = [214, 184, 150];
const TERRA = [190, 108, 88];

// Drawing space (left half; the right half is mirrored about CX). y grows downwards.
const CX = 232;
const BOX = { x0: 40, y0: 286, x1: 424, y1: 626 };
const GAP = 3.2; // width of the gaps cut between facets

// Head facets on the viewer's left: [points, colour]. Mirrored for the right with sage → terracotta.
const HEAD = [
  [[[137, 479], [186, 491], [180, 520], [158, 516]], SAGE], // ear
  [[[186, 491], [208, 489], [198, 520], [182, 522]], TAN], // temple
  [[[208, 489], [232, 492], [232, 527], [198, 520]], TAN], // forehead
  [[[182, 522], [198, 520], [200, 530], [192, 552], [184, 530]], SAGE], // brow
  [[[198, 520], [232, 527], [222, 530], [214, 553], [200, 530]], TAN], // eye socket
  [[[184, 530], [192, 552], [214, 553], [210, 590], [205, 600], [194, 572]], SAGE], // cheek
  [[[232, 527], [232, 594], [220, 592], [214, 553], [222, 530]], TAN], // nose bridge
  [[[205, 600], [210, 590], [220, 592], [224, 606], [214, 614]], SAGE], // muzzle side
  [[[220, 592], [232, 594], [232, 606], [224, 606]], TAN], // upper lip
  [[[214, 614], [224, 606], [232, 606], [232, 624], [222, 622]], TERRA], // nose
];
const EYE = [[186, 538], [200, 528], [212, 538], [200, 548]]; // cut out of the eye socket

// Antler on the viewer's left as tapered strokes: [points, start width, end width, colour].
const ANTLER = [
  [[[203, 489], [150, 456], [104, 424], [70, 382], [48, 330]], 12, 4, SAGE], // main beam
  [[[180, 474], [158, 430], [128, 376]], 7, 2, TAN], // inner tine
  [[[197, 486], [190, 452], [188, 424]], 6.5, 2, TAN], // brow tine
  [[[132, 444], [104, 432], [74, 414]], 6.5, 2, SAGE], // lower outer tine
  [[[96, 414], [96, 360], [106, 296]], 6.5, 2, SAGE], // tall tine
  [[[72, 386], [68, 350], [74, 312]], 6, 2, SAGE], // top tine
];

const mirrorX = (pts) => pts.map(([x, y]) => [2 * CX - x, y]);
const rightColour = (c) => (c === SAGE ? TERRA : c);
const rgb = ([r, g, b]) => `rgb(${r},${g},${b})`;

function polygon(ctx, pts) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

/** A polyline drawn as a filled sliver that narrows from w0 to w1, ending in a point. */
function taper(ctx, pts, w0, w1) {
  const n = pts.length;
  const left = [];
  const right = [];
  pts.forEach(([x, y], i) => {
    const [ax, ay] = pts[Math.max(0, i - 1)];
    const [bx, by] = pts[Math.min(n - 1, i + 1)];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    const half = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    left.push([x + nx * half, y + ny * half]);
    right.push([x - nx * half, y - ny * half]);
  });
  const [lx, ly] = pts[n - 1];
  const [px, py] = pts[n - 2];
  const len = Math.hypot(lx - px, ly - py) || 1;
  const tip = [lx + ((lx - px) / len) * w1 * 3, ly + ((ly - py) / len) * w1 * 3];
  polygon(ctx, [...left, tip, ...right.reverse()]);
}

/** Paint the deer in its drawing space: colours where it is, transparent everywhere else. */
function paintDeer(ctx) {
  ctx.lineJoin = 'round';
  for (const right of [false, true]) {
    const flip = right ? mirrorX : (p) => p;
    const colour = right ? rightColour : (c) => c;
    for (const [pts, w0, w1, c] of ANTLER) {
      ctx.fillStyle = rgb(colour(c));
      taper(ctx, flip(pts), w0, w1);
      ctx.fill();
    }
    for (const [pts, c] of HEAD) {
      ctx.fillStyle = rgb(colour(c));
      polygon(ctx, flip(pts));
      ctx.fill();
    }
  }
  // Cut the gaps between head facets, and the eyes, out of the paint.
  ctx.globalCompositeOperation = 'destination-out';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = GAP;
  for (const right of [false, true]) {
    const flip = right ? mirrorX : (p) => p;
    for (const [pts] of HEAD) {
      polygon(ctx, flip(pts));
      ctx.stroke();
    }
    polygon(ctx, flip(EYE));
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
}

const SUPERSAMPLE = 4; // canvas pixels per cell side when sampling, for smooth coverage
const BOOST = 1.6; // thin tines cover only part of a cube; this lifts them so they still read

/**
 * The deer sampled on a `cols`×`rows` grid of `cell`-px cubes, centred on the screen and as large as fits:
 * `weight` (0 to 1, how much of each cell it covers) and `rgb` (the cell's facet colour as "r,g,b").
 */
export function deerMask(cols, rows, cell) {
  const n = cols * rows;
  const weight = new Float32Array(n);
  const rgbOut = new Array(n).fill(null);
  const w = cols * cell;
  const h = rows * cell;
  const bw = BOX.x1 - BOX.x0;
  const bh = BOX.y1 - BOX.y0;
  // On tall, narrow screens the antler tips may run a little past the sides, to keep the head large.
  const scale = Math.min((h * 0.9) / bh, (w * 1.12) / bw);
  if (!(scale > 0)) return { weight, rgb: rgbOut };

  const k = SUPERSAMPLE / cell;
  const canvas = document.createElement('canvas');
  canvas.width = cols * SUPERSAMPLE;
  canvas.height = rows * SUPERSAMPLE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const ox = w / 2 - (BOX.x0 + bw / 2) * scale;
  const oy = h / 2 - (BOX.y0 + bh / 2) * scale;
  ctx.setTransform(k * scale, 0, 0, k * scale, k * ox, k * oy);
  paintDeer(ctx);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let a = 0;
      let r = 0;
      let g = 0;
      let b = 0;
      for (let y = 0; y < SUPERSAMPLE; y++) {
        let i = ((row * SUPERSAMPLE + y) * canvas.width + col * SUPERSAMPLE) * 4;
        for (let x = 0; x < SUPERSAMPLE; x++, i += 4) {
          const al = data[i + 3];
          a += al;
          r += data[i] * al;
          g += data[i + 1] * al;
          b += data[i + 2] * al;
        }
      }
      const cellIndex = row * cols + col;
      weight[cellIndex] = Math.min(1, (BOOST * a) / (SUPERSAMPLE * SUPERSAMPLE * 255));
      if (a > 0) rgbOut[cellIndex] = `${Math.round(r / a)},${Math.round(g / a)},${Math.round(b / a)}`;
    }
  }
  return { weight, rgb: rgbOut };
}
