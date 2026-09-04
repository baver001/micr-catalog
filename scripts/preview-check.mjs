#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const graph = JSON.parse(fs.readFileSync(path.join(root, 'data/graph.json'), 'utf8'));
const surfaces = JSON.parse(fs.readFileSync(path.join(root, 'data/surfaces.json'), 'utf8'));
const order = surfaces.hubCatalog || Object.keys(graph.cells || {});
const failures = [];
const pngSize = file => {
  const buffer = fs.readFileSync(file);
  if (buffer.readUInt32BE(0) !== 0x89504e47 || buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
};

for (const slug of order) {
  const cell = graph.cells?.[slug];
  const surface = surfaces.surfaces?.[slug];
  if (!cell || surface?.type !== 'cell' || !cell.url?.startsWith('/')) continue;
  for (const locale of ['ru', 'en']) {
    const file = path.join(root, 'data/previews', `${slug}.${locale}.png`);
    if (!fs.existsSync(file)) { failures.push(`missing preview: ${slug}.${locale}.png`); continue; }
    const size = pngSize(file);
    if (!size || size.width < 320 || size.height < 180) failures.push(`invalid preview dimensions: ${slug}.${locale}.png`);
    else if (Math.abs(size.width / size.height - 16 / 9) > 0.03) failures.push(`preview is not 16:9: ${slug}.${locale}.png (${size.width}x${size.height})`);
  }
}

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`preview check OK: ${order.length} catalog entries inspected`);
