#!/usr/bin/env node
/**
 * sync-figma.js — Sync brand.js ↔ Figma Brand Tokens file
 *
 * Usage:
 *   node sync-figma.js pull   — Figma → brand.js (update tokens + palette from Figma)
 *   node sync-figma.js push   — brand.js → Figma (push token values to Figma variables)
 *
 * Setup:
 *   1. Copy sync.config.example.json → sync.config.json
 *   2. Add your Figma Personal Access Token (Figma → Account Settings → Personal access tokens)
 *   3. node sync-figma.js pull
 *
 * Requires Node 18+ (uses built-in fetch).
 */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const CONFIG_PATH   = path.join(__dirname, 'sync.config.json');
const BRAND_JS_PATH = path.join(__dirname, 'brand.js');

// ── Config ───────────────────────────────────────────────────────

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('sync.config.json not found.');
    console.error('Copy sync.config.example.json → sync.config.json and fill in your token.');
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  if (!config.figmaToken || config.figmaToken === 'YOUR_TOKEN_HERE') {
    console.error('Set figmaToken in sync.config.json');
    console.error('Get it: Figma → Account Settings → Personal access tokens');
    process.exit(1);
  }
  return config;
}

// ── Parse brand.js ───────────────────────────────────────────────

function loadBrand() {
  const brandJs = fs.readFileSync(BRAND_JS_PATH, 'utf8');
  // Strip everything after the BRAND object (init function + helpers)
  const dataOnly = brandJs
    .replace(/\/\*[\s\S]*?\*\//g, '')       // strip block comments
    .replace(/\(function init[\s\S]*/, '')   // strip init() and everything after
    .replace(/function \w+[\s\S]*/, '');     // strip any stray function defs
  const context = {};
  vm.createContext(context);
  vm.runInContext(dataOnly, context);
  return context.BRAND;
}

// ── Color helpers ────────────────────────────────────────────────

function rgbToHex({ r, g, b }) {
  const h = v => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function hexToRgb01(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

// ── Figma REST API ────────────────────────────────────────────────

async function figmaGet(token, fileKey, endpoint) {
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}${endpoint}`, {
    headers: { 'X-Figma-Token': token },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Figma GET ${endpoint} → ${res.status}: ${body}`);
  }
  return res.json();
}

async function figmaPost(token, fileKey, endpoint, body) {
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}${endpoint}`, {
    method: 'POST',
    headers: { 'X-Figma-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma POST ${endpoint} → ${res.status}: ${text}`);
  }
  return res.json();
}

// ── PULL: Figma → brand.js ────────────────────────────────────────

async function pull(token, fileKey) {
  console.log('Pulling from Figma...');

  const data = await figmaGet(token, fileKey, '/variables/local');
  const variables   = Object.values(data.meta.variables);
  const collections = Object.values(data.meta.variableCollections);

  const brandCollection = collections.find(c => c.name === 'Brand Tokens');
  if (!brandCollection) throw new Error('"Brand Tokens" variable collection not found in Figma file.');

  const modeId  = brandCollection.defaultModeId;
  const collVars = variables.filter(v => v.variableCollectionId === brandCollection.id);

  const newTokens    = {};
  const newPrimary   = [];
  const newSecondary = [];

  for (const variable of collVars) {
    if (variable.resolvedType !== 'COLOR') continue;
    const value = variable.valuesByMode[modeId];
    if (!value) continue;
    const hex = rgbToHex(value);

    if (variable.name.startsWith('tokens/')) {
      newTokens[variable.name.replace('tokens/', '')] = hex;
    } else if (variable.name.startsWith('palette/primary/')) {
      newPrimary.push({ name: variable.name.replace('palette/primary/', ''), hex });
    } else if (variable.name.startsWith('palette/secondary/')) {
      newSecondary.push({ name: variable.name.replace('palette/secondary/', ''), hex });
    }
  }

  // Preserve existing textColor values — only hex comes from Figma
  const brand = loadBrand();
  function withTextColor(newColors, existing) {
    return newColors.map(c => {
      const match = existing.find(e => e.name === c.name);
      const textColor = match?.textColor ?? '#000000';
      const outline   = match?.outline;
      return outline ? { name: c.name, hex: c.hex, textColor, outline } : { name: c.name, hex: c.hex, textColor };
    });
  }

  const primary   = withTextColor(newPrimary,   brand.colors.primary);
  const secondary = withTextColor(newSecondary, brand.colors.secondary);

  // Rewrite brand.js
  let brandJs = fs.readFileSync(BRAND_JS_PATH, 'utf8');

  // Tokens block
  const tokenLines = Object.entries(newTokens)
    .map(([k, v]) => `    "${k}":  "${v}",`)
    .join('\n');
  brandJs = brandJs.replace(
    /(tokens:\s*\{)[^}]*(\})/s,
    `$1\n${tokenLines}\n  $2`
  );

  // Primary colors block
  const primaryLines = primary
    .map(c => {
      const extra = c.outline ? `, outline: "${c.outline}"` : '';
      return `      { name: "${c.name}", hex: "${c.hex}", textColor: "${c.textColor}"${extra} },`;
    })
    .join('\n');
  brandJs = brandJs.replace(
    /(primary:\s*\[)[^\]]*(\])/s,
    `$1\n${primaryLines}\n    $2`
  );

  // Secondary colors block
  const secondaryLines = secondary
    .map(c => {
      const extra = c.outline ? `, outline: "${c.outline}"` : '';
      return `      { name: "${c.name}", hex: "${c.hex}", textColor: "${c.textColor}"${extra} },`;
    })
    .join('\n');
  brandJs = brandJs.replace(
    /(secondary:\s*\[)[^\]]*(\])/s,
    `$1\n${secondaryLines}\n    $2`
  );

  fs.writeFileSync(BRAND_JS_PATH, brandJs);

  console.log(`✓ brand.js updated`);
  console.log(`  ${Object.keys(newTokens).length} tokens`);
  console.log(`  ${primary.length} primary colors`);
  console.log(`  ${secondary.length} secondary colors`);
}

