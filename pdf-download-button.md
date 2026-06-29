# Download PDF Button — Implementation Guide

This document describes a working "Download PDF" button for a single-page HTML brand book. It captures the currently visible section as a single custom-sized PDF file — no browser print dialog, no page breaks, no clipping. Drops directly into any brand book that follows the sidebar + `.page.active` pattern.

---

## Architecture assumptions

The brand book is a single HTML file with this structure:

```
<nav id="sidebar">
  <div id="nav-groups">...</div>   ← scrollable nav
</nav>

<main class="main">
  <div class="page" id="section-one">...</div>
  <div class="page active" id="section-two">...</div>  ← only one active at a time
  <div class="page" id="section-three">...</div>
</main>
```

- Only one `.page` has the `.active` class at a time (set by JS on nav click)
- The sidebar is `position: fixed` with a CSS variable `--sidebar-w` (e.g. 248px) controlling its width
- The `.main` element compensates with `margin-left: var(--sidebar-w)`
- Some pages have `.page-nav` prev/next pagination bars at the bottom
- The home/cover page uses the class `.cover-page` in addition to `.page`

---

## Step 1 — CDN scripts

Add both scripts to `<head>`. Order matters — jsPDF must load after html-to-image.

```html
<script src="https://unpkg.com/html-to-image/dist/html-to-image.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

**Do not use html2canvas.** html2canvas v1.4.1 throws an unrecoverable error (`Attempting to parse an unsupported color function "color"`) on CSS `color()` values that modern browsers use internally. html-to-image handles modern CSS correctly.

---

## Step 2 — Sidebar CSS

The sidebar needs to be a flex column so the button pins to the bottom with `margin-top: auto`. The nav groups div takes the remaining height and scrolls independently.

```css
.sidebar {
  display: flex;
  flex-direction: column;
  /* existing: position: fixed; top: 0; left: 0; height: 100dvh; etc. */
}

#nav-groups {
  flex: 1;
  overflow-y: auto;
}
```

---

## Step 3 — Button HTML

Place this inside `<nav id="sidebar">`, immediately after the `<div id="nav-groups">` closing tag:

```html
<div style="padding:16px 20px; border-top:1px solid var(--light-gray); margin-top:auto;">
  <button
    id="print-section-btn"
    onclick="downloadSectionPDF()"
    style="
      display:inline-flex;
      align-items:center;
      gap:8px;
      width:100%;
      background:transparent;
      border:1px solid var(--light-gray);
      color:var(--charcoal);
      font-family:'Founders Grotesk',sans-serif;
      font-size:12px;
      font-weight:600;
      letter-spacing:0.06em;
      text-transform:uppercase;
      padding:10px 16px;
      cursor:pointer;
    "
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    Download PDF
  </button>
