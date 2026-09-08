#!/usr/bin/env node
// Normalises a downloaded adhan recording into the shape the app ships.
//
// Everything bundled has to match, or the alarm is jarring: one track quiet and
// the next twice as loud is worse than either. So every source is put through
// the same pass — mono, one bitrate, one loudness target — regardless of how it
// arrived.
//
//   node scripts/prepare-adhan.mjs <src.mp3> <out-basename> [--bitrate 96k]
//
// Writes public/audio/<out-basename>.mp3. From there, `npm run adhan:sync`
// copies it into android/app/src/main/res/raw/ and builds the iOS .caf.
//
// Loudness: -16 LUFS is the streaming-ish target. Louder than that and a phone
// speaker distorts at alarm volume; quieter and the adhan is lost under traffic.
// Mono because it is an alarm on a phone speaker, not music.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const OUT_DIR = 'public/audio';
const LUFS = -16;

const [src, name, ...rest] = process.argv.slice(2);
if (!src || !name) {
  console.error('usage: node scripts/prepare-adhan.mjs <src.mp3> <out-basename> [--bitrate 96k]');
  process.exit(1);
}
if (!existsSync(src)) {
  console.error(`source not found: ${src}`);
  process.exit(1);
}

const bIdx = rest.indexOf('--bitrate');
const bitrate = bIdx >= 0 ? rest[bIdx + 1] : '96k';

mkdirSync(OUT_DIR, { recursive: true });
const out = join(OUT_DIR, `${name}.mp3`);

execFileSync(ffmpeg, [
  '-y', '-loglevel', 'error',
  '-i', src,
  // Two-pass-ish loudness in one go. `loudnorm` alone can pump on speech, so it
  // is followed by a gentle limiter rather than pushed hard on its own.
  '-af', `loudnorm=I=${LUFS}:TP=-1.5:LRA=11,alimiter=limit=0.95`,
  '-ac', '1',
  '-ar', '44100',
  '-b:a', bitrate,
  out,
]);

const kb = Math.round(statSync(out).size / 1024);
console.log(`  ${basename(src)}  →  ${out}   ${(kb / 1024).toFixed(2)} MB @ ${bitrate} mono`);
