#!/usr/bin/env node
/*
 * measure-clearspace.js
 *
 * Computes the `data-cs-cap` ratio for a logo SVG, the number the responsive
 * clearspace diagrams need. See clearspace-system.md for the full system.
 *
 *   data-cs-cap = x (in the artwork's own units) / artwork width
 *
 * Because the ratio is derived from the artwork's own geometry, the diagram
 * stays correct at every rendered size.
 *
 * Usage:
 *   node measure-clearspace.js <file.svg> [more.svg ...] [options]
 *
 * Options:
 *   --render-width <px>   Also print the calibrated inline --cs-x fallback for
 *                         a logo rendered at this width.
 *   --x-range <a,b>       Only consider glyphs whose horizontal centre falls in
 *                         this slice of the artwork, as fractions of the width.
 *                         Use it to ignore a seal on the left or a signature on
 *                         the right, e.g. --x-range 0.25,1
 *   --min-cluster <n>     Smallest number of same-height glyphs that counts as a
 *                         line of capitals. Default 3.
 *   --tolerance <n>       Height spread allowed inside one cluster, as a
 *                         fraction. Default 0.03 (3%).
 *   --json                Emit JSON instead of a table.
 *
 * Reference letters are found geometrically, so the script cannot know which
 * letter is an "H". It finds the tallest *cluster* of equal-height shapes,
 * which is the top line of capitals in every lockup in this system. Always
 * eyeball the rendered diagram afterwards.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const HOME = process.env.HOME || process.env.USERPROFILE;
const CHROMIUM =
  process.env.CHROMIUM_PATH ||
  `${HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

// Width the SVG is rendered at for measurement. Any value works, everything is
// normalised to a ratio, but a large one keeps sub-pixel rounding negligible.
const PROBE_WIDTH = 2000;

function parseArgs(argv) {
  const opts = {
    files: [],
    renderWidth: null,
    xRange: [0, 1],
    minCluster: 3,
    tolerance: 0.05,
    json: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '--render-width') opts.renderWidth = parseFloat(argv[++i]);
    else if (a === '--min-cluster') opts.minCluster = parseInt(argv[++i], 10);
    else if (a === '--tolerance') opts.tolerance = parseFloat(argv[++i]);
    else if (a === '--x-range') {
      const [lo, hi] = argv[++i].split(',').map(Number);
      opts.xRange = [lo, hi];
    } else if (a.startsWith('--')) {
      throw new Error(`Unknown option: ${a}`);
    } else opts.files.push(a);
  }
  return opts;
}

/* Runs inside the page. Measures every drawable shape with
   getBoundingClientRect, not getBBox, so that transforms on ancestor <g>
   elements are accounted for. getBBox reports a shape's own user space and
   silently ignores a translate/scale further up the tree, which is a quiet
   source of wrong ratios. */
function collectShapes({ tolerance, xRange }) {
  const svg = document.querySelector('svg');
  const svgBox = svg.getBoundingClientRect();

  const SHAPES = 'path, rect, circle, ellipse, polygon, polyline, line';
  // Masking and template geometry is not artwork. Figma exports leave plenty.
  const HIDDEN = 'defs, mask, clipPath, pattern, symbol, marker';

  const shapes = [...svg.querySelectorAll(SHAPES)]
    .filter((el) => !el.closest(HIDDEN))
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        h: r.height / svgBox.width, // normalised against WIDTH, as the ratio is
        w: r.width / svgBox.width,
        x: (r.left - svgBox.left) / svgBox.width,
        y: (r.top - svgBox.top) / svgBox.width,
        cx: (r.left + r.width / 2 - svgBox.left) / svgBox.width,
      };
    })
    .filter((s) => s.h > 0.001 && s.w > 0.0002)
    .filter((s) => s.cx >= xRange[0] && s.cx <= xRange[1]);

  const median = (arr) => {
    const s = [...arr].sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };

  // Cluster into lines of type. Two shapes belong together only if they are
  // the same height AND start at the same vertical position.
  //
  // Height alone is not enough: HUDSON and COUNTY share a cap height but sit
  // on different baselines, and merging them measures the whole block as if it
  // were one letter, roughly doubling the answer.
  //
  // Vertical overlap alone is not enough either: a seal's internal detail
  // paths overlap every line of type and swamp the real glyphs.
  //
  // The tolerance has to absorb overshoot. Round letters (O, C, S, U) are cut
  // slightly taller than flat ones so they do not look small, which puts them
  // about 1.5% out on height and on top edge. It stays far tighter than the
  // leading between lines, so separate lines never merge.
  shapes.sort((a, b) => b.h - a.h);
  const clusters = [];
  for (const s of shapes) {
    const fit = clusters.find(
      (c) =>
        Math.abs(s.h - c.height) <= c.height * tolerance &&
        Math.abs(s.y - c.yTop) <= c.height * tolerance
    );
    if (fit) fit.members.push(s);
    else clusters.push({ height: s.h, yTop: s.y, members: [s] });
  }

  return {
    aspect: svgBox.width / svgBox.height,
    clusters: clusters
      .map((c) => {
        const heights = c.members.map((m) => m.h);
        return {
          // Cap height is the height of a flat-topped letter such as H, E or N.
          // The ink extent of the line runs about 1.5% high because the round
          // letters overshoot it at both ends. Flat letters outnumber round
          // ones in practice, so the median glyph height is the cap height and
          // one stray outlier cannot move it.
          height: median(heights),
          inkExtent:
            Math.max(...c.members.map((m) => m.y + m.h)) -
            Math.min(...c.members.map((m) => m.y)),
          count: c.members.length,
          xMin: Math.min(...c.members.map((m) => m.x)),
          xMax: Math.max(...c.members.map((m) => m.x + m.w)),
          yTop: Math.min(...c.members.map((m) => m.y)),
        };
      })
      .sort((a, b) => b.height - a.height),
  };
}

