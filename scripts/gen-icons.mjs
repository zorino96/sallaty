#!/usr/bin/env node
// Render the brand SVGs into every Android launcher / notification icon size
// using `sharp` (already present as a Next.js transitive dependency).

import sharp from 'sharp';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const ASSETS = join(ROOT, 'assets');
const RES = join(ROOT, 'android', 'app', 'src', 'main', 'res');

const fullSvg = readFileSync(join(ASSETS, 'icon-full.svg'));
const fgSvg = readFileSync(join(ASSETS, 'icon-foreground.svg'));
const notifSvg = readFileSync(join(ASSETS, 'icon-notification.svg'));

// density → legacy launcher px / adaptive foreground px / notification px
const DENSITIES = {
  'mdpi':    { launcher: 48,  fg: 108, notif: 24 },
  'hdpi':    { launcher: 72,  fg: 162, notif: 36 },
  'xhdpi':   { launcher: 96,  fg: 216, notif: 48 },
  'xxhdpi':  { launcher: 144, fg: 324, notif: 72 },
  'xxxhdpi': { launcher: 192, fg: 432, notif: 96 },
};

async function png(svg, size) {
  return sharp(svg, { density: 384 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

// Round legacy icon: mask the full icon with a circle.
async function roundPng(svg, size) {
  const base = await png(svg, size);
  const circle = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );
  return sharp(base).composite([{ input: circle, blend: 'dest-in' }]).png().toBuffer();
}

for (const [density, sz] of Object.entries(DENSITIES)) {
  const dir = join(RES, `mipmap-${density}`);
  mkdirSync(dir, { recursive: true });

  writeFileSync(join(dir, 'ic_launcher.png'), await png(fullSvg, sz.launcher));
  writeFileSync(join(dir, 'ic_launcher_round.png'), await roundPng(fullSvg, sz.launcher));
  writeFileSync(join(dir, 'ic_launcher_foreground.png'), await png(fgSvg, sz.fg));

  // notification small icon
  const drawableDir = join(RES, `drawable-${density}`);
  mkdirSync(drawableDir, { recursive: true });
  writeFileSync(join(drawableDir, 'ic_stat_icon.png'), await png(notifSvg, sz.notif));

  console.log(`✓ mipmap-${density}: launcher ${sz.launcher}px, fg ${sz.fg}px, notif ${sz.notif}px`);
}

// Play-store / PWA master icon
writeFileSync(join(ROOT, 'public', 'icon-512.png'), await png(fullSvg, 512));
console.log('✓ public/icon-512.png (512px master)');

console.log('\nAll icons regenerated.');
