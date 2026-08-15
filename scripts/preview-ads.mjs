#!/usr/bin/env node
// Renders what a banner would look like on the screens that are currently
// advert-free, so the placement can be judged by eye before the policy changes.
//
// Nothing here ships. It serves the production export, paints a stand-in for
// the native AdMob banner (which overlays the webview rather than sitting in
// the page), and shoots each screen at both possible positions.
//
// Output: store/ad-preview/<screen>-<top|bottom>.png

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

const server = createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const rel = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const file = [join(ROOT, rel), join(ROOT, rel, 'index.html'), join(ROOT, rel + '.html')]
    .find((f) => existsSync(f) && statSync(f).isFile());
  if (!file) { res.statusCode = 404; res.end('not found'); return; }
  res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(res);
});

const PORT = 4601;
await new Promise((r) => server.listen(PORT, r));
const BASE = `http://localhost:${PORT}`;

// The screens the current policy keeps clear, plus the home screen — which
// already carries a banner — so the two can be compared side by side.
const SCREENS = [
  { path: '/', name: 'home', label: 'سەرەکی (ئێستاش ڕیکلامی هەیە)' },
  { path: '/quran/1', name: 'quran-surah', label: 'سووڕەت' },
  { path: '/quran', name: 'quran-index', label: 'قورئان' },
  { path: '/adhkar', name: 'adhkar', label: 'ئەزکار' },
  { path: '/dhikr', name: 'dhikr', label: 'زیکر' },
  { path: '/qibla', name: 'qibla', label: 'قیبلە' },
];

const BANNER_H = 60;

mkdirSync('store/ad-preview', { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, // iPhone 14/15-ish
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'ckb-IQ',
});
await ctx.grantPermissions(['notifications'], { origin: BASE });

await ctx.addInitScript(() => {
  localStorage.setItem('selati.onboarded', 'true');
  localStorage.setItem('selati.guideSeen', 'true');
  localStorage.setItem('selati.notifEnabled', 'true');
  localStorage.setItem('selati.coords', JSON.stringify({ lat: 35.561, lng: 45.437 }));
  localStorage.setItem('selati.city', JSON.stringify('سلێمانی'));
  localStorage.setItem('selati.selectedCity', JSON.stringify('sulaymaniyah'));
});

const page = await ctx.newPage();

/** Paint a stand-in for the native banner and make the app reserve room for it. */
async function paintBanner(position) {
  await page.evaluate(({ pos, h }) => {
    document.getElementById('preview-banner')?.remove();
    document.body.classList.add('has-ad');
    if (pos === 'top') {
      // A top banner covers the header, so the page has to be pushed down.
      document.documentElement.style.setProperty('--ad-h', '0px');
      const frame = document.querySelector('.phone-frame');
      if (frame) frame.style.paddingTop = h + 'px';
    }
    const el = document.createElement('div');
    el.id = 'preview-banner';
    el.style.cssText = [
      'position:fixed', 'left:0', 'right:0', pos === 'top' ? 'top:0' : 'bottom:0',
      `height:${h}px`, 'z-index:2147483647',
      'background:#e8eaed', 'border-' + (pos === 'top' ? 'bottom' : 'top') + ':1px solid #c6c9ce',
      'display:flex', 'align-items:center', 'justify-content:space-between',
      'padding:0 12px', 'box-sizing:border-box',
      'font:13px -apple-system,system-ui,sans-serif', 'color:#3c4043', 'direction:ltr',
    ].join(';');
    el.innerHTML =
      '<span style="background:#fbbc04;color:#202124;font-size:10px;font-weight:700;' +
      'padding:1px 4px;border-radius:2px">Ad</span>' +
      '<span style="flex:1;text-align:center;opacity:.75">Google AdMob banner · 320×50</span>' +
      '<span style="opacity:.45;font-size:16px">ⓘ</span>';
    document.body.appendChild(el);
  }, { pos: position, h: BANNER_H });
  await page.waitForTimeout(250);
}

// `--both` also renders the top placement, for comparing the two positions.
const POSITIONS = process.argv.includes('--both') ? ['bottom', 'top'] : ['bottom'];

let n = 0;
for (const s of SCREENS) {
  for (const pos of POSITIONS) {
    await page.goto(BASE + s.path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await paintBanner(pos);
    const file = `store/ad-preview/${s.name}-${pos}.png`;
    await page.screenshot({ path: file });
    console.log(`  ${file}`);
    n += 1;
  }
}

await browser.close();
server.close();
console.log(`\n${n} previews written to store/ad-preview/`);