</div>
```

Swap `var(--light-gray)` and `var(--charcoal)` for whatever color variables your brand book uses. The button lives inside the sidebar, so it is automatically hidden during PDF capture (see Step 4).

---

## Step 4 — JavaScript

Place this in a `<script>` tag immediately before `</body>`:

```javascript
window.downloadSectionPDF = async function () {
  const btn        = document.getElementById('print-section-btn');
  const activePage = document.querySelector('.page.active');
  if (!activePage) return;

  // Show "Generating…" state
  const origBtnHTML = btn.innerHTML;
  btn.innerHTML = '<span style="opacity:.6">Generating…</span>';
  btn.disabled  = true;

  const sidebar   = document.getElementById('sidebar');
  const mHeader   = document.querySelector('.mobile-header');
  const overlay   = document.querySelector('.sidebar-overlay');
  const hamburger = document.getElementById('hamburger');
  const pageNavs  = document.querySelectorAll('.page-nav');
  const main      = document.querySelector('.main');

  // Use display:none on sidebar so it is removed from layout entirely —
  // visibility:hidden keeps it in the layout and leaves a white strip on the right.
  const prevSidebarDisplay = sidebar ? sidebar.style.display : '';
  if (sidebar) sidebar.style.display = 'none';

  // Hide remaining chrome elements
  const chrome = [mHeader, overlay, hamburger].filter(Boolean);
  chrome.forEach(el => el.style.visibility = 'hidden');

  // Hide prev/next pagination bars with display:none so they don't appear in capture
  const prevPageNavDisplays = Array.from(pageNavs).map(el => el.style.display);
  pageNavs.forEach(el => el.style.display = 'none');

  // Reset the main margin so the page fills the full viewport width
  const prevMargin = main ? main.style.marginLeft : '';
  if (main) main.style.marginLeft = '0';

  // Scroll to absolute top — otherwise the element's top edge is clipped
  const origScrollY = window.scrollY;
  window.scrollTo(0, 0);

  // Wait two animation frames for layout, scroll, and paint to fully settle
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    // Read dimensions AFTER reflow so they reflect the sidebar-removed layout
    const captureW = activePage.offsetWidth;
    const captureH = activePage.scrollHeight;

    const canvas = await htmlToImage.toCanvas(activePage, {
      pixelRatio:      2,           // 2× for sharp PDFs
      width:           captureW,
      height:          captureH,
      backgroundColor: '#ffffff',   // prevents transparent areas rendering black in PDF
    });

    const { jsPDF } = window.jspdf;

    // Convert px → pt (72pt/inch at 96dpi screen); divide by pixelRatio
    const pxToPt = 72 / 96;
    const pdfW   = (canvas.width  / 2) * pxToPt;
    const pdfH   = (canvas.height / 2) * pxToPt;

    const pdf = new jsPDF({
      orientation: pdfW > pdfH ? 'l' : 'p',
      unit:        'pt',
      format:      [pdfW, pdfH],
      compress:    true,
    });

    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pdfW, pdfH);
    pdf.save(`brand-${activePage.id || 'page'}.pdf`);

  } catch (err) {
    console.error('PDF generation failed:', err);
    alert('PDF generation failed — see console for details.');
  } finally {
    // Always restore — even if capture threw
    if (sidebar) sidebar.style.display = prevSidebarDisplay;
    chrome.forEach(el => el.style.visibility = '');
    pageNavs.forEach((el, i) => el.style.display = prevPageNavDisplays[i]);
    if (main) main.style.marginLeft = prevMargin;
    window.scrollTo(0, origScrollY);
    btn.innerHTML = origBtnHTML;
    btn.disabled  = false;
  }
};
```

---

## Bugs fixed and why each fix matters

| Symptom | Root cause | Fix |
|---|---|---|
| `Error: Attempting to parse an unsupported color function "color"` | html2canvas v1.4.1 cannot parse the CSS `color()` function that modern browsers use internally | Replace html2canvas with html-to-image |
| White strip on the right side of the PDF | Sidebar hidden with `visibility:hidden` still occupies layout space, so the page content doesn't expand to fill the viewport | Use `display:none` on the sidebar instead |
| Content clipped at the top of the PDF | html-to-image captures from the element's current scroll offset; if the user has scrolled down, the top of the page is missed | `window.scrollTo(0, 0)` before capture; restore after |
| Prev/Next pagination bar appears in PDF | `.page-nav` elements inside `.page.active` were not hidden | Add them to the hide list with `display:none` |
| Black areas where backgrounds should be white | html-to-image canvas is transparent by default; transparent areas become black in a JPEG/PDF | Pass `backgroundColor: '#ffffff'` to `htmlToImage.toCanvas()` |
| Wrong capture width (content narrower than PDF page) | `offsetWidth` was read before the sidebar `display:none` + `marginLeft: 0` had caused a layout reflow | Wait two `requestAnimationFrame` ticks after hiding chrome, then read `offsetWidth` |
| PDF page dimensions don't match content | Used hardcoded `windowWidth: 1280` and `scrollWidth` | Use `activePage.offsetWidth` (post-reflow actual width) and convert px → pt with `72/96` factor |

---

## Customisation notes

- **File name prefix:** change `brand-` in `pdf.save(...)` to match your project
- **JPEG quality:** `0.92` is the quality argument to `toDataURL` — lower for smaller files, higher for sharper text
- **Pixel ratio:** `2` gives retina-quality output; `1` halves the file size at the cost of sharpness
- **Bottom padding on pages:** add `padding-bottom: 80px` to `.page.active:not(.cover-page)` so content doesn't sit flush to the PDF bottom edge
- **CSS variable names:** the button uses `var(--light-gray)` and `var(--charcoal)` — substitute the variable names your brand book actually defines
