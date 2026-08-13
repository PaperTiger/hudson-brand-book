# Responsive logo clearspace diagrams

A portable, framework-free system for brand-book "clearspace" diagrams: the
tinted band around a logo with `x` measure lines on all four sides.

Self-contained. Copy the CSS and JS below into any project. Vanilla JS plus CSS
custom properties, no build step, no dependencies.

---

## The problem this solves

Clearspace is defined **proportionally**: "x = half the cap height of the H".
CSS padding is **absolute**. If you hardcode `--cs-x: 50px`, it is correct at
exactly one rendered logo size. As soon as the logo scales down (responsive
layout, mobile), the padding stays 50px while the logo shrinks, so the
clearspace band grows to roughly double what the spec says.

This is a real bug that ships easily: the diagram looks perfect on desktop and
is visibly wrong on mobile, and nobody notices because the desktop screenshot
is the one everyone reviews.

## The core idea

Store a **ratio** on the element instead of a pixel value, and compute the
pixels at runtime from the logo's actual rendered width.

```
data-cs-cap = (x, expressed in the artwork's own user units) / (artwork viewBox width)
--cs-x      = data-cs-cap * img.getBoundingClientRect().width
```

Because the ratio is derived purely from the artwork's own geometry, it stays
correct at every rendered size automatically.

**Define `x` before you measure.** The ratio depends on your definition:

| If your spec says            | data-cs-cap is            |
|------------------------------|---------------------------|
| `x = cap height of the H`    | `capHeight / viewBoxWidth`       |
| `x = 1/2 cap height of the H`| `(capHeight / 2) / viewBoxWidth` |

Getting this wrong makes every diagram off by exactly 2x, which is easy to miss
because it still "looks like a diagram".

---

## 1. HTML

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

Structural requirements:

- **`.cs-zone` must be `inline-block`** so it shrink-wraps the logo. That is
  what makes the tinted band hug the artwork instead of filling the container.
- **The inline `--cs-x` is the no-JS / pre-paint fallback.** Set it to the
  correct value at your desktop render width so the diagram is right even
  before the script runs.
- The image should be `width:100%` with a `max-width` cap. See "Wide logos"
  below if the artwork is much wider than it is tall.

## 2. CSS

Plain CSS, no preprocessor. Everything derives from the single `--cs-x`
variable, so the whole diagram scales from one number.

```css
.cs-outer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #E3E3E3;
}

.cs-zone {
  position: relative;
  display: inline-block;          /* required: shrink-wraps the logo */
  padding: var(--cs-x, 36px);     /* the clearspace band itself */
  background: rgba(116, 251, 215, 0.2);
}

.cs-logo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #fff;
}

/* Vertical measure lines (top and bottom strips) */
.cs-dim-v {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: var(--cs-x, 36px);
  background: rgba(0, 9, 19, 0.3);
}
.cs-dim-v.top    { top: 0; }
.cs-dim-v.bottom { bottom: 0; }

/* Horizontal measure lines (left and right strips) */
.cs-dim-h {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 1px;
  width: var(--cs-x, 36px);
  background: rgba(0, 9, 19, 0.3);
}
.cs-dim-h.left  { left: 0; }
.cs-dim-h.right { right: 0; }

/* End ticks on the measure lines */
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

/* "x" labels */
.cs-dim-v .cs-lbl {
  position: absolute; top: 50%; left: 7px; transform: translateY(-50%);
  font-weight: 700; font-size: 11px; line-height: 1; color: #000913;
}
.cs-dim-h .cs-lbl {
  position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%);
  font-weight: 700; font-size: 11px; line-height: 1; color: #000913;
}

/* Definition row under the diagram */
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

## 3. JavaScript

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

### Three non-obvious details

1. **The 4-iteration loop is required.** When the image is `width:100%`, the
   zone's padding is part of the width budget. Setting `--cs-x` changes the
   padding, which changes the image width, which changes the correct `--cs-x`.
   It converges quickly, so looping 4 times settles it. A single pass leaves it
   measurably wrong.

2. **`if (!w) return` handles hidden pages.** An image inside a `display:none`
   panel measures 0 width. Skip it, and re-run when it becomes visible.

3. **Call `syncClearspace()` from your page-navigation function too.** In any
   tabbed or SPA-style layout, revealing a panel does not fire `resize`, so a
   newly visible diagram keeps its stale fallback value. This is the easiest
   trigger to forget.

---

## 4. Computing `data-cs-cap` for a logo

Use the script. `measure-clearspace.js` in this repo takes any SVG and prints
the ratio, and it handles the traps below without hand-tuning:

```bash
node measure-clearspace.js images/logos/my-logo_black.svg --render-width 280
```

It renders the SVG in headless Chromium, measures every drawable shape,
clusters them into lines of type, and reports the cap height of the tallest
real line as a ratio. `--render-width` also prints the calibrated inline
`--cs-x` fallback. Add `--json` to script it, `--x-range a,b` to restrict the
search to a horizontal slice of the artwork.

It only needs `playwright-core`, so it ports to any project that already
renders artwork (most brand books do). Read the picked cluster's
`glyphs matched` and `cap band spans x` before trusting the number.

### Cap height is not ink extent

The script reports the **median glyph height**, which is the height of a
flat-topped letter such as H, E or N. Round letters (O, C, S, U) are cut
slightly taller so they do not read as small, so the line's total ink extent
runs 1 to 3% above the true cap height.

That matters when reconciling against an older number. Values measured with the
console snippet below are ink extents, so they sit 1 to 3% high. The script
prints `ratio_inkExtent` alongside, purely so you can confirm you are looking at
the same piece of geometry before switching to the cap-height number. A 1 to 3%
difference in clearspace is visually irrelevant, so do not churn existing
diagrams over it, but do not expect the two methods to agree exactly either.

### Fallback: the browser console

If Node is not available, this does the same job with more hand-holding. Note
that it uses `getBBox`, which reports a shape's own user space and silently
ignores a transform on an ancestor `<g>`. The script uses
`getBoundingClientRect` instead, which is transform-safe.

```js
const url = 'logo_black.svg';
const txt = await (await fetch(url)).text();
const host = document.createElement('div');
host.style.cssText = 'position:absolute;left:-9999px;top:0';
host.innerHTML = txt;
document.body.appendChild(host);

