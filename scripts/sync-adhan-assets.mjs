#!/usr/bin/env node
// Mirrors public/audio/adhan-*.mp3 into the two places the native layers read
// from, then rebuilds the iOS .caf set.
//
//   public/audio/adhan-doha-fajr.mp3          ← the one source of truth
//     → android/app/src/main/res/raw/adhan_doha_fajr.mp3
//     → ios/App/App/Sounds/adhan_doha_fajr.caf   (≤30s, via make-ios-sounds)
//
// Why this exists: `soundBase()` in src/lib/notifications.ts turns an adhan id
// into a bare base name and hands it to the native scheduler. Nothing checks
// that a file of that name is actually bundled. If it is missing, Android falls
// back to the device's default alarm tone and iOS plays nothing — at prayer
// time, silently, with the user's chosen adhan still shown in Settings. Copying
// by hand is how that happens, so it is scripted instead.
//
// Android resource names allow only [a-z0-9_], hence the dash → underscore.
//
//   npm run adhan:sync

import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'public/audio';
const RAW = 'android/app/src/main/res/raw';

if (!existsSync(SRC)) {
  console.error(`${SRC} not found.`);
  process.exit(1);
}
mkdirSync(RAW, { recursive: true });

const sources = readdirSync(SRC).filter((f) => /^adhan-.*\.mp3$/.test(f)).sort();
if (!sources.length) {
  console.error(`No adhan-*.mp3 in ${SRC}.`);
  process.exit(1);
}

let copied = 0;
for (const file of sources) {
  const base = file.replace(/\.mp3$/, '').replace(/-/g, '_');
  if (!/^[a-z0-9_]+$/.test(base)) {
    console.error(`  "${file}" → "${base}" is not a legal Android resource name.`);
    process.exit(1);
  }
  const dest = join(RAW, `${base}.mp3`);
  copyFileSync(join(SRC, file), dest);
  console.log(`  ${file.padEnd(26)} → ${dest}  ${(statSync(dest).size / 1048576).toFixed(2)} MB`);
  copied++;
}

// Anything left in res/raw that no longer has a source is dead weight in the
// AAB and, worse, a name soundBase() could still resolve to after the track was
// removed from the app.
const expected = new Set(sources.map((f) => f.replace(/\.mp3$/, '').replace(/-/g, '_') + '.mp3'));
const orphans = readdirSync(RAW).filter((f) => f.endsWith('.mp3') && !expected.has(f));
if (orphans.length) {
  console.warn(`\n  orphaned in ${RAW} (no matching source): ${orphans.join(', ')}`);
}

console.log(`\n${copied} file(s) synced. Building iOS sounds…\n`);
execFileSync(process.execPath, ['scripts/make-ios-sounds.mjs'], { stdio: 'inherit' });
