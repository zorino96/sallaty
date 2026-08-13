#!/usr/bin/env node
// Builds the iOS adhan notification sounds from the Android res/raw MP3s.
//
// iOS will only play a *notification* sound that is bundled in the app, at most
// 30 seconds long, and encoded as Linear PCM / MA4(IMA-ADPCM) / µLaw / aLaw in
// a .caf, .aiff or .wav container. That 30s ceiling is an iOS limit we cannot
// work around — Android plays the adhan in full, iOS gets the first half-minute
// with a fade so it doesn't cut off mid-word. See docs/ios-setup.md.
//
// Output: ios/App/App/Sounds/adhan_*.caf, named to match the Android res/raw
// base names so src/lib/notifications.ts can use `${base}.caf`.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const SRC = 'android/app/src/main/res/raw';
const OUT = 'ios/App/App/Sounds';

const LIMIT = 30;      // iOS hard cap, seconds
const FADE = 1.5;      // fade-out tail so the truncation isn't abrupt

if (!existsSync(SRC)) {
  console.error(`${SRC} not found.`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const sources = readdirSync(SRC).filter((f) => f.endsWith('.mp3')).sort();
if (!sources.length) {
  console.error(`No .mp3 files in ${SRC}.`);
  process.exit(1);
}

for (const file of sources) {
  const out = join(OUT, file.replace(/\.mp3$/, '.caf'));
  execFileSync(ffmpeg, [
    '-y', '-loglevel', 'error',
    '-i', join(SRC, file),
    '-t', String(LIMIT),
    '-af', `afade=t=out:st=${LIMIT - FADE}:d=${FADE}`,
    '-ac', '1',                     // mono — it's a notification, not music
    '-ar', '22050',
    '-c:a', 'adpcm_ima_qt',         // "MA4", one of iOS's accepted encodings
    out,
  ]);
  console.log(`  ${out}  ${Math.round(statSync(out).size / 1024)} KB`);
}

console.log(`\n${sources.length} sounds written to ${OUT}/ (≤${LIMIT}s, IMA4 mono)`);
