# Clearspace diagrams: brief for the main template

Paste-ready brief for applying the responsive clearspace system to another brand
book template. Self-contained: you do not need the Hudson County repo open to
follow it, except to copy one script (noted below).

Companion docs in the Hudson County repo: `clearspace-system.md` is the full
reference, this file is the migration path.

---

## 1. What problem this solves

Clearspace is specified proportionally: "x = half the cap height of the H". CSS
padding is absolute. Hardcode `--cs-x: 50px` and the diagram is correct at
exactly one rendered logo size. When the logo scales down on mobile, the padding
stays 50px while the logo shrinks, so the band grows to roughly double what the
spec says.

This ships easily and hides well: the diagram looks right on desktop, and the
desktop screenshot is the one everyone reviews.

## 2. The fix in one line

Store a ratio on the element, compute pixels at runtime from the logo's actual
rendered width.

```
data-cs-cap = (x, in the artwork's own user units) / (artwork viewBox width)
--cs-x      = data-cs-cap * img.getBoundingClientRect().width
```

The ratio is derived from the artwork's own geometry, so it stays correct at
every rendered size, forever, with no per-breakpoint tuning.

**Decide what x means before measuring.** If the spec says `x = cap height`,
the ratio is `capHeight / artworkWidth`. If it says `x = half the cap height`,
halve it. Getting this wrong makes every diagram off by exactly 2x, which is
easy to miss because it still looks like a diagram.

---

## 3. The three layers

### Layer 1: HTML

```html
<div class="cs-outer">
  <div class="cs-zone" data-cs-cap="0.170783" style="--cs-x: 47.8px;">
    <div class="cs-logo-box">
      <img src="logo_black.svg" alt="Logo"
           style="width:100%; max-width:280px; height:auto; display:block;">
    </div>
    <div class="cs-dim-v top"><span class="cs-lbl">x</span></div>
    <div class="cs-dim-v bottom"><span class="cs-lbl">x</span></div>
    <div class="cs-dim-h left"><span class="cs-lbl">x</span></div>
    <div class="cs-dim-h right"><span class="cs-lbl">x</span></div>
  </div>
  <div class="cs-def">
    <span class="cs-def-x">x</span>
    <span>= &#189; cap height of the H</span>
  </div>
</div>
```

Non-negotiable structural points:

- `.cs-zone` must be `inline-block` so it shrink-wraps the logo. That is what
  makes the tinted band hug the artwork instead of filling the container.
- The inline `--cs-x` is the no-JS and pre-paint fallback only. Set it to the
  correct value at your desktop render width.
- The image is `width:100%` with a `max-width` cap. That cap is per-logo
  calibration, not decoration.

### Layer 2: CSS

Everything derives from the single `--cs-x` variable, so the whole diagram
scales from one number. Swap the colors for your brand.

```css
.cs-outer {
  display: flex; flex-direction: column; align-items: center;
  padding: 2.5rem; width: 100%; box-sizing: border-box;
  border: 1px solid #E3E3E3;
}
.cs-zone {
  position: relative;
  display: inline-block;          /* required: shrink-wraps the logo */
  padding: var(--cs-x, 36px);     /* the clearspace band itself */
  background: rgba(116, 251, 215, 0.2);
}
.cs-logo-box {
  display: flex; align-items: center; justify-content: center;
  position: relative; background: #fff;
}

/* Vertical measure lines (top and bottom strips) */
.cs-dim-v {
  position: absolute; left: 50%; transform: translateX(-50%);
  width: 1px; height: var(--cs-x, 36px);
  background: rgba(0, 9, 19, 0.3);
}
.cs-dim-v.top    { top: 0; }
.cs-dim-v.bottom { bottom: 0; }

/* Horizontal measure lines (left and right strips) */
.cs-dim-h {
  position: absolute; top: 50%; transform: translateY(-50%);
  height: 1px; width: var(--cs-x, 36px);
  background: rgba(0, 9, 19, 0.3);
}
.cs-dim-h.left  { left: 0; }
.cs-dim-h.right { right: 0; }

/* End ticks */
.cs-dim-v::before, .cs-dim-v::after {
  content: ''; position: absolute; left: -4px;
  width: 9px; height: 1px; background: rgba(0, 9, 19, 0.3);
}
.cs-dim-v::before { top: 0; }
.cs-dim-v::after  { bottom: 0; }
.cs-dim-h::before, .cs-dim-h::after {
  content: ''; position: absolute; top: -4px;
  height: 9px; width: 1px; background: rgba(0, 9, 19, 0.3);
}
.cs-dim-h::before { left: 0; }
.cs-dim-h::after  { right: 0; }

/* Labels */
.cs-dim-v .cs-lbl {
  position: absolute; top: 50%; left: 7px; transform: translateY(-50%);
  font-weight: 700; font-size: 11px; line-height: 1; color: #000913;
}
.cs-dim-h .cs-lbl {
  position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%);
  font-weight: 700; font-size: 11px; line-height: 1; color: #000913;
}

/* Definition row */
.cs-def {
  display: flex; align-items: center; gap: 0.5rem;
  padding-top: 14px; font-size: 12px; color: #000913;
}
.cs-def-x {
  font-weight: 700; font-size: 11px;
  padding: 2px 7px; border-radius: 2px; flex-shrink: 0;
  background: rgba(116, 251, 215, 0.5); color: #000913;
}
```

