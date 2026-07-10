#!/usr/bin/env node
// Converts each images/logos/<stem>_<color>.svg into a CMYK EPS matching the
// format the original "HCNJ SVG-to-CMYK-EPS converter" produced. The EPS files
// are NOT true press-profiled separations — they use the same naive
// hex->CMYK formula as brand.js (hexToCmyk), so they regenerate losslessly
// from the SVG masters.
//
// Usage: node generate-eps-variants.js <stem>...
//   e.g. node generate-eps-variants.js hudson-county_full-logo_text-lockup
// Writes images/logos/<stem>_<color>.eps for every color variant found.

const fs   = require('fs');
const path = require('path');

// Print color per variant. The `black` variant maps to Charcoal, not #000000:
// the original converter used a rich black for print, and every existing EPS
// follows suit (C:100 M:53 Y:0 K:93). The SVG's fill="black" is only correct
// for on-screen RGB.
const COLORS = {
  black:       '#000913',
  'deep-teal': '#003230',
  teal:        '#74FBD7',
  green:       '#8AF161',
  white:       '#FFFFFF',
};
const outDir = path.join(__dirname, 'images', 'logos');

// Same math as brand.js hexToCmyk — mathematical, not profile-aware — rounded
// to whole percent to match the original converter's output.
function hexToCmyk(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 100];
  const pc = v => Math.round(((1 - v - k) / (1 - k)) * 100);
  return [pc(r), pc(g), pc(b), Math.round(k * 100)];
}

const f4 = v => v.toFixed(4);

// Parse an SVG path `d` of absolute commands (M L H V C Z) into PostScript.
// The EPS wraps output in `1 -1 scale`, so SVG coords pass through unflipped.
function pathToPs(d) {
  const toks = d.match(/[MLHVCZ]|-?[\d.]+(?:e-?\d+)?/gi);
  const ps = [];
  let cx = 0, cy = 0, i = 0, cmd = null;
  const num = () => parseFloat(toks[i++]);
  while (i < toks.length) {
    const t = toks[i];
    if (/[MLHVCZ]/i.test(t)) { cmd = t; i++; }
    switch (cmd) {
      case 'M': cx = num(); cy = num(); ps.push(`${f4(cx)} ${f4(cy)} moveto`); cmd = 'L'; break;
      case 'L': cx = num(); cy = num(); ps.push(`${f4(cx)} ${f4(cy)} lineto`); break;
      case 'H': cx = num();             ps.push(`${f4(cx)} ${f4(cy)} lineto`); break;
      case 'V': cy = num();             ps.push(`${f4(cx)} ${f4(cy)} lineto`); break;
      case 'C': {
        const x1 = num(), y1 = num(), x2 = num(), y2 = num(); cx = num(); cy = num();
        ps.push(`${f4(x1)} ${f4(y1)} ${f4(x2)} ${f4(y2)} ${f4(cx)} ${f4(cy)} curveto`); break;
      }
      case 'Z': case 'z': ps.push('closepath'); break; // no operands; letter already consumed
      default: i++; // skip anything unexpected rather than loop forever
    }
  }
  return ps;
}

function svgToEps(svg, hex, title) {
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const W = parseFloat(vb[1]), H = parseFloat(vb[2]);
  const [c, m, y, k] = hexToCmyk(hex);           // whole-percent CMYK
  const ds = [...svg.matchAll(/\sd="([^"]+)"/g)].map(x => x[1]);

  const out = [
    '%!PS-Adobe-3.0 EPSF-3.0',
    `%%BoundingBox: 0 0 ${Math.ceil(W)} ${Math.ceil(H)}`,
    `%%HiResBoundingBox: 0.0000 0.0000 ${f4(W)} ${f4(H)}`,
    '%%Creator: HCNJ SVG-to-CMYK-EPS converter',
    `%%Title: ${title}`,
    '%%EndComments', '%%BeginProlog', '%%EndProlog', '%%Page: 1 1', '',
    '% Align PostScript y-axis with SVG (origin top-left, y downward)',
    `0 ${f4(H)} translate`, '1 -1 scale', '',
    `% CMYK (C:${c} M:${m} Y:${y} K:${k})`,
    `${f4(c/100)} ${f4(m/100)} ${f4(y/100)} ${f4(k/100)} setcmykcolor`, '',
  ];
  for (const d of ds) out.push('newpath', ...pathToPs(d), 'fill', '');
  out.push('%%Trailer', '%%EOF');
  return out.join('\n');
}

const stems = process.argv.slice(2);
if (!stems.length) { console.error('usage: node generate-eps-variants.js <stem>...'); process.exit(1); }

for (const stem of stems) {
  for (const color of Object.keys(COLORS)) {
    const svgPath = path.join(outDir, `${stem}_${color}.svg`);
    if (!fs.existsSync(svgPath)) continue;
    const title = `${stem}_${color}.eps`;
    fs.writeFileSync(path.join(outDir, `${stem}_${color}.eps`),
                     svgToEps(fs.readFileSync(svgPath, 'utf8'), COLORS[color], title));
    console.log(`✓ ${stem}_${color}.eps`);
  }
}