function chooseCluster(clusters, minCluster) {
  // A signature flourish or a seal is usually one tall path; a line of capitals
  // is many shapes of equal height. Prefer the tallest genuine cluster.
  const solid = clusters.find((c) => c.count >= minCluster);
  if (solid) return { cluster: solid, confidence: 'high', note: null };

  const pair = clusters.find((c) => c.count >= 2);
  if (pair)
    return {
      cluster: pair,
      confidence: 'medium',
      note: `No cluster of ${minCluster}+ equal-height shapes. Using a cluster of ${pair.count}. Verify visually.`,
    };

  return {
    cluster: clusters[0],
    confidence: 'low',
    note: 'Every shape is a different height, so the letters are probably merged into one compound path. The measurement is the tallest shape, which is right for a merged single-line wordmark and wrong for anything else. Verify visually.',
  };
}

async function measure(file, page, opts) {
  const svgRaw = fs.readFileSync(file, 'utf8');

  await page.setContent(
    `<!doctype html><meta charset="utf-8">
     <style>html,body{margin:0;padding:0}
            svg{width:${PROBE_WIDTH}px;height:auto;display:block}</style>
     ${svgRaw}`,
    { waitUntil: 'load' }
  );

  const { aspect, clusters } = await page.evaluate(collectShapes, {
    tolerance: opts.tolerance,
    xRange: opts.xRange,
  });

  if (!clusters.length) throw new Error('No drawable shapes found');

  const { cluster, confidence, note } = chooseCluster(clusters, opts.minCluster);

  return {
    file: path.basename(file),
    aspect: +aspect.toFixed(4),
    capHeightRatio: cluster.height, // cap height / artwork width
    glyphsMatched: cluster.count,
    capXRange: [+cluster.xMin.toFixed(3), +cluster.xMax.toFixed(3)],
    confidence,
    note,
    ratio_fullCap: +cluster.height.toFixed(6),
    ratio_halfCap: +(cluster.height / 2).toFixed(6),
    // Ink extent of the same line, overshoot included. Runs 1 to 3% above the
    // cap height. Only useful for reconciling against a number that was
    // measured the old way.
    ratio_inkExtent: +cluster.inkExtent.toFixed(6),
    candidates: clusters.slice(0, 6).map((c) => ({
      height: +c.height.toFixed(6),
      count: c.count,
      xRange: [+c.xMin.toFixed(3), +c.xMax.toFixed(3)],
    })),
  };
}

(async () => {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.files.length) {
    console.error('Usage: node measure-clearspace.js <file.svg> [...] [--render-width 280]');
    console.error('Run with no files for this message. See clearspace-system.md.');
    process.exit(1);
  }

  const browser = await chromium.launch({ executablePath: CHROMIUM });
  const page = await browser.newPage();
  const results = [];

  for (const f of opts.files) {
    try {
      results.push(await measure(f, page, opts));
    } catch (err) {
      results.push({ file: path.basename(f), error: err.message });
    }
  }

  await browser.close();

  if (opts.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  for (const r of results) {
    console.log('\n' + '─'.repeat(72));
    console.log(r.file);
    console.log('─'.repeat(72));

    if (r.error) {
      console.log(`  ERROR: ${r.error}`);
      continue;
    }

    console.log(`  aspect ratio        ${r.aspect}:1`);
    console.log(`  glyphs matched      ${r.glyphsMatched}   (confidence: ${r.confidence})`);
    console.log(`  cap band spans x    ${r.capXRange[0]} to ${r.capXRange[1]} of the width`);
    console.log('');
    console.log(`  x = full cap height   data-cs-cap="${r.ratio_fullCap}"`);
    console.log(`  x = half cap height   data-cs-cap="${r.ratio_halfCap}"`);
    console.log(`  (ink extent of the same line, overshoot included: ${r.ratio_inkExtent})`);

    if (opts.renderWidth) {
      const full = (r.ratio_fullCap * opts.renderWidth).toFixed(2);
      const half = (r.ratio_halfCap * opts.renderWidth).toFixed(2);
      console.log('');
      console.log(`  Inline fallback at ${opts.renderWidth}px rendered width:`);
      console.log(`    full cap   style="--cs-x: ${full}px;"`);
      console.log(`    half cap   style="--cs-x: ${half}px;"`);
    }

    if (r.note) console.log(`\n  ! ${r.note}`);

    console.log('\n  Other height clusters, tallest first:');
    for (const c of r.candidates) {
      console.log(
        `    h=${c.height.toFixed(6)}  n=${String(c.count).padStart(3)}  x ${c.xRange[0]} to ${c.xRange[1]}`
      );
    }
  }
  console.log('');
})();
