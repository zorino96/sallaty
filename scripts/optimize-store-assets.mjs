#!/usr/bin/env node
// Shrinks the Play Store assets so they can be injected into the Play Console
// page as base64 (the only upload route available in this environment).
// Quality is kept high enough for the store: the icon stays a lossless 512²
// PNG, the feature graphic keeps its exact 1024x500, screenshots become JPEGs
// well above Play's 320px minimum.

import { mkdirSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import sharp from 'sharp';

mkdirSync('store/min', { recursive: true });
const kb = (f) => Math.round(statSync(f).size / 1024);

// App icon — must stay exactly 512x512 PNG. Palette-quantise for size.
await sharp('public/icon-512.png')
  .resize(512, 512)
  .png({ palette: true, quality: 90, effort: 10 })
  .toFile('store/min/icon-512.png');
console.log(`icon-512.png        ${kb('store/min/icon-512.png')} KB`);

// Feature graphic — must stay exactly 1024x500.
await sharp('store/feature-graphic.png')
  .png({ palette: true, quality: 90, effort: 10 })
  .toFile('store/min/feature-graphic.png');
console.log(`feature-graphic.png ${kb('store/min/feature-graphic.png')} KB`);

// Screenshots — JPEG at 540x1080 (Play allows 320–3840px; 9:18 keeps the ratio).
const shots = (await readdir('store')).filter((f) => /^screenshot-\d/.test(f)).sort();
for (const f of shots) {
  const out = `store/min/${f.replace(/\.png$/, '.jpg')}`;
  await sharp(`store/${f}`).resize(540, 1080).jpeg({ quality: 74, mozjpeg: true }).toFile(out);
  console.log(`${f.padEnd(28)} → ${kb(out)} KB`);
}
