#!/usr/bin/env node
// Generates hudson-brand-book.pdf — exactly one PDF page per site section.
// Usage: node generate-pdf.js [url]
// Requires: npm install  (playwright-core + pdf-lib)

const { chromium }  = require('playwright-core');
const { PDFDocument } = require('pdf-lib');
const fs   = require('fs');
const path = require('path');
const http = require('http');
const os   = require('os');

const url = process.argv[2] || 'http://localhost:8743/?print';
const out = path.resolve(__dirname, 'hudson-brand-book.pdf');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-pdf-'));

const HOME     = process.env.HOME || process.env.USERPROFILE;
const CHROMIUM = `${HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

// Points per pixel at 96dpi (PDF uses 72pt/inch)
const PX_TO_PT = 72 / 96;

function checkUrl(u) {
  return new Promise((resolve, reject) =>
    http.get(u, r => resolve(r.statusCode)).on('error', reject));
}

(async () => {
  try { await checkUrl(url); } catch {
    console.error(`Cannot reach ${url} — start the server first: npx serve -l 8743 .`);
    process.exit(1);
  }

  // ── 1. Open the page once, collect section ids + heights ──────────────────
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  const WIDTH   = 1280;

  const probe = await browser.newContext({ viewport: { width: WIDTH, height: 900 } });
  const pg0   = await probe.newPage();
  await pg0.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await pg0.waitForTimeout(3000);
  await pg0.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await pg0.waitForTimeout(500);

  const sections = await pg0.evaluate(() =>
    [...document.querySelectorAll('.page')].map(p => ({
      id:     p.id,
      height: Math.ceil(p.getBoundingClientRect().height),
    }))
  );
  await probe.close();
  console.log(`Found ${sections.length} sections`);

  // ── 2. Render each section as its own single-page PDF ────────────────────
  const sectionPdfs = [];

  for (let i = 0; i < sections.length; i++) {
    const { id, height } = sections[i];
    process.stdout.write(`  [${i + 1}/${sections.length}] #${id} (${height}px)… `);

    const ctx  = await browser.newContext({ viewport: { width: WIDTH, height } });
    const pg   = await ctx.newPage();
    await pg.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await pg.waitForTimeout(2000);

    // Show only this section
    await pg.evaluate((sectionId) => {
      // Apply print-mode styles
      document.body.classList.add('print-mode');
      // Hide all pages, show only the target
      document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
      });
      const target = document.getElementById(sectionId);
      if (target) {
        target.style.display = target.classList.contains('cover-page') ? 'flex' : 'block';
      }
      // Hide chrome
      ['sidebar', 'hamburger'].forEach(elId => {
        const el = document.getElementById(elId);
        if (el) el.style.display = 'none';
      });
      ['.mobile-header', '.sidebar-overlay', '.page-nav'].forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.style.display = 'none');
      });
      const main = document.querySelector('.main');
      if (main) main.style.marginLeft = '0';
      // Fix icon grid
      document.querySelectorAll('[style*="grid-template-columns:repeat(6, 1fr)"]').forEach(g => {
        g.style.setProperty('grid-template-columns', 'repeat(6, 1fr)', 'important');
        g.style.setProperty('width', '100%', 'important');
      });
      // Hide color combo swatches
      document.querySelectorAll('[style*="grid-template-columns:repeat(5,1fr)"]').forEach(g => {
        if (g.parentElement) g.parentElement.style.display = 'none';
      });
    }, id);

    await pg.waitForTimeout(500);

    const pdfBytes = await pg.pdf({
      width:           `${WIDTH}px`,
      height:          `${height}px`,
      printBackground: true,
      margin:          { top: 0, right: 0, bottom: 0, left: 0 },
    });

    const tmpFile = path.join(tmp, `${String(i).padStart(3, '0')}-${id}.pdf`);
    fs.writeFileSync(tmpFile, pdfBytes);
    sectionPdfs.push(tmpFile);
    await ctx.close();
    process.stdout.write('✓\n');
  }

  await browser.close();

  // ── 3. Merge all single-page PDFs into one ───────────────────────────────
  console.log('\nMerging PDFs…');
  const merged = await PDFDocument.create();

  for (const file of sectionPdfs) {
    const bytes = fs.readFileSync(file);
    const doc   = await PDFDocument.load(bytes);
    const [copied] = await merged.copyPages(doc, [0]);
    merged.addPage(copied);
  }

  const mergedBytes = await merged.save();
  fs.writeFileSync(out, mergedBytes);

  // Cleanup temp files
  sectionPdfs.forEach(f => fs.unlinkSync(f));
  fs.rmdirSync(tmp);

  const mb = (fs.statSync(out).size / 1e6).toFixed(1);
  console.log(`\n✓ PDF saved → ${out}  (${mb} MB, ${sections.length} pages)`);
})();
