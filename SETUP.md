# Brand Book — Setup Guide

This template is a fully-wired brand book. The CSS, navigation, routing, and all interactive behaviour are ready to go. Your job is to configure the brand tokens and fill in the page content.

---

## What to touch vs. what to leave alone

| File | What to change |
|---|---|
| `brand.js` | Everything in the `BRAND` object (§1–6 below) |
| `index.html` | Page content stubs + font-family references in CSS |
| `fonts/` | Replace `.woff2` files with your typeface |
| `images/` | Replace logos, photography, application mockups |

**Do not edit** the JS functions below the `BRAND` object in `brand.js`, or the CSS/routing script blocks in `index.html` — those are the engine.

---

## Step 1 — Brand tokens (`brand.js` → `BRAND.tokens`)

These become CSS custom properties (`var(--primary)`, `var(--accent)`, etc.) used throughout the book.

Update at minimum:
- `primary` — your dark brand color
- `accent` — your light/highlight color
- `charcoal` — near-black for body text
- `cream` — near-white for backgrounds

If you rename any token keys, do a find-replace in `index.html` for the old CSS var name.

---

## Step 2 — Org name + logos (`brand.js` → `BRAND.meta`)

- `nameLine1` / `nameLine2` — displayed on the cover, split across two lines
- `sidebarLogoImage` — SVG path shown in the sidebar header
- `coverSealImage` — SVG path shown on the cover page
- `preparedBy` — studio name shown in the cover metadata strip

Logo SVGs go in `images/logos/`.

---

## Step 3 — Fonts (`brand.js` → `BRAND.typography.fonts`)

1. Drop `.woff2` files into the `fonts/` folder.
2. Update each entry's `family`, `weight`, and `file` fields.
3. In `index.html`, find the Tailwind config block near the top and update the `fontFamily` extension to match your new family names:

```js
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        'display':  ['"Your Condensed Font"', 'sans-serif'],
        'body':     ['"Your Body Font"', 'sans-serif'],
      }
    }
  }
}
```

4. Do a find-replace in `index.html` for any hardcoded font-family strings that reference the old typeface names.

---

## Step 4 — Color palette cards (`brand.js` → `BRAND.colors`)

These drive the visual color swatch cards on the Primary palette and Secondary palette pages. For each color provide:
- `name` — displayed on the card
- `hex` — swatch background
- `textColor` — hex for text/dot on top of the swatch
- `rgb` / `cmyk` — displayed in the card values
- `outline` (optional) — use `"1px solid #C8C8C8"` for light swatches that need a visible border

---

## Step 5 — Type specimens (`brand.js` → `BRAND.specimens`)

Replace the placeholder strings with org-relevant copy. These populate the Typography pages automatically via `data-brand="specimens.x"` attributes in `index.html`. Use a real tagline, mission statement, or representative sentence.

---

## Step 6 — Navigation (`brand.js` → `BRAND.nav`)

The nav is rendered automatically from the `BRAND.nav` array. Each `group` becomes a section header; each `item` becomes a nav link.

### Adding a flat link

```js
{ label: "My Page", id: "my-page" }
```

Then add `<div class="page" tabindex="-1" id="my-page">` with content in `index.html`.

### Adding an expandable dropdown

```js
{
  label: "My Section", id: "my-section-default",
  groupId: "nav-my-section-group", subId: "nav-my-section-sub",
  children: [
    { label: "Overview", id: "my-section-default" },
    { label: "Dos",      id: "my-section-dos" },
  ],
}
```

Then register it in the routing script block at the bottom of `index.html`. Search for `setFullLogoExpanded` — it shows the pattern. You need to:

1. Add a helper function (copy an existing one, rename `FullLogo` → `MySection`):
```js
function setMySectionExpanded(on) {
  const g = document.getElementById('nav-my-section-group');
  const s = document.getElementById('nav-my-section-sub');
  if (!g || !s) return;
  g.classList.toggle('expanded', on);
  s.style.maxHeight = on ? s.scrollHeight + 'px' : '0';
  const a = g.querySelector('.nav-parent');
  if (a) a.setAttribute('aria-expanded', String(on));
}
```

2. Add `my-section-default`, `my-section-dos` to the `mySectionChildren` Set.

3. Call `setMySectionExpanded(true)` inside `showPage` when those IDs are shown.

4. Wire the click handlers — copy the `nav-full-logo-group` block and replace the IDs.

---

## Step 7 — Page content (`index.html`)

Each page is a `<div class="page" tabindex="-1" id="page-id">`. Find the stub comment and replace it with real content. See the Hudson County brand book (`develop` branch) for full working examples of every layout type:

| Layout | Example page ID |
|---|---|
| Text-only intro (full height) | `type-intro`, `photo-intro` |
| Two-column intro with image panel | `vi-intro`, `app-intro` |
| Logo/asset showcase | `logo-seal`, `logo-horizontal` |
| Color palette auto-rendered | `primary-palette`, `secondary-palette` |
| Color combinations grid | `color-combinations` |
| Color pathways | `color-pathways` |
| Type specimen | `fg-specimen` |
| Dos / Don'ts | `photo-landscape-dos`, `photo-community-dos` |
| Masonry gallery | `photo-landscape-examples`, `app-swag` |
| Icon library | `icon-library` |

---

## Images

Organize into subfolders matching your content sections. Reference images with relative paths from `index.html`, e.g. `images/photography/landscape-01.webp`. Use `.webp` for photography for best performance.

---

## Running locally

Open `index.html` in a browser, or serve with:

```bash
npx serve .
```

No build step required.
