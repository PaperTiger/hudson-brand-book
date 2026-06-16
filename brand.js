/* ═══════════════════════════════════════════════════════════════════
   BRAND BOOK — CONFIGURATION
   ───────────────────────────────────────────────────────────────────
   Start here. Everything below drives the brand book automatically.
   Work through each section in order:

     1. meta        — org name, document title, logo paths
     2. tokens      — CSS custom properties (colors used in CSS/inline styles)
     3. typography  — font files and families
     4. colors      — color palette cards (primary + secondary)
     5. specimens   — sample text used on the Typography pages
     6. nav         — sidebar navigation structure

   After configuring, replace each page's content stub in index.html
   with real content. See SETUP.md for a step-by-step guide.
═══════════════════════════════════════════════════════════════════ */

const BRAND = {

  /* ── 1. Meta ─────────────────────────────────────────────────
     nameLine1 / nameLine2 split across two lines on the cover.
     sidebarLogoImage: SVG shown in the sidebar header.
     coverSealImage:   SVG shown on the cover page.
  ──────────────────────────────────────────────────────────────── */
  meta: {
    county:           "[Org Name]",
    nameLine1:        "[Org Name]",
    nameLine2:        "",
    title:            "Brand guidelines",
    version:          "Version 1.0",
    date:             "2025",
    preparedBy:       "[Studio Name]",
    sidebarLogoImage: "images/logos/logo-sidebar.svg",
    coverSealImage:   "images/logos/logo-cover.svg",
  },

  /* ── 2. Tokens ────────────────────────────────────────────────
     These become CSS custom properties on :root, e.g. var(--primary).
     Used throughout the CSS and inline styles in index.html.
     Keep the key names or do a find-replace on index.html if you
     rename them.
  ──────────────────────────────────────────────────────────────── */
  tokens: {
    /* Core brand colors — update these first */
    primary:      "#003230",   /* dark brand color (backgrounds, headers) */
    accent:       "#74FBD7",   /* light accent (highlights, links) */
    charcoal:     "#000913",   /* near-black for body text */
    cream:        "#FAFAFA",   /* near-white backgrounds */
    "warm-gray":  "#6B6B6B",   /* secondary text */
    "light-gray": "#E3E3E3",   /* borders, dividers */
    white:        "#FFFFFF",

    /* Secondary palette — used in color combination examples */
    blue:         "#0004F5",
    yellow:       "#EBE825",
    purple:       "#6B1262",
    lime:         "#8AF161",
    amaranth:     "#EB254D",

    /* Alias — keep in sync with 'primary' above */
    "deep-teal":  "#003230",
    green:        "#003230",
    teal:         "#74FBD7",
  },

  /* ── 3. Typography ────────────────────────────────────────────
     Add one entry per font file in the fonts/ folder.
     family: CSS font-family name used in stylesheets.
     weight: numeric CSS font-weight.
     file:   path relative to index.html.
  ──────────────────────────────────────────────────────────────── */
  typography: {
    fonts: [
      { family: "Brand Font Condensed", weight: 700, file: "fonts/brand-condensed-bold.woff2" },
      { family: "Brand Font",           weight: 500, file: "fonts/brand-medium.woff2" },
      { family: "Brand Font",           weight: 600, file: "fonts/brand-semibold.woff2" },
      { family: "Brand Font Text",      weight: 400, file: "fonts/brand-text-regular.woff2" },
      { family: "Brand Font Text",      weight: 600, file: "fonts/brand-text-semibold.woff2" },
    ],
  },

  /* ── 4. Colors ────────────────────────────────────────────────
     Drives the color palette card pages (Primary palette, Secondary palette).
     Only hex, textColor, and (optionally) outline are needed — RGB and CMYK
     are computed automatically by hexToRgb() and hexToCmyk() at render time.
     textColor: hex for text/dots on top of the swatch (white or dark).
     outline:   use "1px solid #C8C8C8" for light swatches needing a border.
  ──────────────────────────────────────────────────────────────── */
  colors: {
    primary: [
<<<<<<< HEAD
      { name: "Accent",   hex: "#74FBD7", textColor: "#000913" },
      { name: "Primary",  hex: "#003230", textColor: "#74FBD7" },
      { name: "Charcoal", hex: "#000913", textColor: "#FFFFFF" },
      { name: "White",    hex: "#FFFFFF", textColor: "#000913", outline: "1px solid #C8C8C8" },
    ],
    secondary: [
      { name: "Blue",   hex: "#0004F5", textColor: "#74FBD7" },
      { name: "Purple", hex: "#6B1262", textColor: "#FFFFFF" },
      { name: "Yellow", hex: "#EBE825", textColor: "#000913" },
      { name: "Green",  hex: "#8AF161", textColor: "#000913" },
      { name: "Red",    hex: "#EB254D", textColor: "#000913" },
      { name: "Gray",   hex: "#E3E3E3", textColor: "#000913", outline: "1px solid #C8C8C8" },
=======
      { name: "Liberty Green", hex: "#74FBD7", textColor: "#000913" },
      { name: "Deep Teal",     hex: "#003230", textColor: "#74FBD7" },
      { name: "Charcoal",      hex: "#000913", textColor: "#FFFFFF" },
      { name: "White",         hex: "#FFFFFF", textColor: "#000913" },
    ],
    secondary: [
      { name: "Hudson Blue",  hex: "#0004F5", textColor: "#74FBD7" },
      { name: "Purple",       hex: "#6B1262", textColor: "#FFFFFF" },
      { name: "Flag Yellow",  hex: "#EBE825", textColor: "#000913" },
      { name: "Green",        hex: "#8AF161", textColor: "#000913" },
      { name: "Amaranth",     hex: "#EB254D", textColor: "#000913" },
      { name: "Gray",         hex: "#E3E3E3", textColor: "#000913", outline: "1px solid #C8C8C8" },
>>>>>>> develop
    ],
  },

  /* ── 5. Specimens ─────────────────────────────────────────────
     Sample text rendered on the Typography pages via data-brand="specimens.x".
     Replace with org-relevant copy — a tagline, mission statement, etc.
  ──────────────────────────────────────────────────────────────── */
  specimens: {
    display96:  "[ORG]",
    display73:  "[Org Name]",
    display64:  "[Primary tagline]",
    display48:  "[Secondary tagline or descriptor]",
    headline42: "[Section headline]",
    headline32: "[Section subheadline]",
    headline24: "[Supporting headline copy]",
    headline21: "[Longer supporting headline copy that wraps]",
    body18:     "[Org Name] provides [services] to [audience].",
    body16:     "[Org Name] provides [services] to [audience]. Every document, every sign, every screen is a chance to make that relationship clearer and more trusted.",
    body14:     "[Org Name] provides [services] to [audience]. Every document, every sign, every screen is a chance to make that relationship clearer and more trusted. The brand must function at every size, from street signage to digital interfaces.",
    body12:     "Caption and supporting text. [Org Name] provides [services] to [audience].",
    sentence:   "[Org Name] provides [services] to [audience].",
    avoidText:      "[Sample sentence for the 'what to avoid' examples.]",
    avoidTextPart1: "[Org Name]",
    avoidTextPart2: "[rest of sample sentence for avoid examples.]",
    fallbackGoogle16: "[Org Name] provides [services] to [audience]. When brand fonts are unavailable, [Google Font] provides a clean, modern alternative with excellent on-screen legibility.",
    fallbackSystem16: "[Org Name] provides [services] to [audience]. When brand fonts are unavailable, Arial maintains clarity and legibility across all system environments.",
  },

  /* ── 6. Navigation ────────────────────────────────────────────
     Drives the sidebar. Each group becomes a section header.
     Items with children render as expandable dropdowns — you must
     also register their groupId in the routing script in index.html
     (see SETUP.md §6 for instructions).
  ──────────────────────────────────────────────────────────────── */
  nav: [
    {
      group: "Visual identity",
      items: [
        { label: "Introduction", id: "vi-intro" },
      ],
    },
    {
      group: "Logo &amp; mark",
      items: [
        { label: "County seal", id: "logo-seal" },
        {
          label: "Full logo", id: "logo-horizontal",
          groupId: "nav-full-logo-group", subId: "nav-full-logo-sub",
          children: [
            { label: "Horizontal",   id: "logo-horizontal" },
            { label: "Stacked",      id: "logo-stacked" },
            { label: "Text lockup",  id: "logo-text-only" },
            { label: "Text only",    id: "logo-text-only-small" },
            { label: "Size guide",   id: "logo-size-guide" },
          ],
        },
        { label: "H logo mark", id: "h-logo-mark" },
        {
          label: "HCNJ logo", id: "hcnj-horizontal",
          groupId: "nav-hcnj-group", subId: "nav-hcnj-sub",
          children: [
            { label: "Horizontal",    id: "hcnj-horizontal" },
            { label: "Text lockup",   id: "hcnj-text-lockup" },
            { label: "Text only",     id: "hcnj-text-only" },
            { label: "Size guide",    id: "hcnj-size-guide" },
          ],
        },
        { label: "Avatar &amp; favicon", id: "logo-avatar" },
        { label: "What to avoid", id: "logo-avoid" },
        { label: "Co-sponsorship lockup", id: "logo-cosponsor" },
      ],
    },
    {
      group: "Color",
      items: [
        { label: "Introduction",                   id: "color-intro" },
        { label: "Primary palette",                id: "primary-palette" },
        { label: "Secondary palette",              id: "secondary-palette" },
        { label: "Combinations &amp; accessibility", id: "color-combinations" },
        { label: "Color pathways",                 id: "color-pathways" },
      ],
    },
    {
      group: "Typography",
      items: [
        { label: "Introduction", id: "type-intro" },
        {
          label: "Brand typeface", id: "fg-overview",
          groupId: "nav-fg-group", subId: "nav-fg-sub",
          children: [
            { label: "Overview",         id: "fg-overview" },
            { label: "Usage",            id: "fg-usage" },
            { label: "Type specimen",    id: "fg-specimen" },
            { label: "Size &amp; scale", id: "fg-scale" },
          ],
        },
        { label: "Google fallback",  id: "google-fallback" },
        { label: "System fallback",  id: "type-fallback" },
        { label: "What to avoid",    id: "type-avoid" },
      ],
    },
    {
      group: "Photography",
      items: [
        { label: "Introduction", id: "photo-intro" },
        {
          label: "Landscapes", id: "photo-landscape-examples",
          groupId: "nav-landscape-group", subId: "nav-landscape-sub",
          children: [
            { label: "Examples",  id: "photo-landscape-examples" },
            { label: "Dos",       id: "photo-landscape-dos" },
            { label: "Don'ts",    id: "photo-landscape-donts" },
          ],
        },
        {
          label: "Community", id: "photo-community-examples",
          groupId: "nav-community-photo-group", subId: "nav-community-photo-sub",
          children: [
            { label: "Examples",  id: "photo-community-examples" },
            { label: "Dos",       id: "photo-community-dos" },
            { label: "Don'ts",    id: "photo-community-donts" },
          ],
        },
      ],
    },
    {
      group: "Applications",
      items: [
        { label: "Introduction",  id: "app-intro" },
        { label: "Swag",          id: "app-swag" },
        { label: "Signage",       id: "app-signage" },
        { label: "Digital media", id: "app-digital" },
      ],
    },
    {
      group: "Iconography",
      items: [
        { label: "Introduction",  id: "icon-intro" },
        { label: "Icon library",  id: "icon-library" },
      ],
    },
  ],
};


