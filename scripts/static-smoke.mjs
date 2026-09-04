#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'index.html',
  'manifest.json',
  'sw.js',
  'data/graph.json',
  'data/surfaces.json',
  'data/i18n/en.json',
  'infra/deploy.sh',
  'server/api/index.js',
  'cells/knowledge/laziness/index.html',
  'cells/tools/mask-clock/index.html',
  'cells/games/index.html',
  'cells/tools/index.html',
  'cells/experiments/index.html',
  'cells/knowledge/index.html',
  'data/js/micr-shell.js',
  'data/styles/micr-shell.css',
  'scripts/generate-previews.mjs',
  'scripts/preview-check.mjs'
];

const failures = [];
for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) failures.push(`missing required file: ${relative}`);
}

function readJson(relative) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
  } catch (error) {
    failures.push(`invalid JSON: ${relative} (${error.message})`);
    return null;
  }
}

const graph = readJson('data/graph.json');
const surfaces = readJson('data/surfaces.json');
if (graph?.cells && surfaces?.surfaces) {
  for (const slug of Object.keys(graph.cells)) {
    if (!surfaces.surfaces[slug]) failures.push(`graph cell has no surface entry: ${slug}`);
    const cell = graph.cells[slug];
    if (cell.url?.startsWith('/') && surfaces.surfaces[slug]?.type === 'cell') {
      const canonical = path.join(root, 'cells', cell.category, slug, 'index.html');
      if (!fs.existsSync(canonical)) failures.push(`missing canonical cell page: ${slug}`);
    }
  }
}

const hub = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of hub.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  const reference = match[1];
  if (/^(?:https?:|data:|mailto:|#|javascript:)/i.test(reference) || reference.includes('${')) continue;
  const clean = reference.split(/[?#]/, 1)[0];
  const relative = clean.replace(/^\//, '');
  if (!relative) continue;
  const candidate = path.join(root, relative);
  if (!fs.existsSync(candidate)) failures.push(`broken hub asset reference: ${reference}`);
}

const lazinessRoute = path.join(root, 'laziness');
if (fs.existsSync(lazinessRoute)) {
  const routeStat = fs.lstatSync(lazinessRoute);
  if (routeStat.isSymbolicLink()) {
    const lazinessLink = fs.readlinkSync(lazinessRoute);
    const expected = path.resolve(root, 'cells/knowledge/laziness');
    const resolved = path.resolve(path.dirname(lazinessRoute), lazinessLink);
    if (resolved !== expected && fs.realpathSync(lazinessRoute) !== expected) {
      failures.push(`unexpected laziness route target: ${lazinessLink}`);
    }
  } else {
    const lazinessLink = fs.readFileSync(lazinessRoute, 'utf8').trim();
    if (lazinessLink !== 'cells/knowledge/laziness') {
      failures.push(`unexpected laziness route target: ${lazinessLink}`);
    }
  }
} else if (!fs.existsSync(path.join(root, 'cells/knowledge/laziness/index.html'))) {
  failures.push('missing laziness route and canonical cell page');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`static smoke OK: ${required.length} required files, ${Object.keys(graph?.cells ?? {}).length} graph cells`);
