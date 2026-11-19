// Writes public/codejack-icon.svg, the CodeJack logo: a low-poly stag head (slate greys, with tall gold-and-
// charcoal antlers and teal-to-indigo eyes and accents) standing in front of a tilted Ace of Spades, over the
// site's code-matrix cubes. Used as the CodeJack header badge, the landing page logo and the learn.html tab icon.
//   node scripts/codejack-logo.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '../public/codejack-icon.svg');
const S = 256; // drawing size; the SVG scales to any size
const CX = 140; // the stag is mirrored about this line (right of centre, leaving room for the card)

const TEAL = '#3fd1bf';
const INDIGO = '#9196f6';
const GOLD = '#e0a43a';
const GOLD_LIGHT = '#f6cd6a';
const HORN = '#232a33'; // the charcoal faces of the antlers

const n = (v) => Math.round(v * 10) / 10;
const pts = (p) => p.map(([x, y]) => `${n(x)},${n(y)}`).join(' ');
// Shapes are written for the viewer's left half as [dx, y], dx measured from the centre line (negative = left).
const at = (p, right) => p.map(([dx, y]) => [CX + (right ? -dx : dx), y]);

/** Darken a #rrggbb colour by factor k, for the shadowed right side. */
const shade = (hex, k) => {
  if (!hex.startsWith('#')) return hex;
  const c = [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

/**
 * A tapered antler segment split lengthwise into two facets, like the gilded horn in the reference: one half
 * gold, the other charcoal. Returns [goldHalf, darkHalf] as point lists. `goldInside` puts the gold on the side
 * facing the head.
 */
function hornFacets(p, w0, w1, goldInside, right) {
  const A = []; // offset to one side
  const B = []; // offset to the other
  p.forEach(([x, y], i) => {
    const [ax, ay] = p[Math.max(0, i - 1)];
    const [bx, by] = p[Math.min(p.length - 1, i + 1)];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    const h = (w0 + (w1 - w0) * (i / (p.length - 1))) / 2;
    A.push([x + nx * h, y + ny * h]);
    B.push([x - nx * h, y - ny * h]);
  });
  const [lx, ly] = p[p.length - 1];
  const [px, py] = p[p.length - 2];
  const len = Math.hypot(lx - px, ly - py) || 1;
  const tip = [lx + ((lx - px) / len) * w1 * 3, ly + ((ly - py) / len) * w1 * 3];
  const sideA = [...A, tip, ...[...p].reverse()];
  const sideB = [...B, tip, ...[...p].reverse()];
  // For a beam drawn upwards on the left, side A points away from the head (outside).
  const inside = right ? sideA : sideB;
  const outside = right ? sideB : sideA;
  return goldInside ? [inside, outside] : [outside, inside];
}

// ---------------------------------------------------------------- the antlers (as in the reference)

// Tall, lyre-shaped: each beam leans out, then sweeps up and curves back in at the crown, with tines pointing
// up. [points as [dx, y], start width, end width, gold on the inside?]
const ANTLER = [
  [[[-13, 104], [-21, 92], [-34, 78], [-46, 62], [-53, 46], [-55, 30], [-52, 16]], 9, 2.6, true], // main beam
  [[[-19, 95], [-16, 83], [-13, 73], [-12, 64]], 4.6, 1.4, false], // brow tine, inside
  [[[-33, 79], [-29, 66], [-27, 55], [-27, 46]], 4.6, 1.4, false], // second tine, inside
  [[[-45, 64], [-57, 57], [-64, 47], [-67, 38]], 4.4, 1.3, true], // outer tine
  [[[-53, 43], [-47, 33], [-43, 24], [-42, 15]], 4, 1.2, true], // crown, inner point
  [[[-55, 36], [-63, 29], [-67, 20], [-68, 12]], 3.8, 1.1, false], // crown, outer point
];

const BOLD = 1.55; // antler thickness, so the beams read as solid horn at small sizes

// ---------------------------------------------------------------- the head (viewer's left half)

const FACE = [
  [[[-16, 112], [-60, 101], [-51, 121], [-25, 130]], '#262d37'], // ear, outer
  [[[-22, 118], [-53, 105], [-42, 121]], '#46505d'], // ear, middle
  [[[-24, 125], [-45, 112], [-37, 124]], '#687482'], // ear, inner
  [[[0, 100], [-12, 102], [-18, 112], [0, 116]], '#5b6673'], // forehead, top
  [[[-12, 102], [-20, 104], [-18, 112]], '#37404c'], // forehead, corner
  [[[0, 116], [-18, 112], [-14, 124], [0, 126]], '#7b8693'], // forehead, middle
  [[[-18, 112], [-24, 118], [-20, 128], [-14, 124]], '#2d3540'], // brow
  [[[-14, 124], [-20, 128], [-22, 134], [-12, 136], [0, 130], [0, 126]], '#8e98a4'], // around the eye
  [[[-22, 134], [-12, 136], [-14, 142], [-24, 140]], '#262d37'], // tear line
  [[[-24, 118], [-28, 130], [-26, 148], [-24, 140], [-22, 134], [-20, 128]], '#38414d'], // outer cheek
  [[[0, 130], [-12, 136], [-8, 156], [0, 160]], '#c6ced6'], // bridge
  [[[-12, 136], [-14, 142], [-12, 158], [-8, 156]], '#a3adb8'], // side of the bridge
  [[[-24, 140], [-14, 142], [-12, 158], [-18, 162], [-26, 148]], '#6a7582'], // lower cheek
  [[[-8, 156], [-12, 158], [-11, 168], [-4, 166], [0, 160]], '#e4e9ee'], // muzzle
  [[[-12, 158], [-18, 162], [-16, 172], [-11, 168]], '#ced5dc'], // side of the muzzle
  [[[0, 161], [-3, 165], [-6.5, 168], [-5.5, 173], [0, 172]], '#101419'], // nose
  [[[-11, 168], [-16, 172], [-10, 180], [0, 182], [0, 172], [-8, 174]], '#b8c1ca'], // chin
  [[[-26, 148], [-18, 162], [-16, 172], [-10, 180], [-20, 184], [-30, 166]], '#262d37'], // jaw
  [[[-30, 166], [-20, 184], [-10, 180], [0, 182], [0, 200], [-16, 204], [-30, 190]], '#1e252e'], // upper neck
  [[[-10, 180], [0, 182], [0, 200], [-8, 196]], '#46505d'], // throat highlight
  [[[-30, 190], [-16, 204], [0, 200], [0, 246], [-12, 226], [-26, 207]], '#161b22'], // lower neck
  [[[-16, 204], [0, 200], [0, 228]], '#2a313b'], // front of the neck
];
// Accents in the site's colours: [points, fill]. Left side teal, right side indigo.
const ACCENTS = [
  [[[-26, 207], [-12, 226], [-22, 214]], 'side'], // neck flash
  [[[-30, 190], [-34, 182], [-26, 186]], 'side'], // shoulder glint
  [[[-18, 112], [-24, 118], [-20, 116]], 'side'], // brow glint
];
const EYE = [[-21, 131], [-14.5, 127.5], [-9, 131.5], [-15, 134.5]];

function stag() {
  const parts = [];
  for (const right of [false, true]) {
    const tone = (f) => (right ? shade(f, 0.84) : f);
    const side = right ? INDIGO : TEAL;
    for (const [p, w0, w1, goldInside] of ANTLER) {
      const [gold, dark] = hornFacets(at(p, right), w0 * BOLD, w1 * BOLD, goldInside, right);
      parts.push(`<polygon points="${pts(gold)}" fill="url(#cj-gold)" />`);
      parts.push(`<polygon points="${pts(dark)}" fill="${tone(HORN)}" />`);
    }
    for (const [p, fill] of FACE) parts.push(`<polygon points="${pts(at(p, right))}" fill="${tone(fill)}" />`);
    for (const [p] of ACCENTS) parts.push(`<polygon points="${pts(at(p, right))}" fill="${side}" />`);
    parts.push(`<polygon points="${pts(at(EYE, right))}" fill="${side}" />`);
    const [[ex, ey]] = at([[-15, 131.2]], right);
    parts.push(`<circle cx="${ex}" cy="${ey}" r="1.6" fill="#0b0e12" />`);
  }
  return parts.join('\n      ');
}

// ---------------------------------------------------------------- the code matrix and the card

function matrix() {
  const cubes = [];
  const marks = [];
  const lit = { 0: [0.9, 0.65, 0.45, 0.3, 0.18], 7: [0, 0, 0, 0.18, 0.3, 0.45, 0.65, 0.9] };
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      cubes.push(`<rect x="${c * 32 + 2}" y="${r * 32 + 2}" width="28" height="28" rx="5" />`);
      const a = lit[c]?.[r] || ((r * 3 + c * 5) % 7 === 0 ? 0.18 : 0);
      if (a) marks.push(`<rect x="${c * 32 + 8}" y="${r * 32 + 13}" width="${12 + ((r + c) % 3) * 2}" height="6" rx="3" opacity="${a}" />`);
    }
  }
  return { cubes: cubes.join(''), marks: marks.join('') };
}

