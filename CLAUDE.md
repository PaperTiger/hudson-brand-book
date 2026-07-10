# Hudson County Brand Book — working notes

Single-file HTML brand book (`index.html`, ~5700 lines) with a `brand.js` nav layer.
No build step. Served locally via the `brand-book` preview server (port 8743).

Deploys to GitHub Pages from the `develop` branch of `PaperTiger/hudson-brand-book`.

## Deploying

Push from **GitHub Desktop**, not the CLI. Rapid CLI pushes get deployments
cancelled/superseded by Pages throttling. Claude should commit but leave the
push to the user unless asked otherwise.

After a successful deploy, the Pages CDN can lag a few minutes — hard-refresh
(Cmd+Shift+R) before concluding a change didn't ship.

## Replacing logo artwork

New master artwork arrives in `Hudson County/<name>/` as a single black-fill
SVG plus a PNG. **That folder is tracked** — `.gitignore` covers only
`sync.config.json`, `node_modules/`, `hudson-brand-book.pdf`, and
`CE-lockup.svg`. It sits in the repo, and it also lives inside iCloud Drive, so
Finder/iCloud activity can stage spurious deletions there. Check `git status`
before committing and don't sweep those in.

The site references logos by fixed filenames in `images/logos/`, one file per
color variant. So a logo swap means regenerating every variant from the new
master, not editing the HTML.

`generate-stacked-logo-variants.js` does this for the stacked logo, and
`generate-text-logo-variants.js` for the text lockup: each reads the master,
string-replaces `fill="black"` with each brand color, writes the five
`<stem>_<variant>.svg` files, and renders matching PNGs via playwright-core.
Copy either script's shape for other logos.

**PNG scale:** use `deviceScaleFactor` + `screenshot({ scale: 'device' })`.
Playwright's `scale: 'css'` renders at 1x no matter the viewport — the stacked
script's `const scale = 2` was dead code, which is why
`hudson-county_stacked_*.png` shipped at 674px wide instead of ~3000px like the
other assets. The text-lockup script targets `TARGET_WIDTH = 3000`.

Brand colors used for variants:

| Variant     | Hex       |
|-------------|-----------|
| `black`     | `black`   |
| `deep-teal` | `#003230` |
| `teal`      | `#74FBD7` |
| `green`     | `#8AF161` |
| `white`     | `white`   |

Other palette colors that appear as swatch *backgrounds*: Charcoal `#000913`,
Hudson Blue `#0004F5`, Flag Yellow `#EBE825`, Purple `#6B1262`, Amaranth
`#EB254D`, Gray `#E3E3E3`.

**Caveat:** the generator scripts read from the `Hudson County/` staging folder.
Keep the master artwork if a variant ever needs regenerating.

## Logo file naming

Every file in `images/logos/` follows `<family>_<mark>_<color>.<ext>` —
all lowercase, `_` between segments, `-` within a segment.

| Family         | Marks                                            |
|----------------|--------------------------------------------------|
| `hudson-county`| `horizontal`, `stacked`, `text-lockup`           |
| `hcnj`         | `horizontal`, `text-lockup`, `text-only`, `seal`, `wordmark-small` |
| `craig-guy`    | `headshot-lockup`, `text-lockup`, `headshot`     |
| *(no family)*  | `h-mark`, `dome`                                 |

`hcnj_seal_*` and `hcnj_wordmark-small_*` render on primary-brand pages despite
the `hcnj` prefix — the prefix tracks the artwork, not the page.

Two files sit outside the convention on purpose: `CE-lockup.svg` (gitignored)
and `Group 1597880486.svg` (unreferenced, unknown provenance).

The site references SVGs only; the PNGs exist for `downloads/HCNJ-logos.zip`.
That zip also carries **CMYK `.eps`** files which cannot be regenerated from the
SVG masters here — after an artwork swap its `.eps` files are stale until new
ones are exported from Illustrator.

## Verifying a logo change — do not skip

New artwork often has different proportions than what it replaces, which breaks
layouts that were tuned to the old aspect ratio. Two bugs both hid above 768px
viewport width:

1. **Swatch tiles clip the artwork.** The "Approved color combinations" grid
   uses `overflow:hidden` tiles. Taller artwork overflowed the old
   `max-height:72%` cap and got silently cut off (fixed in `a2d7a73` by moving
   those images to `max-height:100%` + `object-fit:contain`, with `min-height:0`
   on the flex wrapper).

2. **Clearspace `x` unit goes wrong.** Each clearspace diagram hardcodes
   `--cs-x` in px, calibrated to the logo's rendered size. A mobile override
   (`.cs-logo-box img { max-width:100% !important }`) let the logo grow past
   that calibrated size while `x` stayed fixed, so the diagram no longer showed
   `x = cap height of the H`. Removed in `d4b9914` — each image's own inline
   `max-width` + `width:100%` already caps *and* shrinks correctly.

So after any logo change, check in the browser preview at **320px, ~700px, and
desktop**:

- every swatch / background-combination grid showing that logo, scrolled to the
  bottom of the tiles, for clipped artwork or captions
- that logo's **Clearspace** diagram — confirm `x` still looks proportional to
  the logo's own lettering, not merely that nothing overflows

The `.cs-logo-box img` inline `max-width` (160px / 280px / etc.) is per-logo
calibration. If new artwork changes the logo's aspect ratio, `--cs-x` on that
page likely needs recalibrating too.

## PDF download button

The sidebar "Download PDF" button captures the active `.page.active` section
via `html-to-image` + `jsPDF`. Full writeup, including the five bugs it works
around, is in [`pdf-download-button.md`](pdf-download-button.md). Notably:
**do not swap back to html2canvas** — v1.4.1 throws on the CSS `color()`
function modern browsers emit.

## Hidden content

The HCNJ dome logo page (`#dome-logo`) is built but hidden pending launch:
`style="display:none !important"` on the page div, and its nav entry is
commented out in `brand.js`. Hide sections this way — an HTML comment wrapper
breaks, because the section contains nested `<!-- -->` comments that close it
early.