/* ─────────────────────────────────────────────────────────────────
   Initialisation — runs before the nav/routing script
───────────────────────────────────────────────────────────────── */
(function init() {
  injectTokens();
  injectFonts();
  renderNav();
  renderPalette("primary-palette-grid",   BRAND.colors.primary,   384);
  renderPalette("secondary-palette-grid", BRAND.colors.secondary, 336);
  renderCoverMeta();
  renderContent();
})();


/* Inject CSS custom properties into :root */
function injectTokens() {
  const declarations = Object.entries(BRAND.tokens)
    .map(([k, v]) => `--${k}: ${v};`)
    .join(" ");
  const style = document.createElement("style");
  style.textContent = `:root { ${declarations} }`;
  document.head.appendChild(style);
}


/* Inject @font-face rules */
function injectFonts() {
  const rules = BRAND.typography.fonts.map(f =>
    `@font-face {
      font-family: '${f.family}';
      src: url('${f.file}') format('woff2');
      font-weight: ${f.weight};
      font-style: normal;
      font-display: swap;
    }`
  ).join("\n");
  const style = document.createElement("style");
  style.textContent = rules;
  document.head.appendChild(style);
}


/* Render sidebar navigation from BRAND.nav */
function renderNav() {
  const CHEVRON = `<svg class="nav-chevron" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6 9l6 6l6-6"/></svg>`;
  const SECTION_CHEVRON = `<svg class="nav-section-chevron" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6 9l6 6l6-6"/></svg>`;

  const html = BRAND.nav.map((section, sIdx) => {
    const items = section.items.map(item => {
      if (item.children) {
        const children = item.children.map(c =>
          `<a class="nav-link nav-child" href="#${c.id}" data-target="${c.id}">${c.label}</a>`
        ).join("");
        return `
        <div class="nav-expandable" id="${item.groupId}">
          <a class="nav-link nav-parent" href="#${item.id}" data-target="${item.id}" aria-expanded="false">
            ${item.label}
            ${CHEVRON}
          </a>
          <div class="nav-sub" id="${item.subId}">
            ${children}
          </div>
        </div>`;
      }
      return `<a class="nav-link" href="#${item.id}" data-target="${item.id}">${item.label}</a>`;
    }).join("");

    const openByDefault = sIdx === 0 ? ' open' : '';
    return `
    <div class="nav-group${openByDefault}" data-nav-section="${sIdx}">
      <div class="nav-group-header" role="button" aria-expanded="${sIdx === 0 ? 'true' : 'false'}">
        ${section.group}
        ${SECTION_CHEVRON}
      </div>
      <div class="nav-group-items">
        ${items}
      </div>
    </div>`;
  }).join("");

  const container = document.getElementById("nav-groups");
  if (container) {
    container.innerHTML = html;
    initNavSectionToggles();
  }
}