const SPADE = 'M0-5C2-2 5 0 5 2.2C5 4 3 5 1.4 4L2.2 6.5H-2.2L-1.4 4C-3 5-5 4-5 2.2C-5 0-2-2 0-5Z';
const { cubes, marks } = matrix();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="CodeJack">
  <!-- CodeJack logo, generated by scripts/codejack-logo.mjs: a low-poly stag with gold antlers in front of a
       tilted Ace of Spades, over code-matrix cubes. -->
  <defs>
    <linearGradient id="cj-gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${GOLD_LIGHT}" />
      <stop offset="1" stop-color="${GOLD}" />
    </linearGradient>
    <linearGradient id="cj-site" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${TEAL}" />
      <stop offset="1" stop-color="${INDIGO}" />
    </linearGradient>
    <linearGradient id="cj-card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1c232c" />
      <stop offset="1" stop-color="#11161c" />
    </linearGradient>
    <radialGradient id="cj-pool" cx="132" cy="134" r="130" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#08090c" stop-opacity="0.9" />
      <stop offset="0.65" stop-color="#08090c" stop-opacity="0.4" />
      <stop offset="1" stop-color="#08090c" stop-opacity="0" />
    </radialGradient>
    <filter id="cj-lift" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.6" />
    </filter>
    <clipPath id="cj-clip"><rect width="${S}" height="${S}" rx="56" /></clipPath>
    <path id="cj-spade" d="${SPADE}" />
  </defs>
  <g clip-path="url(#cj-clip)">
    <rect width="${S}" height="${S}" fill="#0a0b0e" />
    <g fill="#12171d">${cubes}</g>
    <g fill="${TEAL}">${marks}</g>
    <rect width="${S}" height="${S}" fill="url(#cj-pool)" />

    <!-- the Ace of Spades, tilted behind the stag with its corner showing -->
    <g transform="rotate(-16 82 150)" filter="url(#cj-lift)">
      <rect x="26" y="72" width="112" height="156" rx="12" fill="url(#cj-card)" stroke="url(#cj-site)" stroke-width="3.5" />
      <rect x="34" y="80" width="96" height="140" rx="7" fill="none" stroke="${TEAL}" stroke-opacity="0.3" stroke-width="1.2" />
      <use href="#cj-spade" transform="translate(82 152) scale(7)" fill="url(#cj-site)" fill-opacity="0.22" />
      <g fill="url(#cj-site)" font-family="Georgia, 'Times New Roman', serif" font-weight="700">
        <text x="38" y="104" font-size="26">A</text>
        <use href="#cj-spade" transform="translate(47 119) scale(1.5)" />
      </g>
    </g>

    <!-- the stag -->
    <g transform="translate(${CX} 142) scale(0.93) translate(-${CX} -134)" filter="url(#cj-lift)" stroke="#0a0b0e" stroke-opacity="0.3" stroke-width="0.6" stroke-linejoin="round">
      ${stag()}
    </g>
  </g>
</svg>
`;
writeFileSync(out, svg);
console.log(`Wrote ${out}`);
