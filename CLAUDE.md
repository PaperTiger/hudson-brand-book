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
SVG plus a PNG. **That folder is untracked** (see `.gitignore` notes below) —
it is a local staging area, not part of the repo.

The site references logos by fixed filenames in `images/logos/`, one file per
color variant. So a logo swap means regenerating every variant from the new
master, not editing the HTML.

`generate-stacked-logo-variants.js` does this for the stacked logo: it reads
the master, string-replaces `fill="black"` with each brand color, writes the
five `Hudson-County_logo-stacked_<variant>.svg` files, and renders matching
PNGs via playwright-core. Copy that script's shape for other logos.

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

**Caveat:** the generator scripts read from the untracked `Hudson County/`
staging folder. They run fine on this machine but would fail on a fresh clone.
Keep the master artwork if a variant ever needs regenerating.

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
