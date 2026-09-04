#!/usr/bin/env node

/* Deterministic preview pipeline. Requires the Playwright CLI on PATH. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const graph = JSON.parse(fs.readFileSync(path.join(root, 'data/graph.json'), 'utf8'));
const surfaces = JSON.parse(fs.readFileSync(path.join(root, 'data/surfaces.json'), 'utf8'));
const baseUrl = (process.env.MICR_PREVIEW_BASE_URL || 'http://127.0.0.1:4174').replace(/\/$/, '');
const outputDir = path.join(root, 'data/previews');
const locales = [
  { code: 'ru', browser: 'ru-RU' },
  { code: 'en', browser: 'en-US' }
];
const order = Array.isArray(surfaces.hubCatalog) ? surfaces.hubCatalog : Object.keys(graph.cells || {});
const localApps = order.filter(slug => graph.cells?.[slug]?.url?.startsWith('/') && surfaces.surfaces?.[slug]?.type === 'cell');

fs.mkdirSync(outputDir, { recursive: true });
for (const locale of locales) {
  for (const slug of localApps) {
    const target = path.join(outputDir, `${slug}.${locale.code}.png`);
    const url = `${baseUrl}${graph.cells[slug].url}?preview=1&lang=${locale.code}`;
    const result = spawnSync('playwright', [
      'screenshot', '--block-service-workers', '--color-scheme', 'dark',
      '--lang', locale.browser, '--viewport-size', '1280,720',
      '--wait-for-timeout', '900', url, target
    ], { cwd: root, stdio: 'inherit' });
    if (result.error || result.status !== 0) {
      throw new Error(`preview failed for ${slug}.${locale.code}: ${result.error?.message || `exit ${result.status}`}`);
    }
  }
}

console.log(`previews generated: ${localApps.length} apps × ${locales.length} locales at ${baseUrl}`);
