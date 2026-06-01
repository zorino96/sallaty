#!/usr/bin/env node
// One-shot APK build: next export → cap sync → gradle assembleDebug → copy to repo root.
// Cross-platform (Windows / macOS / Linux). Auto-detects JDK + Android SDK from env.

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const ANDROID_DIR = join(ROOT, 'android');
const AUDIO_DIR = join(ROOT, 'public', 'audio');
const RAW_DIR = join(ANDROID_DIR, 'app', 'src', 'main', 'res', 'raw');
const APK_SRC = join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const APK_DEST = join(ROOT, 'sallaty-debug.apk');

// Copy adhan MP3s into res/raw with Android-safe names (adhan-aqib.mp3 →
// adhan_aqib.mp3) so they can be used as notification-channel sounds.
function syncAdhanSounds() {
  if (!existsSync(AUDIO_DIR)) return;
  mkdirSync(RAW_DIR, { recursive: true });
  for (const f of readdirSync(AUDIO_DIR)) {
    if (!f.startsWith('adhan-') || !f.endsWith('.mp3')) continue;
    const dest = f.replace(/-/g, '_'); // adhan-aqib.mp3 → adhan_aqib.mp3
    copyFileSync(join(AUDIO_DIR, f), join(RAW_DIR, dest));
    console.log(`  raw sound: ${dest}`);
  }
}

const isWin = process.platform === 'win32';

function step(label) {
  console.log(`\n▸ ${label}`);
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: isWin,
    cwd: ROOT,
    ...opts,
  });
  if (result.status !== 0) {
    console.error(`\n✖ ${cmd} ${args.join(' ')} exited with code ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

// 1) Next.js static export
step('next build (static export → out/)');
run('npx', ['next', 'build']);

// 2) Capacitor sync (copies out/ into android/app/src/main/assets/public)
step('cap sync android');
run('npx', ['cap', 'sync', 'android']);

// 2b) Copy adhan sounds into res/raw for native notification playback
step('sync adhan sounds → res/raw');
syncAdhanSounds();

// 3) Gradle assembleDebug
step('gradle assembleDebug');
// On Windows we have to use the .\ prefix because cmd.exe doesn't search the cwd.
const gradlew = isWin ? '.\\gradlew.bat' : './gradlew';
run(gradlew, ['assembleDebug', '--no-daemon'], { cwd: ANDROID_DIR });

// 4) Copy the artifact next to the project so the user can grab it easily
step('copy APK → sallaty-debug.apk');
if (!existsSync(APK_SRC)) {
  console.error(`✖ Expected APK at ${APK_SRC} but it was not produced.`);
  process.exit(1);
}
copyFileSync(APK_SRC, APK_DEST);
console.log(`\n✔ APK ready: ${APK_DEST}`);
