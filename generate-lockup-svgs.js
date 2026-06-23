#!/usr/bin/env node
// Generates 6 composite lockup SVGs: circular headshot + colored text paths.
// Each SVG scales as a single unit. Run: node generate-lockup-svgs.js

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'images/logos');

// Read and base64-encode the headshot PNG
const headshotB64 = fs.readFileSync(path.join(dir, 'CE-headshot.png')).toString('base64');
const headshotDataUri = `data:image/png;base64,${headshotB64}`;

// Read the text lockup SVG and extract just the inner content (paths)
const textSvgRaw = fs.readFileSync(path.join(dir, 'CG-text-lockup.svg'), 'utf8');
// Strip the outer <svg> wrapper — keep everything between first > and </svg>
const innerPaths = textSvgRaw
  .replace(/^<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .trim();

// Replace fill="black" or fill="#000000" with a placeholder we'll swap per variant
const pathsTemplate = innerPaths.replace(/fill="(black|#000000|#000)"/g, 'fill="{{TEXT_COLOR}}"');

// Composite canvas dimensions — proportional to original CE-lockup.svg (1088×293)
// Photo occupies a square on the left, text on the right.
// We use a 1050×280 viewBox for clean numbers.
const VW = 1050;
const VH = 280;
const PHOTO_D = VH;          // circle bounding box = full height
const PHOTO_R = PHOTO_D / 2; // radius
const GAP = 40;              // gap between photo and text
const TEXT_X = PHOTO_D + GAP;
const TEXT_W = VW - TEXT_X;  // remaining width for text
// CG-text-lockup.svg is 747×167 — scale to fit TEXT_W × VH with vertical centering
const TEXT_SCALE = Math.min(TEXT_W / 747, VH / 167);
const TEXT_H = 167 * TEXT_SCALE;
const TEXT_Y = (VH - TEXT_H) / 2;

const variants = [
  { name: 'charcoal',      bg: '#000913', textColor: '#FFFFFF' },
  { name: 'liberty-green', bg: '#74FBD7', textColor: '#003230' },
  { name: 'deep-teal',     bg: '#003230', textColor: '#74FBD7' },
  { name: 'white',         bg: '#FFFFFF', textColor: '#000913' },
  { name: 'hudson-blue',      bg: '#0004F5', textColor: '#FFFFFF' },
  { name: 'purple',           bg: '#6B1262', textColor: '#74FBD7' },
  { name: 'deep-teal-green',  bg: '#003230', textColor: '#8AF161' },
  { name: 'flag-yellow',      bg: '#EBE825', textColor: '#000913' },
];

for (const { name, bg, textColor } of variants) {
  const paths = pathsTemplate.replace(/\{\{TEXT_COLOR\}\}/g, textColor);

  const svg = `<svg width="${VW}" height="${VH}" viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <clipPath id="circle-clip">
      <circle cx="${PHOTO_R}" cy="${PHOTO_R}" r="${PHOTO_R}"/>
    </clipPath>
  </defs>
  <!-- Background -->
  <rect width="${VW}" height="${VH}" fill="${bg}"/>
  <!-- Headshot in circle -->
  <image href="${headshotDataUri}" x="0" y="0" width="${PHOTO_D}" height="${PHOTO_D}" clip-path="url(#circle-clip)" preserveAspectRatio="xMidYMid slice"/>
  <!-- Text lockup (scaled + translated) -->
  <g transform="translate(${TEXT_X}, ${TEXT_Y}) scale(${TEXT_SCALE.toFixed(6)})">
    ${paths}
  </g>
</svg>`;

  const outPath = path.join(dir, `CE-lockup-${name}.svg`);
  fs.writeFileSync(outPath, svg);
  const kb = (Buffer.byteLength(svg) / 1024).toFixed(0);
  console.log(`✓ CE-lockup-${name}.svg  (${kb} KB)`);
}

console.log('\nDone — 6 composite lockup SVGs generated.');
