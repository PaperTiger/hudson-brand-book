#!/usr/bin/env node
// Regenerates the courthouse illustration color variants shown on the
// Illustration > Courthouse page, writing images/illustrations/courthouse_*.svg
// Usage: node generate-courthouse-variants.js
//
// The master is a 1500x1500 artboard with the drawing floating in whitespace,
// so the viewBox is cropped to the artwork's bounds before recoloring.
// The downloadable files live in downloads/courthouse-illustration.zip and are
// not touched by this script.

const fs   = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, 'Hudson County', 'Courthouse illustration', 'courthouse.svg');
const outDir     = path.join(__dirname, 'images', 'illustrations');
const stem       = 'courthouse';

// Artwork bounds in artboard units, measured from the alpha channel of the
// original 6250px square courthouse.png export (49.2, 294.7 to 1450.8, 1205.3),
// padded by 2 units so round stroke caps aren't clipped. Remeasure if the
// master artwork changes.
const VIEWBOX = '47 292 1406 916';

// Master artwork is stroke="#000" on every element, replace with each brand color.
const variants = [
  { name: 'black',     color: 'black'    },
  { name: 'deep-teal', color: '#003230'  },
  { name: 'teal',      color: '#74FBD7'  },
  { name: 'green',     color: '#8AF161'  },
  { name: 'white',     color: 'white'    },
];

const masterRaw = fs.readFileSync(masterPath, 'utf8');
const cropped   = masterRaw.replace(/viewBox="[^"]*"/, `viewBox="${VIEWBOX}"`);

fs.mkdirSync(outDir, { recursive: true });
for (const v of variants) {
  const svg = cropped.replace(/stroke="#000"/g, `stroke="${v.color}"`);
  const out = path.join(outDir, `${stem}_${v.name}.svg`);
  fs.writeFileSync(out, svg);
  console.log(`wrote ${path.relative(__dirname, out)}`);
}
