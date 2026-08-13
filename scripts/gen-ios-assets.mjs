#!/usr/bin/env node
// Render the brand SVGs into the iOS app icon and splash images.
//
// Two App Store rules drive the odd bits here: the 1024² marketing icon must
// have NO alpha channel (a transparent icon is rejected at upload), and it must
// have square corners — iOS applies its own mask, so a pre-rounded icon ends up
// double-rounded.

import sharp from 'sharp';
import { readFileSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const ASSETS = join(ROOT, 'assets');
const APP = join(ROOT, 'ios', 'App', 'App', 'Assets.xcassets');

const BRAND_BG = '#0E2421'; // same as capacitor.config.ts SplashScreen backgroundColor

const iconSvg = readFileSync(join(ASSETS, 'icon-full.svg'));
const kb = (f) => Math.round(statSync(f).size / 1024);

// The brand SVG rounds its own background plate (rx="112"). Squaring it off
// lets the gradient run to the edge, so iOS's own corner mask has something to
// cut into instead of double-rounding over a flat filler colour.
const squareIconSvg = Buffer.from(String(iconSvg).replace('rx="112"', 'rx="0"'));

// ---- App icon: 1024x1024, opaque, square corners -------------------------
mkdirSync(join(APP, 'AppIcon.appiconset'), { recursive: true });
const iconOut = join(APP, 'AppIcon.appiconset', 'AppIcon-512@2x.png');
await sharp(squareIconSvg, { density: 600 })
  .resize(1024, 1024, { fit: 'contain', background: BRAND_BG })
  .flatten({ background: BRAND_BG })   // drop alpha — App Store requires it
  .png({ compressionLevel: 9 })
  .toFile(iconOut);
console.log(`AppIcon-512@2x.png    1024x1024  ${kb(iconOut)} KB`);

// ---- Splash: 2732x2732 universal, logo centred on the brand background ----
// Capacitor's imageset expects the same square art for light, dark and
// universal; the launch screen crops it to whatever the device aspect is.
const LOGO = 900;
const logo = await sharp(iconSvg, { density: 600 })
  .resize(LOGO, LOGO, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const splash = await sharp({
  create: { width: 2732, height: 2732, channels: 3, background: BRAND_BG },
})
  .composite([{ input: logo, gravity: 'centre' }])
  .png({ compressionLevel: 9 })
  .toBuffer();

mkdirSync(join(APP, 'Splash.imageset'), { recursive: true });
for (const name of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
  const out = join(APP, 'Splash.imageset', name);
  await sharp(splash).toFile(out);
  console.log(`${name.padEnd(21)} 2732x2732  ${kb(out)} KB`);
}