// ── PUSH: brand.js → Figma ────────────────────────────────────────

async function push(token, fileKey) {
  console.log('Pushing to Figma...');

  const brand = loadBrand();
  const data  = await figmaGet(token, fileKey, '/variables/local');
  const variables   = Object.values(data.meta.variables);
  const collections = Object.values(data.meta.variableCollections);

  const brandCollection = collections.find(c => c.name === 'Brand Tokens');
  if (!brandCollection) throw new Error('"Brand Tokens" variable collection not found.');

  const modeId = brandCollection.defaultModeId;

  function findVar(name) {
    return variables.find(v =>
      v.name === name && v.variableCollectionId === brandCollection.id
    );
  }

  const updates = [];

  // Tokens
  for (const [key, hex] of Object.entries(brand.tokens)) {
    const existing = findVar(`tokens/${key}`);
    if (existing) {
      updates.push({
        action: 'UPDATE',
        id: existing.id,
        setValueForMode: { [modeId]: hexToRgb01(hex) },
      });
    }
  }

  // Palette primary
  for (const color of brand.colors.primary) {
    const existing = findVar(`palette/primary/${color.name}`);
    if (existing) {
      updates.push({
        action: 'UPDATE',
        id: existing.id,
        setValueForMode: { [modeId]: hexToRgb01(color.hex) },
      });
    }
  }

  // Palette secondary
  for (const color of brand.colors.secondary) {
    const existing = findVar(`palette/secondary/${color.name}`);
    if (existing) {
      updates.push({
        action: 'UPDATE',
        id: existing.id,
        setValueForMode: { [modeId]: hexToRgb01(color.hex) },
      });
    }
  }

  if (updates.length === 0) {
    console.log('No matching variables found to update.');
    return;
  }

  await figmaPost(token, fileKey, '/variables', { variables: updates });

  console.log(`✓ Figma updated — ${updates.length} variables pushed`);
}

// ── CLI ───────────────────────────────────────────────────────────

async function main() {
  const command = process.argv[2];

  if (!command || command === 'help') {
    console.log(`
sync-figma.js — Sync brand.js ↔ Figma

  node sync-figma.js pull   Pull colors from Figma → update brand.js
  node sync-figma.js push   Push colors from brand.js → update Figma

Figma file: https://www.figma.com/design/qfgcG4lTk8FAPUGNEd2N2j
    `);
    return;
  }

  const config = loadConfig();
  const { figmaToken, figmaFileKey } = config;

  if (command === 'pull')      await pull(figmaToken, figmaFileKey);
  else if (command === 'push') await push(figmaToken, figmaFileKey);
  else {
    console.error(`Unknown command: "${command}". Use pull or push.`);
    process.exit(1);
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
