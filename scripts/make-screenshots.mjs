#!/usr/bin/env node
// Captures Play Store phone screenshots from the real running app.
//
// Serves the PRODUCTION static export (out/) on a throwaway port and shoots it,
// so the Next.js dev-tools badge never appears in a store screenshot.
// Run `next build` first. Output: store/screenshot-1..N.png at 1080x2160.
//
// These are genuine screenshots of the app's own UI — no mock-ups, no device
// frames, nothing Play's metadata policy forbids.

import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const ROOT = 'out';
if (!existsSync(ROOT)) {
  console.error('out/ not found — run `npx next build` first.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.mp3': 'audio/mpeg', '.ico': 'image/x-icon',
};

// Static file server with Next-export routing (/x → out/x.html or out/x/index.html).
const server = createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const rel = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const candidates = [
    join(ROOT, rel),
    join(ROOT, rel, 'index.html'),
    join(ROOT, rel + '.html'),
  ];
  const file = candidates.find((f) => existsSync(f) && statSync(f).isFile());
  if (!file) { res.statusCode = 404; res.end('not found'); return; }
  res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(res);
});

const PORT = 4599;
await new Promise((r) => server.listen(PORT, r));
const BASE = `http://localhost:${PORT}`;

// Pages worth showing a first-time visitor, in store order.
const SHOTS = [
  { path: '/', name: 'home', settle: 2500 },
  { path: '/quran', name: 'quran', settle: 1800 },
  { path: '/quran/1', name: 'surah', settle: 1800 },
  { path: '/qibla', name: 'qibla', settle: 1800 },
  { path: '/adhkar', name: 'adhkar', settle: 1500 },
  { path: '/habits', name: 'habits', settle: 1500 },
  { path: '/settings', name: 'settings', settle: 1500 },
];

// Each store wants its own canvas. Play takes any 16:9-ish phone size; Apple
// insists on an exact iPhone 6.9" frame, so we shoot that viewport natively
// rather than upscaling the Play shots and shipping something blurry.
const TARGETS = {
  play: { dir: 'store', viewport: { width: 360, height: 640 } },       // → 1080x1920
  ios: { dir: 'store/ios', viewport: { width: 430, height: 932 } },    // → 1290x2796, 6.9"
  'ios65': { dir: 'store/ios-65', viewport: { width: 414, height: 896 } }, // → 1242x2688, 6.5"
};

const targetName = process.argv.includes('--ios65') ? 'ios65'
  : process.argv.includes('--ios') ? 'ios'
  : 'play';
const target = TARGETS[targetName];
const OUT_DIR = target.dir;

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: target.viewport,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: 'ckb-IQ',
  colorScheme: 'dark',
});
// Show the app the way a properly set-up install looks (notifications allowed),
// rather than a browser's default "denied" state.
await ctx.grantPermissions(['notifications'], { origin: BASE });
const page = await ctx.newPage();

// Pretend onboarding/guide are done so we land on the real app, not the intro.
await page.addInitScript(() => {
  localStorage.setItem('selati.onboarded', 'true');
  localStorage.setItem('selati.guideSeen', 'true');
  // Show the app as it looks once the user has allowed notifications — the
  // normal, set-up state — instead of a bare browser's "denied".
  localStorage.setItem('selati.notifEnabled', 'true');
  try {
    Object.defineProperty(Notification, 'permission', { get: () => 'granted' });
  } catch { /* ignore */ }
  // Sulaymaniyah — a real covered city, so times/name look right in the shots.
  localStorage.setItem('selati.coords', JSON.stringify({ lat: 35.561, lng: 45.437 }));
  localStorage.setItem('selati.city', JSON.stringify('سلێمانی'));
  localStorage.setItem('selati.selectedCity', JSON.stringify('sulaymaniyah'));
});

let n = 0;
for (const shot of SHOTS) {
  await page.goto(BASE + shot.path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(shot.settle);
  n += 1;
  const file = `${OUT_DIR}/screenshot-${n}-${shot.name}.png`;
  await page.screenshot({ path: file });
  console.log(`  ${file}`);
}

await browser.close();
server.close();
const { width, height } = target.viewport;
console.log(`\n${n} screenshots written to ${OUT_DIR}/ (${width * 3}x${height * 3}, ${targetName})`);
