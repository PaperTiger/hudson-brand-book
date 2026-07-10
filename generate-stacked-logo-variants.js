#!/usr/bin/env node
// Regenerates the 5 stacked-logo color variants (SVG + PNG) from the new
// master artwork, replacing images/logos/Hudson-County_logo-stacked_*.{svg,png}
// Usage: node generate-stacked-logo-variants.js

const fs   = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const masterPath = path.join(__dirname, 'Hudson County', 'Hudson County - Stacked', 'logo-stacked.svg');
const outDir      = path.join(__dirname, 'images', 'logos');

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
    const svgOut = path.join(outDir, `Hudson-County_logo-stacked_${name}.svg`);
    fs.writeFileSync(svgOut, svg);

    // Render PNG at 2x scale on a transparent background
    const scale = 2;
    const page  = await browser.newPage({ viewport: { width: Math.ceil(w), height: Math.ceil(h) } });
    await page.setViewportSize({ width: Math.ceil(w), height: Math.ceil(h) });
    await page.setContent(`
      <html><head><style>
        html,body{margin:0;padding:0;background:transparent;}
        svg{display:block;}
      </style></head>
      <body>${svg}</body></html>
    `);
    const el = await page.$('svg');
    const pngOut = path.join(outDir, `Hudson-County_logo-stacked_${name}.png`);
    await el.screenshot({ path: pngOut, omitBackground: true, scale: 'css' });
    await page.close();

    const svgKb = (Buffer.byteLength(svg) / 1024).toFixed(0);
    const pngKb = (fs.statSync(pngOut).size / 1024).toFixed(0);
    console.log(`✓ Hudson-County_logo-stacked_${name}.svg (${svgKb} KB) / .png (${pngKb} KB)`);
  }

  await browser.close();
  console.log('\nDone — 5 stacked logo variants regenerated.');
})();
