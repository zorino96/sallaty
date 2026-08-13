#!/usr/bin/env node
// Generates the Google Play "feature graphic" (1024x500) from the app's own
// brand marks, so the store banner matches the launcher icon exactly.
// Output: store/feature-graphic.png
//
// Note: Play's feature graphic must carry no device frames and no claims of
// awards/ratings — it is pure branding, which is what this draws.

import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

mkdirSync('store', { recursive: true });

// The mosque mark, lifted from public/icon.svg and re-centred for the banner.
const MOSQUE = `
  <g transform="translate(232 250) scale(0.62) translate(-256 -260)">
    <g fill="#D4AF6A" opacity="0.15" transform="translate(256 210)">
      <polygon points="0,-168 38,-38 168,0 38,38 0,168 -38,38 -168,0 -38,-38"/>
      <polygon points="0,-168 38,-38 168,0 38,38 0,168 -38,38 -168,0 -38,-38" transform="rotate(45)"/>
    </g>
    <g fill="url(#gold)">
      <rect x="120" y="250" width="26" height="150" rx="6"/>
      <path d="M120 254 q13 -30 26 0 Z"/>
      <circle cx="133" cy="212" r="20"/>
      <path d="M133 178 l5 26 h-10 Z"/>
      <rect x="118" y="300" width="30" height="6" opacity="0.6"/>
      <rect x="118" y="340" width="30" height="6" opacity="0.6"/>
    </g>
    <g fill="url(#gold)">
      <rect x="366" y="250" width="26" height="150" rx="6"/>
      <path d="M366 254 q13 -30 26 0 Z"/>
      <circle cx="379" cy="212" r="20"/>
      <path d="M379 178 l5 26 h-10 Z"/>
      <rect x="364" y="300" width="30" height="6" opacity="0.6"/>
      <rect x="364" y="340" width="30" height="6" opacity="0.6"/>
    </g>
    <path d="M176 300 C 176 214 206 150 256 104 C 306 150 336 214 336 300 Z" fill="url(#gold)"/>
    <g transform="translate(256 86)">
      <circle cx="0" cy="0" r="20" fill="url(#gold)"/>
      <circle cx="7" cy="-3" r="16" fill="#0E2421"/>
    </g>
    <rect x="168" y="300" width="176" height="118" rx="10" fill="url(#gold)"/>
    <path d="M236 418 v-58 a20 20 0 0 1 40 0 v58 Z" fill="#0E2421"/>
    <path d="M188 418 v-34 a13 13 0 0 1 26 0 v34 Z" fill="#0E2421" opacity="0.9"/>
    <path d="M298 418 v-34 a13 13 0 0 1 26 0 v34 Z" fill="#0E2421" opacity="0.9"/>
    <rect x="150" y="418" width="212" height="20" rx="8" fill="url(#gold)"/>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#15332E"/>
      <stop offset="100%" stop-color="#0E2421"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E7C77E"/>
      <stop offset="55%" stop-color="#D4AF6A"/>
      <stop offset="100%" stop-color="#B8923F"/>
    </linearGradient>
    <radialGradient id="halo" cx="24%" cy="45%" r="42%">
      <stop offset="0%" stop-color="#F0D89A" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#F0D89A" stop-opacity="0"/>
    </radialGradient>
    <pattern id="girih" width="86" height="86" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#D4AF6A" stroke-opacity="0.10" stroke-width="1.4">
        <polygon points="43,4 60,26 82,43 60,60 43,82 26,60 4,43 26,26"/>
        <circle cx="43" cy="43" r="15"/>
      </g>
    </pattern>
  </defs>

  <rect width="1024" height="500" fill="url(#bg)"/>
  <rect width="1024" height="500" fill="url(#girih)"/>
  <rect width="1024" height="500" fill="url(#halo)"/>

  ${MOSQUE}

  <!-- hairline rule between mark and wordmark -->
  <rect x="392" y="150" width="1.5" height="200" fill="#D4AF6A" opacity="0.28"/>

  <text x="440" y="212" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="86"
        font-weight="700" fill="url(#gold)">سەڵاتی</text>
  <text x="440" y="272" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="40"
        font-weight="600" fill="#F4ECD8" opacity="0.95">Sallaty</text>
  <text x="440" y="326" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="27"
        fill="#F4ECD8" opacity="0.72">Prayer times · Adhan · Quran · Qibla</text>
  <text x="440" y="366" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="24"
        fill="#D4AF6A" opacity="0.85">کاتی نوێژ · بانگ · قورئان · قیبلە</text>
</svg>`;

writeFileSync('store/feature-graphic.svg', svg);
await sharp(Buffer.from(svg)).png().toFile('store/feature-graphic.png');

const meta = await sharp('store/feature-graphic.png').metadata();
console.log(`feature-graphic.png → ${meta.width}x${meta.height} (Play requires exactly 1024x500)`);
