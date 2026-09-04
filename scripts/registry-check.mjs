#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const graph = read('data/graph.json');
const surfaceData = read('data/surfaces.json');
const failures = [];
const cells = graph.cells || {};
const surfaces = surfaceData.surfaces || {};
const order = surfaceData.hubCatalog || [];
const categories = new Set(['games', 'tools', 'experiments', 'knowledge', 'creative', 'fun']);
const findCellDir = slug => {
  for (const category of fs.readdirSync(path.join(root, 'cells'))) {
    const candidate = path.join(root, 'cells', category, slug);
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.join(root, 'cells', slug);
};

if (new Set(order).size !== order.length) failures.push('hubCatalog contains duplicate entries');
for (const slug of Object.keys(cells)) {
  if (!order.includes(slug)) failures.push(`published cell missing from hubCatalog: ${slug}`);
}

for (const [slug, cell] of Object.entries(cells)) {
  if (slug !== cell.slug) failures.push(`slug mismatch: ${slug}`);
  if (!categories.has(cell.category)) failures.push(`unknown category: ${slug} -> ${cell.category}`);
  if (!cell.url) failures.push(`missing canonical URL: ${slug}`);
  if (!surfaces[slug]) failures.push(`missing runtime surface: ${slug}`);
}
for (const slug of order) {
  if (!cells[slug]) failures.push(`hub catalog references unknown cell: ${slug}`);
}
for (const [slug, surface] of Object.entries(surfaces)) {
  if (!cells[slug]) failures.push(`runtime surface references unknown cell: ${slug}`);
  if (surface.category || surface.hubCategory || surface.url) failures.push(`runtime metadata duplicates canonical content fields: ${slug}`);
  if (surface.type === 'external' && surface.shell?.enabled !== true && !surface.shell?.exception) failures.push(`external surface needs documented shell exception: ${slug}`);
  if (surface.type === 'cell' && surface.pwa?.scope !== `/${slug}/`) failures.push(`cell PWA scope must be /${slug}/: ${slug}`);
  if (surface.shell?.enabled) {
    const cellDir = findCellDir(slug);
    for (const file of ['index.html', 'manifest.webmanifest', 'sw.js', 'icon-192.svg', 'icon-512.svg']) {
      if (!fs.existsSync(path.join(cellDir, file))) failures.push(`shell/PWA surface missing ${file}: ${slug}`);
    }
    const html = fs.readFileSync(path.join(cellDir, 'index.html'), 'utf8');
    for (const reference of ['/data/js/micr-shell.js', '/data/styles/micr-shell.css', '/data/js/app-pwa.js', 'MicrShell.mount']) {
      if (!html.includes(reference)) failures.push(`shell/PWA surface missing ${reference}: ${slug}`);
    }
    const manifestPath = path.join(cellDir, 'manifest.webmanifest');
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (manifest.start_url !== `/${slug}/`) failures.push(`manifest start_url mismatch: ${slug}`);
      if (manifest.scope !== `/${slug}/`) failures.push(`manifest scope mismatch: ${slug}`);
      for (const icon of ['icon-192.svg', 'icon-512.svg']) {
        if (!manifest.icons?.some(item => item.src === icon)) failures.push(`manifest missing ${icon}: ${slug}`);
      }
    } catch (error) { failures.push(`invalid manifest.webmanifest: ${slug} (${error.message})`); }
  }
}
const hub = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (/const\s+APPS\s*=/.test(hub)) failures.push('hub must not define hardcoded APPS');
if (!hub.includes('/data/js/catalog-hub.js')) failures.push('hub is missing registry-driven renderer');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`registry check OK: ${Object.keys(cells).length} cells, ${order.length} hub entries, ${Object.values(surfaces).filter(surface => surface.shell?.enabled).length} shell prototypes`);