### Layer 3: JavaScript

```js
function syncClearspace() {
  document.querySelectorAll('.cs-zone[data-cs-cap]').forEach(zone => {
    const img = zone.querySelector('.cs-logo-box img');
    if (!img || !img.naturalWidth) return;
    const cap = parseFloat(zone.dataset.csCap);
    for (let i = 0; i < 4; i++) {          // iterate to a fixed point
      const w = img.getBoundingClientRect().width;
      if (!w) return;                      // hidden, recompute when shown
      zone.style.setProperty('--cs-x', (cap * w).toFixed(2) + 'px');
    }
  });
}

let csFrame = 0;
function scheduleClearspaceSync() {
  cancelAnimationFrame(csFrame);
  csFrame = requestAnimationFrame(syncClearspace);
}

window.addEventListener('load', syncClearspace);
window.addEventListener('resize', scheduleClearspaceSync);
document.querySelectorAll('.cs-zone[data-cs-cap] .cs-logo-box img')
  .forEach(img => img.addEventListener('load', scheduleClearspaceSync));
```

Three details that are not obvious and will bite:

1. **The 4-iteration loop is required.** With `width:100%`, the zone's padding
   is part of the width budget. Setting `--cs-x` changes the padding, which
   changes the image width, which changes the correct `--cs-x`. It converges in
   about one pass; 4 settles it with margin. A single pass is measurably wrong.
2. **`if (!w) return` handles hidden pages.** An image inside `display:none`
   measures 0 width.
3. **Call `syncClearspace()` from your page-navigation function.** In any
   tabbed or SPA-style layout, revealing a panel fires no `resize`, so a newly
   visible diagram keeps its stale fallback. This is the easiest trigger to
   forget and the most common cause of "it works until you navigate".

---

## 4. Getting the ratio automatically

Copy `measure-clearspace.js` from the Hudson County repo root. It needs only
`playwright-core`.

```bash
node measure-clearspace.js path/to/logo_black.svg --render-width 280
```

Output gives you `data-cs-cap` for both the full-cap and half-cap definitions,
the calibrated inline `--cs-x` fallback for your render width, how many glyphs
it matched, and the runner-up height clusters so you can sanity check.

Useful flags: `--json` to script it over a whole logo set, `--x-range a,b` to
restrict the search to a horizontal slice (as fractions of width) when a mark
needs manual disambiguation, `--min-cluster n` to change how many equal-height
shapes count as a line of capitals (default 3).

How it works, so you can trust or fix it: it renders the SVG in headless
Chromium, measures every drawable shape with `getBoundingClientRect` (not
`getBBox`, which ignores transforms on ancestor `<g>` elements), skips anything
inside `defs`, `mask`, `clipPath`, `pattern`, `symbol` or `marker`, then
clusters shapes that share both a height and a top edge. Each cluster is one
line of type. It picks the tallest cluster with at least 3 members and reports
its median glyph height as the cap height.

**Always verify visually after.** The script is geometric; it cannot know which
letter is an H. Render the diagram and confirm the gap reads as one (or half) cap
height.

### Validation evidence

Run against the 9 already-measured Hudson County logos, the script reproduced
the existing ratio to within 0.0% on 5 of them and 1 to 3% on 3 more. The
remaining one turned out to be a pre-existing error in the book, not a script
failure (see traps below).

---

## 5. The four traps

1. **Signatures and seals hijack the measurement.** A script flourish is often
   the single tallest path in the file, so a naive "tallest glyph" grabs it
   instead of the cap letters. Real example: the Craig Guy full lockup shipped
   with `data-cs-cap="0.050527"`, which is half the height of the *signature*,
   not half the cap height of the C in CRAIG. It renders about 1.8x more
   clearspace than its own caption claims. The cluster rule (3+ equal-height
   shapes sharing a baseline) avoids this, because a signature is one or two
   paths.
