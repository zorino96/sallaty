#!/usr/bin/env node
// Lays the ad previews out as one contact sheet, so the placement can be judged
// across every screen at once rather than by flicking between files.
// Run scripts/preview-ads.mjs first.

import { existsSync } from 'node:fs';
import sharp from 'sharp';

const SHOTS = [
  { file: 'store/ad-preview/home-bottom.png', label: 'HOME  (already had an ad)' },
  { file: 'store/ad-preview/quran-surah-bottom.png', label: 'SURAH' },
  { file: 'store/ad-preview/quran-index-bottom.png', label: 'QURAN' },
  { file: 'store/ad-preview/adhkar-bottom.png', label: 'ADHKAR' },
  { file: 'store/ad-preview/dhikr-bottom.png', label: 'DHIKR' },
  { file: 'store/ad-preview/qibla-bottom.png', label: 'QIBLA' },
];

const missing = SHOTS.filter((s) => !existsSync(s.file));
if (missing.length) {
  console.error('Missing previews — run `node scripts/preview-ads.mjs` first:');
  for (const m of missing) console.error('  ' + m.file);
  process.exit(1);
}

const W = 360;              // per-phone width in the sheet
const GAP = 20;
const LABEL_H = 34;
const PAD = 24;

const first = await sharp(SHOTS[0].file).metadata();
const H = Math.round((first.height / first.width) * W);

const sheetW = PAD * 2 + SHOTS.length * W + (SHOTS.length - 1) * GAP;
const sheetH = PAD * 2 + LABEL_H + H;

const layers = [];
for (const [i, s] of SHOTS.entries()) {
  const x = PAD + i * (W + GAP);
  layers.push({
    input: await sharp(s.file).resize(W).png().toBuffer(),
    left: x,
    top: PAD + LABEL_H,
  });
  layers.push({
    input: Buffer.from(
      `<svg width="${W}" height="${LABEL_H}">
         <text x="${W / 2}" y="22" text-anchor="middle"
               font-family="system-ui,-apple-system,sans-serif"
               font-size="15" font-weight="600" letter-spacing="1.5"
               fill="#3c4043">${s.label}</text>
       </svg>`,
    ),
    left: x,
    top: PAD,
  });
}

await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#ffffff' } })
  .composite(layers)
  .png({ compressionLevel: 9 })
  .toFile('store/ad-preview/sheet.png');

console.log(`store/ad-preview/sheet.png  ${sheetW}x${sheetH}`);
