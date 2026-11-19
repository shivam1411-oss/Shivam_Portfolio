// Writes public/codejack-icon.svg, the CodeJack logo: a low-poly stag head in charcoal with gold antlers and
// eyes, on an Ace of Spades card, over the site's code-matrix cubes. Used as the CodeJack header badge, the
// landing page logo and the learn.html tab icon.
//   node scripts/codejack-logo.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '../public/codejack-icon.svg');
const S = 256; // drawing size; the SVG scales to any size
const CX = 128; // the stag is mirrored about this line

const GOLD = ['#f7cf6b', '#e0a43a', '#b8781c'];
const pts = (p) => p.map(([x, y]) => `${x},${y}`).join(' ');
const mirror = (p) => p.map(([x, y]) => [2 * CX - x, y]);
const n = (v) => Math.round(v * 10) / 10;

/** Darken a #rrggbb colour by factor k (0–1), for the shadowed right side of the face. */
const shade = (hex, k) => {
  if (!hex.startsWith('#')) return hex;
  const c = [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

/** A polyline as a filled sliver narrowing from w0 to w1, ending in a point. */
function taper(p, w0, w1) {
  const L = [];
  const R = [];
  p.forEach(([x, y], i) => {
    const [ax, ay] = p[Math.max(0, i - 1)];
    const [bx, by] = p[Math.min(p.length - 1, i + 1)];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    const h = (w0 + (w1 - w0) * (i / (p.length - 1))) / 2;
    L.push([n(x + nx * h), n(y + ny * h)]);
    R.push([n(x - nx * h), n(y - ny * h)]);
  });
  const [lx, ly] = p[p.length - 1];
  const [px, py] = p[p.length - 2];
  const len = Math.hypot(lx - px, ly - py) || 1;
  return [...L, [n(lx + ((lx - px) / len) * w1 * 2.5), n(ly + ((ly - py) / len) * w1 * 2.5)], ...R.reverse()];
}

// ---------------------------------------------------------------- the stag (viewer's left half)

// Antler: [points, start width, end width, fill]. Gold beams with charcoal tines, like gilded horn.
const ANTLER = [
  [[[118, 102], [104, 92], [90, 80], [80, 64], [78, 48], [82, 33]], 8.5, 2.4, 'url(#cj-gold)'], // main beam
  [[[100, 89], [97, 73], [101, 58]], 4.6, 1.4, '#2b323c'], // inner tine
  [[[86, 75], [75, 67], [66, 59]], 4.2, 1.3, 'url(#cj-gold)'], // outer tine
  [[[80, 59], [87, 50], [93, 40]], 4, 1.2, '#2b323c'], // upper inner tine
  [[[112, 98], [108, 86], [110, 75]], 3.8, 1.2, '#39414c'], // brow tine
  [[[79, 46], [72, 38], [68, 30]], 3.4, 1.1, '#2b323c'], // top outer tine
];
// Face facets, top to bottom: [points, fill].
const FACE = [
  [[[112, 112], [74, 98], [82, 118], [104, 126]], '#2a313b'], // ear
  [[[106, 116], [82, 104], [88, 117]], '#4b5563'], // inner ear
  [[[128, 102], [116, 104], [110, 117], [128, 123]], '#6f7a87'], // forehead
  [[[116, 104], [106, 110], [110, 117]], '#3a434f'], // temple
  [[[110, 117], [128, 123], [124, 136], [111, 133]], '#8c96a2'], // brow
  [[[106, 110], [110, 117], [111, 133], [103, 140], [99, 123]], '#303843'], // outer cheek
  [[[124, 136], [128, 123], [128, 160], [122, 158]], '#c5cdd5'], // bridge
  [[[111, 133], [124, 136], [122, 158], [114, 156], [103, 140]], '#5c6774'], // cheek
  [[[114, 156], [122, 158], [121, 166], [113, 164]], '#e2e7ec'], // muzzle side
  [[[121, 162], [128, 160], [128, 169], [123, 168]], '#11151a'], // nose
  [[[113, 164], [121, 166], [123, 168], [128, 170], [128, 181], [117, 178]], '#b4bdc7'], // chin
  [[[103, 140], [114, 156], [113, 164], [117, 178], [128, 181], [128, 214], [118, 198], [106, 178], [99, 157]], '#1e252e'], // neck
  [[[117, 178], [128, 181], [128, 214]], '#3a434e'], // throat
  [[[99, 157], [106, 178], [97, 172]], 'url(#cj-gold)'], // gold flash on the neck
  [[[110, 117], [104, 121], [106, 113]], 'url(#cj-gold)'], // gold flash over the eye
];
const EYE = [[[110, 131], [116.5, 127.5], [121.5, 131.5], [116, 134]], 'url(#cj-gold)'];

const NARROW = 0.86; // the face is drawn narrower than its coordinates, towards the centre line
const narrow = (p) => p.map(([x, y]) => [n(CX - (CX - x) * NARROW), y]);

function stag() {
  const parts = [];
  for (const right of [false, true]) {
    const flip = right ? mirror : (p) => p;
    const tone = (f) => (right ? shade(f, 0.84) : f);
    for (const [p, w0, w1, fill] of ANTLER) parts.push(`<polygon points="${pts(taper(flip(p), w0, w1))}" fill="${tone(fill)}" />`);
    for (const [p, fill] of FACE) parts.push(`<polygon points="${pts(flip(narrow(p)))}" fill="${tone(fill)}" />`);
    parts.push(`<polygon points="${pts(flip(narrow(EYE[0])))}" fill="${EYE[1]}" />`);
    const ex0 = n(CX - (CX - 116.3) * NARROW);
    const [ex, ey] = right ? [2 * CX - ex0, 131.2] : [ex0, 131.2];
    parts.push(`<circle cx="${ex}" cy="${ey}" r="1.5" fill="#11151a" />`);
  }
  return parts.join('\n      ');
}

// ---------------------------------------------------------------- the code matrix behind

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
const corner = `<text x="57" y="51" font-size="23">A</text><use href="#cj-spade" transform="translate(64.2 64) scale(1.25)" />`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="CodeJack">
  <!-- CodeJack logo, generated by scripts/codejack-logo.mjs: a low-poly stag head with gold antlers on an
       Ace of Spades card, over code-matrix cubes. -->
  <defs>
    <linearGradient id="cj-gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${GOLD[0]}" />
      <stop offset="0.55" stop-color="${GOLD[1]}" />
      <stop offset="1" stop-color="${GOLD[2]}" />
    </linearGradient>
    <linearGradient id="cj-card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b2129" />
      <stop offset="1" stop-color="#11151b" />
    </linearGradient>
    <radialGradient id="cj-pool" cx="128" cy="132" r="128" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#08090c" stop-opacity="0.9" />
      <stop offset="0.65" stop-color="#08090c" stop-opacity="0.4" />
      <stop offset="1" stop-color="#08090c" stop-opacity="0" />
    </radialGradient>
    <clipPath id="cj-clip"><rect width="${S}" height="${S}" rx="56" /></clipPath>
    <path id="cj-spade" d="${SPADE}" />
  </defs>
  <g clip-path="url(#cj-clip)">
    <rect width="${S}" height="${S}" fill="#0a0b0e" />
    <g fill="#12171d">${cubes}</g>
    <g fill="${GOLD[1]}">${marks}</g>
    <rect width="${S}" height="${S}" fill="url(#cj-pool)" />

    <!-- the Ace of Spades -->
    <rect x="46" y="22" width="164" height="214" rx="16" fill="url(#cj-card)" stroke="url(#cj-gold)" stroke-width="4" />
    <rect x="56" y="32" width="144" height="194" rx="9" fill="none" stroke="${GOLD[1]}" stroke-opacity="0.35" stroke-width="1.5" />
    <use href="#cj-spade" transform="translate(128 140) scale(10)" fill="${GOLD[1]}" fill-opacity="0.13" stroke="${GOLD[1]}" stroke-opacity="0.45" stroke-width="0.12" />
    <g fill="url(#cj-gold)" font-family="Georgia, 'Times New Roman', serif" font-weight="700">
      ${corner}
      <g transform="rotate(180 128 129)">${corner}</g>
    </g>

    <!-- the stag, scaled a little so its antler tips clear the corner marks -->
    <g transform="translate(128 136) scale(0.88) translate(-128 -128)" stroke="#0a0b0e" stroke-opacity="0.35" stroke-width="0.6" stroke-linejoin="round">
      ${stag()}
    </g>
  </g>
</svg>
`;
writeFileSync(out, svg);
console.log(`Wrote ${out}`);
