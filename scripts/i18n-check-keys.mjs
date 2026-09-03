#!/usr/bin/env node
/**
 * Compare locale JSON keys against en.json (deep key paths).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const i18nDir = path.join(__dirname, '../data/i18n');

function collectKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) keys.push(...collectKeys(v, p));
    else keys.push(p);
  }
  return keys;
}

const en = JSON.parse(fs.readFileSync(path.join(i18nDir, 'en.json'), 'utf8'));
const baseKeys = new Set(collectKeys(en));
const locales = fs
  .readdirSync(i18nDir)
  .filter((f) => f.endsWith('.json') && f !== 'locales.json' && f !== 'en.json');

let failed = false;
for (const file of locales) {
  const data = JSON.parse(fs.readFileSync(path.join(i18nDir, file), 'utf8'));
  const keys = new Set(collectKeys(data));
  for (const k of baseKeys) {
    if (!keys.has(k)) {
      console.error(`${file}: missing key ${k}`);
      failed = true;
    }
  }
  for (const k of keys) {
    if (!baseKeys.has(k)) {
      console.error(`${file}: extra key ${k}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('i18n keys OK for', locales.length, 'locales');
