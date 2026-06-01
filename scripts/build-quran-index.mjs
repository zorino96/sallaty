#!/usr/bin/env node
// Build a single compact full-text search index from the per-surah Quran JSON.
// Output: public/quran/search-index.json — an array of [surah, ayah, arabic, kurdish].
// Bundled into the static export so search is 100% offline, no API, no backend.
// Re-run only when the underlying Quran data changes: `node scripts/build-quran-index.mjs`.

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const AR_DIR = join(ROOT, 'public', 'quran', 'ar');
const KU_DIR = join(ROOT, 'public', 'quran', 'ku');
const OUT = join(ROOT, 'public', 'quran', 'search-index.json');

const entries = [];
let missing = 0;

for (let n = 1; n <= 114; n += 1) {
  const arPath = join(AR_DIR, `${n}.json`);
  if (!existsSync(arPath)) { missing += 1; continue; }
  const ar = JSON.parse(readFileSync(arPath, 'utf8'));

  let kuByN = new Map();
  const kuPath = join(KU_DIR, `${n}.json`);
  if (existsSync(kuPath)) {
    const ku = JSON.parse(readFileSync(kuPath, 'utf8'));
    for (const a of ku.ayahs ?? []) kuByN.set(a.n, a.t);
  }

  for (const a of ar.ayahs ?? []) {
    entries.push([n, a.n, a.t ?? '', kuByN.get(a.n) ?? '']);
  }
}

writeFileSync(OUT, JSON.stringify(entries));
const kb = statSync(OUT).size / 1024;
console.log(`✔ search-index.json — ${entries.length} ayat, ${kb.toFixed(0)} KB${missing ? `, ${missing} surah(s) missing` : ''}`);
