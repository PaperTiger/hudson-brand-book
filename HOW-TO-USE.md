# How to Use This Template

This is a fully-wired brand book template. The CSS, navigation, routing, and all interactive behaviour are ready. Your job is to configure the brand tokens in `brand.js` and fill in the page content in `index.html`.

---

## Part 1 — Setting up a new project

The template lives on the `template` branch of the Hudson County repo. You have two options for starting a new project:

### Option A — Duplicate via Terminal (recommended)

1. Create a **new empty repo** on GitHub for the new project (e.g. `bergen-brand-book`)
2. Open Terminal and run:

```bash
# Clone only the template branch into a new folder
git clone --branch template --single-branch https://github.com/YOUR-ORG/hudson-brand-book.git bergen-brand-book

# Enter the folder
cd bergen-brand-book

# Point it at the new repo instead of Hudson County
git remote set-url origin https://github.com/YOUR-ORG/bergen-brand-book.git

# Push it up as the starting point
git push -u origin template
```

3. In GitHub Desktop: **File → Add Local Repository** → select the new folder

### Option B — GitHub Desktop only (no Terminal)

1. In GitHub Desktop, clone the Hudson County repo to a new local folder
2. Switch to the `template` branch
3. Create a new empty repo on GitHub
4. Manually copy the files from the clone into the new repo folder
5. Commit and push

---

## Part 2 — First things to configure

Open `brand.js` and work top to bottom. The order matters — tokens affect everything else.

### 1. Tokens first

These become CSS custom properties. Every color in the book reads from here.

```js
tokens: {
  primary:  "#YOUR-DARK-COLOR",
  accent:   "#YOUR-LIGHT-COLOR",
  charcoal: "#YOUR-BODY-TEXT-COLOR",
  cream:    "#YOUR-BACKGROUND-COLOR",
  ...
}
```

Open `index.html` in a browser after this step — you'll immediately see the sidebar, cover, and nav update.

### 2. Meta

The org name appears on the cover automatically.

```js
meta: {
  nameLine1: "Bergen County,",
  nameLine2: "New Jersey",
  preparedBy: "Paper Tiger",
  sidebarLogoImage: "images/logos/logo-sidebar.svg",
  coverSealImage:   "images/logos/logo-cover.svg",
}
```

### 3. Fonts

Drop `.woff2` files into the `fonts/` folder, then update:

```js
typography: {
  fonts: [
    { family: "Your Display Font", weight: 700, file: "fonts/your-display-bold.woff2" },
    { family: "Your Body Font",    weight: 400, file: "fonts/your-body-regular.woff2" },
  ]
}
```

Then find the Tailwind config block near the top of `index.html` and update the font family names there too.

### 4. Color palette cards

These populate the Primary palette and Secondary palette pages automatically. For each color you only need `name`, `hex`, and `textColor` — RGB and CMYK are computed automatically:

```js
{ name: "Brand Blue", hex: "#0033CC", textColor: "#FFFFFF" }
```

Add `outline: "1px solid #C8C8C8"` for any very light swatch that needs a visible border.

### 5. Type specimens

Replace placeholder text in `BRAND.specimens` with the org's real tagline or mission statement. These appear on the Typography pages automatically.

### 6. Navigation

Add, remove, or rename sections and pages in `BRAND.nav`. If you add an expandable dropdown (one with `children`), see `SETUP.md §6` for the 4-step routing script update required in `index.html`.

---

## Part 3 — Filling in page content

Each page in `index.html` looks like this after the template strip:

```html
<div class="page" tabindex="-1" id="color-intro">
  <!-- TODO: Add page content for "color-intro" -->
</div>
```

Replace the comment with real HTML. The Hudson County `develop` branch is your reference — every layout pattern is there, fully built. To look at a specific page:

1. Open `index.html` from the `develop` branch (clone it separately or view it on GitHub)
2. Find the matching `id="..."` and copy the content between the opening and closing `<div>`
3. Paste into your new project and edit the copy

### Layout patterns available (with working examples in `develop`)

| Layout | Example page ID |
|---|---|
| Text-only intro (full height) | `type-intro`, `photo-intro` |
| Two-column intro with image panel | `vi-intro`, `app-intro` |
| Logo / asset showcase | `logo-seal`, `logo-horizontal` |
| Color palette (auto-rendered) | `primary-palette`, `secondary-palette` |
| Color combinations grid | `color-combinations` |
| Color pathways | `color-pathways` |
| Type specimen | `fg-specimen` |
| Dos / Don'ts | `photo-landscape-dos`, `photo-community-dos` |
| Masonry gallery | `photo-landscape-examples`, `app-swag` |
| Icon library | `icon-library` |

---

## Part 4 — Pushing your work (saving to GitHub)

### Saving a checkpoint (commit)

1. Make changes to files
2. In GitHub Desktop, changed files appear on the left
3. Write a short summary at the bottom left (e.g. "Update brand colors and org name")
4. Click **Commit to [branch name]**

### Pushing to GitHub (uploading)

After committing, click **Push origin** in the top bar. Your work is now backed up on GitHub.

### Pulling (downloading changes)

1. Click **Fetch origin** — checks for anything new
2. If there are new commits it becomes **Pull origin** — click to download

---

## Part 5 — Branch strategy

A simple setup that works well for each new project:

| Branch | Purpose |
|---|---|
| `main` | Published / client-approved version. Merge here only when signed off. |
| `develop` | Active working branch. All day-to-day edits go here. |

When starting a new project:

1. The `template` branch is your starting point
2. Immediately create a `develop` branch from it
3. Do all work on `develop`
4. When the client approves, merge `develop` → `main`

In GitHub Desktop: **Branch → New Branch → name it `develop` → Create Branch.**

---

## Part 6 — Keeping the template up to date

If you improve the framework on a client project (better CSS, a new layout type, a routing fix), bring those improvements back to the Hudson County `template` branch:

- Note what changed and manually apply the same edit to `template`
- Do not merge whole branches — that would pull in client-specific content

This keeps the template sharp for the next project.

---

## Quick reference checklist

```
[ ] Create new GitHub repo
[ ] Clone template branch into new folder
[ ] Point git remote at new repo, push
[ ] Create a develop branch
[ ] Update BRAND.tokens (colors)
[ ] Update BRAND.meta (org name, logo paths)
[ ] Drop fonts into fonts/, update BRAND.typography
[ ] Update BRAND.colors (palette cards)
[ ] Update BRAND.specimens (type specimen copy)
[ ] Update BRAND.nav (add/remove pages as needed)
[ ] Drop logos and images into images/
[ ] Fill in page content stubs one section at a time
[ ] Commit and push after each section
```

---

## Running locally

Open `index.html` directly in any modern browser, or serve with:

```bash
npx serve .
```

No build step required.
