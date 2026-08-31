# Hudson County Brand Book, working notes

Single-file HTML brand book (`index.html`, ~5700 lines) with a `brand.js` nav layer.
No build step. Served locally via the `brand-book` preview server (port 8743).

Deploys to GitHub Pages from the `develop` branch of `PaperTiger/hudson-brand-book`.

## Writing style

**No em dashes, ever.** Not in page copy, headings, alt text, labels, code
comments, commit messages, or these notes. Use commas, colons, parentheses, or
separate sentences instead. This applies to everything in the project.

**Sentence case** for all UI text: nav labels, section labels, page titles, and
in-copy references to pages (e.g. "Craig Guy lockups", "Lockup with seal &
portrait", "HCNJ lockup"). The one exception is proper nouns, which stay
capitalized: brand color names ("Deep Teal", "Liberty Green", "Hudson Blue",
"Flag Yellow", "Charcoal", "Amaranth", "Purple"), "Craig Guy", "County
Executive", and "HCNJ". So color-combination captions read "Deep Teal on
Liberty Green".

## Deploying

Push from **GitHub Desktop**, not the CLI. Rapid CLI pushes get deployments
cancelled/superseded by Pages throttling. Claude should commit but leave the
push to the user unless asked otherwise.

After a successful deploy, the Pages CDN can lag a few minutes, hard-refresh
(Cmd+Shift+R) before concluding a change didn't ship.

## Replacing logo artwork

New master artwork arrives in `Hudson County/<name>/` as a single black-fill
SVG plus a PNG. **That folder is tracked**, `.gitignore` covers only
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
Playwright's `scale: 'css'` renders at 1x no matter the viewport, the stacked
script's `const scale = 2` was dead code, which is why
`hudson-county_full-logo_stacked_*.png` shipped at 674px wide instead of ~3000px like
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

Filenames mirror the sidebar nav: `<family>_<mark>_<color>.<ext>`, all
lowercase, `_` between segments and `-` within a segment. Color always comes
last.

The mark follows the nav group and page that shows it:

| Nav group / page              | File stem                              |
|-------------------------------|----------------------------------------|
| Full logo → Horizontal        | `hudson-county_full-logo_horizontal`   |
| Full logo → Stacked           | `hudson-county_full-logo_stacked`      |
| Full logo → Text lockup       | `hudson-county_full-logo_text-lockup`  |
| Full logo → Text only         | `hcnj_wordmark-small`                  |
| County seal                   | `hcnj_seal`                            |
| H logo mark                   | `h-mark`                               |
| HCNJ logo → Horizontal        | `hcnj_horizontal-logo`                 |
| HCNJ logo → Text lockup       | `hcnj_text-lockup-logo`                |
| HCNJ logo → Text only         | `hcnj_text-only-logo`                  |
| Headshot lockup               | `craig-guy_headshot-lockup`            |
| Co-sponsorship lockup         | `craig-guy_text-lockup`                |
| *(hidden)* HCNJ dome logo     | `dome`                                 |

The `HCNJ logo` nav group collapses into the `hcnj` family prefix rather than
repeating, so its marks carry a `-logo` suffix instead of a third segment.

**Every new logo file must follow this convention.** When a logo is added,
give it a stem derived from the nav group and page that will show it, before
writing any HTML that references it. No exceptions, the two files below are
grandfathered, not precedent.

`hcnj_seal_*` and `hcnj_wordmark-small_*` render on primary-brand pages despite
the `hcnj` prefix, the prefix tracks the artwork, not the page. Note the
"Text only" page under **Full logo** shows HCNJ artwork.

Two files sit outside the convention on purpose: `CE-lockup.svg` (gitignored)
and `Group 1597880486.svg` (unreferenced, unknown provenance).

## The downloads ZIPs

The site references SVGs only. The PNGs (and EPS) exist solely for the download
ZIPs, which are what the public actually downloads. As of the split, each logo
section downloads its own ZIP instead of one big `HCNJ-logos.zip` (removed):

| Section (nav)        | Button on pages                                   | ZIP                              | Stems |
|----------------------|---------------------------------------------------|----------------------------------|-------|
| Full logo            | Horizontal, Stacked, Text lockup, Text only       | `downloads/full-logos.zip`       | `hudson-county_full-logo_{horizontal,stacked,text-lockup}` |
| County seal          | County seal                                       | `downloads/county-seal.zip`      | `hcnj_seal` |
| HCNJ logo            | Horizontal, Text lockup, Text only                | `downloads/hcnj-logos.zip`       | `hcnj_{horizontal-logo,text-lockup-logo,text-only-logo}` |
| H logo mark          | H logo mark                                       | `downloads/h-logo.zip`           | `h-mark` |
| Craig Guy lockups    | Full / Seal / Seal & portrait / HCNJ lockup       | `downloads/craig-guy-lockups.zip`| `craig-guy_{full-lockup,seal-lockup,seal-portrait-lockup,hcnj-lockup}` |

Avatar & favicon download their own ZIPs generated client-side (`hcnj-avatars.zip`,
`hcnj-favicons.zip`) - not static files. Co-sponsorship has no download button.
`hcnj_wordmark-small` (Full logo "Text only") is deliberately not in any ZIP: it
has only 2 SVG variants and no PNG/EPS. Fonts and icons have their own separate
ZIPs (`HCNJ-fonts.zip`, `hudson-county-icon-set.zip`).

**Always rebuild the affected section ZIP when a logo is added, replaced, or
renamed.** The ZIPs are checked-in binaries, not built at request time, so they
silently keep serving stale artwork until rebuilt. Internal layout per ZIP:
one folder per mark (human-readable name, e.g. `Text lockup/`) with `.svg` +
`.png` under `RGB/` and `.eps` under `CMYK/`. Single-mark ZIPs (county seal, H)
skip the mark folder and put `RGB/` and `CMYK/` at the root.

**macOS case-insensitivity:** the new `hcnj-logos.zip` collides on disk with the
old `HCNJ-logos.zip`. The old one is deleted; don't recreate a differently-cased
name for an existing ZIP.

Rebuild after any logo change:

1. Regenerate the SVG + PNG variants (`generate-*-variants.js`).
2. Regenerate the EPS: `node generate-eps-variants.js <stem>...` (skip the three
   photo lockups - see below - they can't produce EPS).
3. Repack the section ZIP from `images/logos/` in a short Node/Python pass, then
   `unzip -t` to confirm integrity. (There is no one-shot repack script yet.)

### About the CMYK EPS files, they ARE regenerable

Earlier notes here claimed the `.eps` files were true press separations that
only Illustrator could produce. That was wrong. They are **script-generated**:
each carries `%%Creator: HCNJ SVG-to-CMYK-EPS converter` and is a flat
PostScript dump of the SVG's paths under one `setcmykcolor`. `generate-eps-
variants.js` reproduces them, so it is safe to regenerate any of them. (Its
output was verified byte-for-byte against the pre-existing EPS before the
CMYK values were switched to profile-converted ones; every EPS in the ZIPs
now carries the new values.)

Two things the converter does that aren't obvious from the SVG:

- **The CMYK comes from a fixed profile-converted table, not a formula.** The
  `PRINT_CMYK` table (duplicated in `brand.js` and `generate-eps-variants.js`)
  holds sRGB converted through U.S. Web Coated (SWOP) v2, relative colorimetric
  intent with black point compensation (Adobe's default conversion), computed
  via Python Pillow/littlecms against
  `/Applications/Affinity.app/Contents/Resources/USWebCoatedSWOP.icc`. The
  original naive inversion formula gave green hues zero yellow, so Deep Teal
  (`C100 M0 Y4 K80`) and Liberty Green (`C54 M0 Y14 K2`) printed blue; the
  table values (`C89 M56 Y67 K62`, `C43 M0 Y29 K0`) stay green. If the palette
  ever changes, recompute with the same profile and settings and update both
  copies of the table.
- **The `black` variant is rich black `#000913` (Charcoal), not `#000000`.** The
  SVG's `fill="black"` is only for on-screen RGB; every EPS uses the Charcoal
  SWOP value `C:78 M:70 Y:62 K:83` (total ink 293%, under SWOP's 300% limit).
  Before the profile fix it was the naive `C:100 M:53 Y:0 K:93`.

The loose `images/logos/*.eps` the script writes are transient build artifacts
(gitignored), the ZIP is their only home.

**Photo lockups can't be EPS.** Three Craig Guy lockups (`craig-guy_full-lockup`,
`craig-guy_seal-portrait-lockup`, `craig-guy_hcnj-lockup`) embed a raster
headshot as a `<pattern>` image, so the flat path-dump converter can't render
them. Their ZIP entries are RGB (`.svg` + `.png`) only, no CMYK. Only the
pure-vector `craig-guy_seal-lockup` gets EPS.

## Verifying a logo change, do not skip

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
   `x = cap height of the H`. Removed in `d4b9914`, each image's own inline
   `max-width` + `width:100%` already caps *and* shrinks correctly.

So after any logo change, check in the browser preview at **320px, ~700px, and
desktop**:

- every swatch / background-combination grid showing that logo, scrolled to the
  bottom of the tiles, for clipped artwork or captions
- that logo's **Clearspace** diagram, confirm `x` still looks proportional to
  the logo's own lettering, not merely that nothing overflows

The `.cs-logo-box img` inline `max-width` (160px / 280px / etc.) is per-logo
calibration. If new artwork changes the logo's aspect ratio, `--cs-x` on that
page likely needs recalibrating too.

## PDF download button

The sidebar "Download PDF" button captures the active `.page.active` section
via `html-to-image` + `jsPDF`. Full writeup, including the five bugs it works
around, is in [`pdf-download-button.md`](pdf-download-button.md). Notably:
**do not swap back to html2canvas**, v1.4.1 throws on the CSS `color()`
function modern browsers emit.

## Hidden content

The HCNJ dome logo page (`#dome-logo`) is built but hidden pending launch:
`style="display:none !important"` on the page div, and its nav entry is
commented out in `brand.js`. Hide sections this way, an HTML comment wrapper
breaks, because the section contains nested `<!-- -->` comments that close it
early.