const svg  = host.querySelector('svg');
const vbW  = parseFloat(svg.getAttribute('viewBox').split(' ')[2]);

// Ignore masking geometry and defs: Figma exports put junk there.
const skip = new Set([...svg.querySelectorAll('mask path, defs path')]);

// Narrow to the region containing the reference letters.
// Raise minX to skip a seal/photo on the left; lower maxX to skip a signature.
const minX = 0, maxX = vbW;

const boxes = [...svg.querySelectorAll('path')]
  .filter(p => !skip.has(p))
  .map(p => { try { return p.getBBox(); } catch (e) { return null; } })
  .filter(b => b && b.x >= minX && b.x <= maxX);

const maxH = Math.max(...boxes.map(b => b.height));
const tall = boxes.filter(b => b.height > maxH * 0.85);   // same-height cluster
const capH = Math.max(...tall.map(b => b.y + b.height))
           - Math.min(...tall.map(b => b.y));

console.log({
  viewBoxWidth: vbW,
  capHeight: Math.round(capH),
  glyphsMatched: tall.length,
  ratio_fullCap: +(capH / vbW).toFixed(6),
  ratio_halfCap: +((capH / 2) / vbW).toFixed(6),
});
host.remove();
```

Use `ratio_fullCap` or `ratio_halfCap` depending on how your spec defines `x`.

### Three traps that will give you a wrong number

- **Signatures and seals hijack the measurement.** A script flourish is often
  the single tallest path in the file, so "tallest glyph" grabs it instead of
  the cap letters. This is not theoretical: the Craig Guy full lockup in this
  book shipped with `data-cs-cap="0.050527"`, which is half the height of the
  *signature*, not half the cap height of the C in CRAIG. It renders about 1.8x
  more clearspace than its own caption specifies. The script avoids this by
  requiring a cluster of at least 3 equal-height shapes on a shared baseline; a
  signature is one or two paths and gets skipped. With the console snippet,
  constrain by x-position (`minX` / `maxX`) instead.
- **Two lines of type merge into one.** HUDSON and COUNTY share a cap height but
  sit on different baselines. Group on height alone and they become one cluster
  whose extent spans both lines plus the leading, roughly doubling the answer.
  The script requires a shared top edge as well as a shared height.
- **Merged paths.** Some exports merge all letters into one compound path. Then
  `glyphs matched` is 1 legitimately and the bbox height is the cap height. The
  script reports `confidence: low` in this case. Sanity check the number against
  the artwork's proportions before trusting it.

**Always verify visually afterward.** Render the diagram and confirm the gap
reads as clearly one (or half) cap height. The measurement is a starting point,
not the final word.

---

## 5. Wide logos

If the artwork is much wider than tall (say beyond 3:1), two extra problems
appear at narrow viewports.

**CSS grid blowout.** The `inline-block` zone shrink-wraps the image, so the
image's intrinsic width forces its grid track wider than the viewport, and the
whole page scrolls sideways. Fix by letting the track shrink:

```css
/* on the grid item that contains .cs-outer */
min-width: 0;
```

**The image refuses to shrink.** The zone sizes to the image and the image
sizes to the zone, so neither gives. Break the loop with a viewport-relative
cap on the image:

```html
style="width:100%; max-width:min(433px, 62vw); height:auto; display:block;"
```

Desktop gets 433px, narrow viewports get 62vw, and the sync recalculates `x`
for whatever width results. Pick the px value from your desktop layout and the
vw value so the diagram plus its padding fits comfortably.

---

## 6. Browser support and porting notes

- **CSS custom properties** are the one hard requirement. Supported everywhere
  except IE11. If you must support IE11, drop the variable and have the JS set
  `zone.style.padding`, `.cs-dim-v` heights and `.cs-dim-h` widths directly.
- **`color-mix()` is avoided here.** The original implementation used it for
  the tint colors; this document uses plain `rgba()` instead, which works in
  far older browsers. Swap in your own brand colors.
- **No Tailwind.** The original used `@apply` directives. Everything above is
  already expanded to plain CSS.
- `requestAnimationFrame`, `getBoundingClientRect`, `dataset`, and `getBBox`
  are all long-standing APIs with no polyfill concerns in practice.

## 7. Verification checklist

After wiring it up, check each diagram at **desktop, ~768px, and 320px**:

- [ ] `x` reads as visually equal to the definition (half or full cap height)
      at every width, not just desktop.
- [ ] No horizontal page scroll at 320px (`document.body.scrollWidth` equals
      `window.innerWidth`).
- [ ] Navigating to a hidden panel and back leaves `x` correct, not stuck at
      the fallback value.
- [ ] The tinted band hugs the logo rather than filling the container.

A quick console probe for any diagram:

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
that state change (usually the page-navigation trigger from section 3).