function initNavSectionToggles() {
  document.querySelectorAll('.nav-group-header[role="button"]').forEach(header => {
    header.addEventListener('click', function() {
      if (window.innerWidth > 768) return;
      const group = this.closest('.nav-group');
      const isOpen = group.classList.contains('open');
      document.querySelectorAll('.nav-group').forEach(g => {
        g.classList.remove('open');
        const h = g.querySelector('.nav-group-header[role="button"]');
        if (h) h.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        group.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });
}


/* Convert hex color to RGB array */
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/* Convert hex color to CMYK array (mathematical, not profile-aware) */
function hexToCmyk(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => v / 255);
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 100];
  const c = Math.round(((1 - r - k) / (1 - k)) * 100);
  const m = Math.round(((1 - g - k) / (1 - k)) * 100);
  const y = Math.round(((1 - b - k) / (1 - k)) * 100);
  return [c, m, y, Math.round(k * 100)];
}

/* Render a color palette grid from an array of color objects */
function renderPalette(containerId, colors, minHeight) {
  function colorValues(c) {
    const [r, g, b] = hexToRgb(c.hex);
    const [cm, m, y, k] = hexToCmyk(c.hex);
    const hex = c.hex.replace("#", "");
    return `
      <div style="display:grid; grid-template-columns:14px 1fr; gap:0 10px; line-height:1.1;">
        <span>R</span><span>${r}</span>
        <span>G</span><span>${g}</span>
        <span>B</span><span>${b}</span>
        <div style="grid-column:1/-1; height:7px;"></div>
        <span>C</span><span>${cm}</span>
        <span>M</span><span>${m}</span>
        <span>Y</span><span>${y}</span>
        <span>K</span><span>${k}</span>
        <div style="grid-column:1/-1; height:7px;"></div>
        <span>#</span><span>${hex}</span>
        <div style="grid-column:1/-1; height:7px;"></div>
        <span>P</span><span>---</span>
      </div>`;
  }

  const html = colors.map(c => `
    <div style="background:${c.hex}; padding:32px 40px; display:flex; flex-direction:column; justify-content:space-between; min-height:${minHeight}px;${c.outline ? " box-shadow:inset 0 0 0 1px #C8C8C8;" : ""}">
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:8px; height:8px; border-radius:50%; background:${c.textColor}; flex-shrink:0;"></div>
        <span style="font-size:16px; font-weight:600; color:${c.textColor}; letter-spacing:0.02em; line-height:1; font-family:inherit;">${c.name}</span>
      </div>
      <div style="font-size:11px; color:${c.textColor}; font-family:inherit;">
        ${colorValues(c)}
      </div>
    </div>`
  ).join("");

  const el = document.getElementById(containerId);
  if (el) el.innerHTML = html;
}


/* Populate cover page metadata */
function renderCoverMeta() {
  const el = document.getElementById("cover-meta");
  if (!el) return;
  const m = BRAND.meta;
  el.innerHTML = `
    <div style="font-weight:600;">${m.title}</div>
    <div>${m.version}</div>
    <div>${m.date}</div>
    <div style="white-space:nowrap;">Prepared by ${m.preparedBy}</div>`;
}

/* Fill data-brand (text) and data-brand-src (image src) from BRAND config */
function renderContent() {
  document.title = `${BRAND.meta.nameLine1} ${BRAND.meta.nameLine2} Brand Identity`;

  document.querySelectorAll('[data-brand-src]').forEach(el => {
    const val = resolveKey(el.getAttribute('data-brand-src'));
    if (val) el.src = val;
  });

  document.querySelectorAll('[data-brand]').forEach(el => {
    const val = resolveKey(el.getAttribute('data-brand'));
    if (val !== undefined) el.textContent = val;
  });
}

function resolveKey(path) {
  return path.split('.').reduce((obj, k) => (obj != null ? obj[k] : undefined), BRAND);
}
