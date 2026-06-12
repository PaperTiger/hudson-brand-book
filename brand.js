/* ─────────────────────────────────────────────────────────────────
   Hudson County Brand Configuration
   Single source of truth for tokens, typography, color data, and nav.
───────────────────────────────────────────────────────────────── */
const BRAND = {

  meta: {
    county:           "Hudson County, New Jersey",
    nameLine1:        "Hudson County,",
    nameLine2:        "New Jersey",
    title:            "Brand guidelines",
    version:          "Version 1.0",
    date:             "June 2026",
    preparedBy:       "Paper Tiger",
    sidebarLogoImage: "images/logos/HCNJ_text_deep-teal.svg",
    coverSealImage:   "images/logos/HCNJ_county-seal_deep-teal.svg",
  },

  /* ── Type specimen copy ───────────────────────────────────── */
  specimens: {
    // Display — Founders Grotesk Condensed Bold
    display96:  "HCNJ",
    display73:  "Hudson County",
    display64:  "Government that works",
    display48:  "For every community in New Jersey",
    // Headlines — Founders Grotesk Semibold
    headline42: "Essential county services",
    headline32: "Services for 700,000 residents",
    headline24: "Connecting people to their county government",
    headline21: "Accessible government starts with clear communication",
    // Body — Founders Grotesk Text (and fallback fonts)
    body18:     "Hudson County provides essential services to more than 700,000 residents.",
    body16:     "Hudson County provides essential services to more than 700,000 residents across 12 municipalities. Every document, every sign, every screen is a chance to make that relationship clearer and more trusted.",
    body14:     "Hudson County provides essential services to more than 700,000 residents across 12 municipalities. Every document, every sign, every screen is a chance to make that relationship clearer and more trusted. The brand must function at every size, from street signage to digital interfaces.",
    body12:     "Caption and supporting text. Hudson County provides essential services to more than 700,000 residents across 12 municipalities.",
    sentence:   "Hudson County provides essential services to more than 700,000 residents across 12 municipalities.",
    // "What to avoid" page specimens
    avoidText:      "Hudson County is a county in the U.S. state of New Jersey, its smallest and most densely populated.",
    avoidTextPart1: "Hudson County",
    avoidTextPart2: "is a county in the U.S. state of New Jersey, its smallest and most densely populated.",
    // Fallback font sections (sentence + generic note)
    fallbackGoogle16: "Hudson County provides essential services to more than 700,000 residents across 12 municipalities. When brand fonts are unavailable, DM Sans provides a clean, modern alternative with excellent on-screen legibility.",
    fallbackSystem16: "Hudson County provides essential services to more than 700,000 residents across 12 municipalities. When brand fonts are unavailable, Arial maintains clarity and legibility across all system environments.",
  },

  /* ── CSS custom properties ────────────────────────────────── */
  tokens: {
    green:        "#003230",
    teal:         "#74FBD7",
    charcoal:     "#000913",
    cream:        "#FAFAFA",
    "warm-gray":  "#6B6B6B",
    "light-gray": "#E3E3E3",
    white:        "#FFFFFF",
    blue:         "#0004F5",
    yellow:       "#EBE825",
    purple:       "#6B1262",
    lime:         "#8AF161",
    amaranth:     "#EB254D",
    "deep-teal":  "#003230",
  },

  /* ── Font faces ───────────────────────────────────────────── */
  typography: {
    fonts: [
      { family: "Founders Grotesk Condensed", weight: 700, file: "fonts/founders-grotesk-condensed-bold.woff2" },
      { family: "Founders Grotesk",           weight: 500, file: "fonts/founders-grotesk-medium.woff2" },
      { family: "Founders Grotesk",           weight: 600, file: "fonts/founders-grotesk-semibold.woff2" },
      { family: "Founders Grotesk Text",      weight: 400, file: "fonts/founders-grotesk-text-regular.woff2" },
      { family: "Founders Grotesk Text",      weight: 600, file: "fonts/founders-grotesk-text-semibold.woff2" },
    ],
  },

  /* ── Color palettes ───────────────────────────────────────── */
  colors: {
    primary: [
      {
        name: "Liberty Green", hex: "#74FBD7", textColor: "#000913",
        rgb: [116, 251, 215], cmyk: [54, 0, 14, 2],
      },
      {
        name: "Deep Teal", hex: "#003230", textColor: "#74FBD7",
        rgb: [0, 50, 48], cmyk: [100, 0, 4, 80],
      },
      {
        name: "Charcoal", hex: "#000913", textColor: "#FFFFFF",
        rgb: [0, 9, 19], cmyk: [100, 53, 0, 93],
      },
      {
        name: "white-01", hex: "#FFFFFF", textColor: "#000913",
        rgb: [255, 255, 255], cmyk: [0, 0, 0, 0],
      },
    ],
    secondary: [
      {
        name: "Hudson Blue", hex: "#0004F5", textColor: "#74FBD7",
        rgb: [0, 4, 245], cmyk: [100, 98, 0, 4],
      },
      {
        name: "Purple", hex: "#6B1262", textColor: "#FFFFFF",
        rgb: [107, 18, 98], cmyk: [0, 83, 8, 58],
      },
      {
        name: "Flag Yellow", hex: "#EBE825", textColor: "#000913",
        rgb: [235, 232, 37], cmyk: [0, 1, 84, 8],
      },
      {
        name: "Green", hex: "#8AF161", textColor: "#000913",
        rgb: [138, 241, 97], cmyk: [43, 0, 60, 5],
      },
      {
        name: "Amaranth", hex: "#EB254D", textColor: "#000913",
        rgb: [235, 37, 77], cmyk: [0, 84, 67, 8],
      },
      {
        name: "Gray", hex: "#E3E3E3", textColor: "#000913",
        rgb: [227, 227, 227], cmyk: [0, 0, 0, 11],
        outline: "1px solid #C8C8C8",
      },
    ],
  },

  /* ── Navigation structure ─────────────────────────────────── */
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
            { label: "Horizontal", id: "logo-horizontal" },
            { label: "Stacked",    id: "logo-stacked" },
            { label: "Text only",  id: "logo-text-only" },
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
          ],
        },
        { label: "Avatar &amp; favicon", id: "logo-avatar" },
        { label: "What to avoid", id: "logo-avoid" },
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
          label: "Founders Grotesk", id: "fg-overview",
          groupId: "nav-fg-group", subId: "nav-fg-sub",
          children: [
            { label: "Overview",      id: "fg-overview" },
            { label: "Usage",         id: "fg-usage" },
            { label: "Type specimen", id: "fg-specimen" },
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
        { label: "Introduction",        id: "photo-intro" },
        { label: "Landscape: dos",      id: "photo-landscape-dos" },
        { label: "Landscape: don'ts",   id: "photo-landscape-donts" },
        { label: "Community: dos",      id: "photo-community-dos" },
        { label: "Community: don'ts",   id: "photo-community-donts" },
      ],
    },
    {
      group: "Applications",
      items: [
        { label: "Introduction",  id: "app-intro" },
        { label: "Swag samples",  id: "app-swag" },
        { label: "In the wild",   id: "app-wild" },
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

  const html = BRAND.nav.map(section => {
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

    return `
    <div class="nav-group">
      <div class="nav-group-header">${section.group}</div>
      ${items}
    </div>`;
  }).join("");

  const container = document.getElementById("nav-groups");
  if (container) container.innerHTML = html;
}


/* Render a color palette grid from an array of color objects */
function renderPalette(containerId, colors, minHeight) {
  function colorValues(c) {
    const [r, g, b] = c.rgb;
    const [cm, m, y, k] = c.cmyk;
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
    <div style="background:${c.hex}; padding:32px 40px; display:flex; flex-direction:column; justify-content:space-between; min-height:${minHeight}px;${c.outline ? " outline:" + c.outline + ";" : ""}">
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
  document.title = `${BRAND.meta.nameLine1} ${BRAND.meta.nameLine2}, Brand Identity`;

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