2. **Two lines of type merge into one.** HUDSON and COUNTY share a cap height
   but sit on different baselines. Cluster on height alone and they become one
   group whose extent covers both lines plus the leading, roughly doubling the
   answer. Requiring a shared top edge fixes it.
3. **Cap height is not ink extent.** Round letters (O, C, S, U) are cut slightly
   taller than flat ones so they do not read as small. A line's total ink extent
   therefore runs 1 to 3% above the true cap height of an H. The script reports
   the median glyph height, which is the flat-letter height. Older numbers
   measured as ink extent will sit 1 to 3% high. Visually irrelevant, so do not
   churn existing diagrams, but do not expect exact agreement.
4. **Merged paths.** Some exports merge all letters into one compound path.
   `glyphs matched` is then 1 legitimately and the script reports
   `confidence: low`. Check the number against the artwork's proportions.

---

## 6. Wide logos

Beyond roughly 3:1, two extra problems appear at narrow viewports.

**Grid blowout.** The `inline-block` zone shrink-wraps the image, so the image's
intrinsic width forces its grid track wider than the viewport and the page
scrolls sideways. Put `min-width: 0` on the grid item containing `.cs-outer`.

**The image refuses to shrink.** The zone sizes to the image and the image sizes
to the zone, so neither gives. Break the loop with a viewport-relative cap:

```html
style="width:100%; max-width:min(433px, 62vw); height:auto; display:block;"
```

Desktop gets 433px, narrow viewports get 62vw, and the sync recalculates x for
whatever width results.

---

## 7. Migration checklist for an existing template

1. Add the CSS block and the JS block. Wire `syncClearspace()` into your
   page-navigation function.
2. For each logo, run `measure-clearspace.js` and record the ratio for your
   spec's definition of x.
3. On each `.cs-zone`, add `data-cs-cap="<ratio>"` and set the inline
   `--cs-x` to `ratio * yourDesktopRenderWidth`.
4. Confirm each logo's `<img>` has an explicit `max-width` (or `max-height` with
   `width:auto`). Without a cap the sync has nothing stable to work from.
5. Do not add a blanket `.cs-logo-box img { max-width:100% !important }` mobile
   override. It lets the logo grow past its calibrated size while x is computed
   from the new width, and it was a real bug here.
6. Verify (section 8).

**Decide one definition of x and apply it across the whole book.** The Hudson
County book uses full cap height for the Full logo family and half cap height
for the HCNJ and Craig Guy families, so a designer moving between sections gets
a different rule under the same name. Pick one for the template.

**Give every diagram a ratio.** A hardcoded px value is only safe while the
logo's rendered size is locked (`max-height` with `width:auto`, never scaling).
Four of the thirteen diagrams here are static px and happen to be correct today,
but they carry no self-correcting behaviour, so any future layout change breaks
them silently. That is the exact failure the system exists to prevent.

---

## 8. Verification, do not skip

Check every diagram at desktop, roughly 768px, and 320px:

- [ ] x reads as visually equal to the definition at every width, not just
      desktop.
- [ ] No horizontal page scroll at 320px (`document.body.scrollWidth` equals
      `window.innerWidth`).
- [ ] Navigate away to a hidden panel and back; x is correct, not stuck at the
      fallback.
- [ ] The tinted band hugs the logo rather than filling the container.

Console probe for any diagram:

```js
const zone = document.querySelector('.cs-zone[data-cs-cap]');
const img  = zone.querySelector('.cs-logo-box img');
const w    = img.getBoundingClientRect().width;
console.log({
  renderedWidth: Math.round(w),
  actual: getComputedStyle(zone).getPropertyValue('--cs-x').trim(),
  ideal: (parseFloat(zone.dataset.csCap) * w).toFixed(2) + 'px',
});
```

`actual` and `ideal` should match. If they diverge, the sync is not running on
that state change, which is almost always the page-navigation trigger.

---

## 9. Browser support

CSS custom properties are the one hard requirement (everything except IE11). If
IE11 matters, drop the variable and have the JS set `zone.style.padding`,
`.cs-dim-v` heights and `.cs-dim-h` widths directly. `requestAnimationFrame`,
`getBoundingClientRect` and `dataset` need no polyfills in practice. The CSS
above avoids `color-mix()` on purpose so it works in older browsers; swap in
your own brand colors.
