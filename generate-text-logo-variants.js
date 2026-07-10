#!/usr/bin/env node
// Regenerates the 5 text-lockup color variants (SVG + PNG) from the new
// master artwork, replacing images/logos/hudson-county_full-logo_text-lockup_*.{svg,png}
// Usage: node generate-text-logo-variants.js

const fs   = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const masterPath = path.join(__dirname, 'Hudson County', 'HC - Full Text', 'Logo-full-text.svg');
const outDir     = path.join(__dirname, 'images', 'logos');
const stem       = 'hudson-county_full-logo_text-lockup';

// Downloadable PNGs are rendered to roughly this width, matching the other
// logo assets in images/logos/. SVGs are resolution-independent.
const TARGET_WIDTH = 3000;

const masterRaw = fs.readFileSync(masterPath, 'utf8');

// Master artwork is fill="black" on every path — replace with each brand color.
const variants = [
  { name: 'black',     color: 'black'    },
  { name: 'deep-teal', color: '#003230'  },
  { name: 'teal',      color: '#74FBD7'  },
  { name: 'green',     color: '#8AF161'  },
  { name: 'white',     color: 'white'    },
];

const HOME     = process.env.HOME || process.env.USERPROFILE;
const CHROMIUM = `${HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

function extractViewBoxSize(svg) {
  const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return { w: parseFloat(m[1]), h: parseFloat(m[2]) };
}

(async () => {
  const { w, h } = extractViewBoxSize(masterRaw);
  const browser  = await chromium.launch({ executablePath: CHROMIUM });

  for (const { name, color } of variants) {
    const svg = masterRaw.replace(/fill="black"/g, `fill="${color}"`);
    fs.writeFileSync(path.join(outDir, `${stem}_${name}.svg`), svg);

    // Render PNG on a transparent background, upscaled to TARGET_WIDTH so the
    // downloadable asset matches the ~3000px-wide originals. deviceScaleFactor
    // + scale:'device' is what actually applies the upscale — scale:'css'
    // silently renders at 1x regardless of viewport.
    const page = await browser.newPage({
      viewport: { width: Math.ceil(w), height: Math.ceil(h) },
      deviceScaleFactor: TARGET_WIDTH / w,
    });
    await page.setContent(`
      <html><head><style>
        html,body{margin:0;padding:0;background:transparent;}
        svg{display:block;}
      </style></head>
      <body>${svg}</body></html>
    `);
    const el = await page.$('svg');
    const pngOut = path.join(outDir, `${stem}_${name}.png`);
    await el.screenshot({ path: pngOut, omitBackground: true, scale: 'device' });
    await page.close();

    const svgKb = (Buffer.byteLength(svg) / 1024).toFixed(0);
    const pngKb = (fs.statSync(pngOut).size / 1024).toFixed(0);
    console.log(`✓ ${stem}_${name}.svg (${svgKb} KB) / .png (${pngKb} KB)`);
  }

  await browser.close();
  console.log('\nDone — 5 text lockup variants regenerated.');
})();
