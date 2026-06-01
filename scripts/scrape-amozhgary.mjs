// scripts/scrape-amozhgary.mjs
//
// Scraper for the Kurdish prayer-times site amozhgary.tv.
//
// URL pattern:  https://amozhgary.tv/bang/<CitySlug>?month=<1..12>
// Each page = ONE full Gregorian month of daily prayer times for that city,
// rendered as an HTML <table> with one row per day.
//
// NOTE on the `month` query param (verified by inspecting live pages):
//   param 2..11 -> Gregorian month 2..11 (identity)
//   param 1     -> Gregorian December (12)
//   param 12    -> Gregorian January  (1)
// The param mapping is quirky, so instead of trusting it we parse the REAL
// Gregorian month from each row's date cell ("DD - <Kurdish month> - 2026")
// and key the output by that. Iterating param 1..12 still covers all 12 months.
//
// Table columns (9 <td> per row):
//   0: weekday + hijri (mobile)        -- ignored
//   1: gregorian date "DD - <ku> - YYYY"  -- day number + month source
//   2: hijri date                      -- ignored
//   3: بەیانی    Fajr
//   4: خۆرهەڵاتن Sunrise
//   5: نیوەڕۆ    Dhuhr
//   6: عەسر      Asr
//   7: مەغریب    Maghrib
//   8: عیشاء     Isha
//
// Times on the site are 12-hour WITHOUT am/pm. Conversion to 24h:
//   Fajr, Sunrise : morning, keep as-is.
//   Dhuhr         : always 11:xx or 12:xx already -> keep as-is.
//   Asr/Maghrib/Isha : always PM -> if hour is 1..11 add 12, if 12 keep.
// (Cross-checked against the today-card which prints labelled values:
//  Asr 03:45->15:45, Maghrib 07:15->19:15, Isha 08:35->20:35, Dhuhr 12:02 kept.)

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const execFileP = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'bang');
const YEAR = 2026;
const BASE = 'https://amozhgary.tv/bang';
const DELAY_MS = 150;

// ---------------------------------------------------------------------------
// City list: URL slug (as used on the site) + ascii output slug + lat/lng.
// nameKu (Kurdish display name) is read live from each page header; the value
// here is a fallback only.
// ---------------------------------------------------------------------------
const CITIES = [
  { url: 'Akre',            slug: 'akre',            lat: 36.741, lng: 43.890, nameKu: 'ئاکرێ' },
  { url: 'Al Qayyarah',     slug: 'al-qayyarah',     lat: 35.795, lng: 43.236, nameKu: 'گەیارە' },
  { url: 'Al Shirqat',      slug: 'al-shirqat',      lat: 35.461, lng: 43.262, nameKu: 'شرقات' },
  { url: 'Al-Fallujah',     slug: 'al-fallujah',     lat: 33.349, lng: 43.769, nameKu: 'فەلوجە' },
  { url: 'Al-Hamdaniya',    slug: 'al-hamdaniya',    lat: 36.271, lng: 43.378, nameKu: 'حەمدانیە' },
  { url: 'Al-Nukhib',       slug: 'al-nukhib',       lat: 32.043, lng: 42.249, nameKu: 'نوخێب' },
  { url: 'Al-Shikhan',      slug: 'al-shikhan',      lat: 36.694, lng: 43.355, nameKu: 'شێخان' },
  { url: 'Baghdad',         slug: 'baghdad',         lat: 33.315, lng: 44.366, nameKu: 'بەغدا' },
  { url: 'Bardarash',       slug: 'bardarash',       lat: 36.510, lng: 43.594, nameKu: 'بەردەڕەش' },
  { url: 'Basrah',          slug: 'basrah',          lat: 30.508, lng: 47.783, nameKu: 'بەسرە' },
  { url: 'Chamchamal',      slug: 'chamchamal',      lat: 35.530, lng: 44.835, nameKu: 'چەمچەماڵ' },
  { url: 'Daquq',           slug: 'daquq',           lat: 35.130, lng: 44.430, nameKu: 'داقوق' },
  { url: 'Darbandikhan',    slug: 'darbandikhan',    lat: 35.112, lng: 45.704, nameKu: 'دەربەندیخان' },
  { url: 'Diwaniyah',       slug: 'diwaniyah',       lat: 31.993, lng: 44.924, nameKu: 'دیوانیە' },
  { url: 'Dokan',           slug: 'dokan',           lat: 35.952, lng: 44.957, nameKu: 'دۆکان' },
  { url: 'Duhok',           slug: 'duhok',           lat: 36.867, lng: 42.989, nameKu: 'دهۆک' },
  { url: 'Erbil',           slug: 'erbil',           lat: 36.191, lng: 44.009, nameKu: 'هەولێر' },
  { url: 'Hadithah',        slug: 'hadithah',        lat: 34.137, lng: 42.378, nameKu: 'حەدیسە' },
  { url: 'Halabja',         slug: 'halabja',         lat: 35.177, lng: 45.986, nameKu: 'هەڵەبجە' },
  { url: 'Hillah',          slug: 'hillah',          lat: 32.483, lng: 44.435, nameKu: 'حیللە' },
  { url: 'Jalawla',         slug: 'jalawla',         lat: 34.273, lng: 45.165, nameKu: 'جەلەولا' },
  { url: 'Kalar',           slug: 'kalar',           lat: 34.628, lng: 45.318, nameKu: 'کەلار' },
  { url: 'Karbala',         slug: 'karbala',         lat: 32.616, lng: 44.025, nameKu: 'کەربەلا' },
  { url: 'Khalis',          slug: 'khalis',          lat: 33.825, lng: 44.530, nameKu: 'خاڵس' },
  { url: 'Khanaqin',        slug: 'khanaqin',        lat: 34.348, lng: 45.386, nameKu: 'خانەقین' },
  { url: 'Kifri',           slug: 'kifri',           lat: 34.692, lng: 44.965, nameKu: 'کفری' },
  { url: 'Kirkuk',          slug: 'kirkuk',          lat: 35.468, lng: 44.392, nameKu: 'کەرکووک' },
  { url: 'Koysinjaq',       slug: 'koysinjaq',       lat: 36.082, lng: 44.625, nameKu: 'کۆیە' },
  { url: 'Kut',             slug: 'kut',             lat: 32.512, lng: 45.818, nameKu: 'کووت' },
  { url: 'Madain',          slug: 'madain',          lat: 33.110, lng: 44.560, nameKu: 'مەدائن' },
  { url: 'Makhmur',         slug: 'makhmur',         lat: 35.776, lng: 43.580, nameKu: 'مەخموور' },
  { url: 'Mandali',         slug: 'mandali',         lat: 33.745, lng: 45.548, nameKu: 'مەندەلی' },
  { url: 'Miqdadiyah',      slug: 'miqdadiyah',      lat: 33.978, lng: 44.937, nameKu: 'مقدادیە' },
  { url: 'Mosul',           slug: 'mosul',           lat: 36.335, lng: 43.119, nameKu: 'موسڵ' },
  { url: 'Najaf',           slug: 'najaf',           lat: 31.999, lng: 44.328, nameKu: 'نەجەف' },
  { url: 'Numaniyah',       slug: 'numaniyah',       lat: 32.535, lng: 45.394, nameKu: 'نعمانیە' },
  { url: 'Penjwen',         slug: 'penjwen',         lat: 35.621, lng: 45.954, nameKu: 'پێنجوێن' },
  { url: "Qa'im",           slug: 'qaim',            lat: 34.378, lng: 41.103, nameKu: 'قائم' },
  { url: 'Qaladiza',        slug: 'qaladiza',        lat: 36.180, lng: 45.128, nameKu: 'قەڵادزێ' },
  { url: 'Qara Hanjir',     slug: 'qara-hanjir',     lat: 35.495, lng: 44.620, nameKu: 'قەره‌حەنجیر' },
  { url: 'Qasre',           slug: 'qasre',           lat: 36.756, lng: 44.290, nameKu: 'قەسرە' },
  { url: 'Qasrok',          slug: 'qasrok',          lat: 36.960, lng: 43.080, nameKu: 'قەسرۆک' },
  { url: 'Rabia',           slug: 'rabia',           lat: 36.812, lng: 42.108, nameKu: 'ڕەبیعە' },
  { url: 'Ranya',           slug: 'ranya',           lat: 36.255, lng: 44.881, nameKu: 'ڕانیە' },
  { url: 'Samarra',         slug: 'samarra',         lat: 34.196, lng: 43.886, nameKu: 'سامەڕا' },
  { url: 'Samawah',         slug: 'samawah',         lat: 31.332, lng: 45.281, nameKu: 'سەماوە' },
  { url: 'Sulaymaniyah',    slug: 'sulaymaniyah',    lat: 35.561, lng: 45.437, nameKu: 'سلێمانی' },
  { url: 'Tal Afar',        slug: 'tal-afar',        lat: 36.378, lng: 42.448, nameKu: 'تەلعەفەر' },
  { url: 'Tikrit',          slug: 'tikrit',          lat: 34.612, lng: 43.679, nameKu: 'تکریت' },
  { url: 'Tuz Khurma',      slug: 'tuz-khurma',      lat: 34.881, lng: 44.638, nameKu: 'تووزخورماتوو' },
  { url: 'Zakho',           slug: 'zakho',           lat: 37.143, lng: 42.681, nameKu: 'زاخۆ' },
];

// Kurdish Gregorian-month names -> month number (1..12).
const KU_MONTHS = {
  'کانونی دووەم': 1,
  'شوبات': 2,
  'ئازار': 3,
  'نیسان': 4,
  'ئایار': 5,
  'حوزەیران': 6,
  'تەمموز': 7,
  'ئاب': 8,
  'ئەیلوول': 9,
  'تشرینی یەکەم': 10,
  'تشرینی دووەم': 11,
  'کانونی یەکەم': 12,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch a URL via curl (matches the proven-working request the task specified).
// Returns the HTML string, or throws on failure (curl -f => non-zero on HTTP >=400).
async function curlGet(url) {
  const { stdout } = await execFileP(
    'curl',
    ['-sfL', '-A', 'Mozilla/5.0', '--max-time', '30', url],
    { maxBuffer: 32 * 1024 * 1024 },
  );
  return stdout;
}

async function curlGetRetry(url) {
  try {
    return await curlGet(url);
  } catch (e) {
    // one retry after a short pause
    await sleep(400);
    return await curlGet(url);
  }
}

function stripTags(s) {
  return s
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Pull the Kurdish city name from the page (<h2>بە کاتی NAME</h2>, fallback <title>).
function parseNameKu(html) {
  let m = html.match(/بە کاتی\s*([^<]+)<\/h2>/);
  if (m) return m[1].trim();
  m = html.match(/کاتەکانی بانگ\s*-\s*([^|<]+?)\s*\|/);
  if (m) return m[1].trim();
  return null;
}

// Convert a single "HH:MM" 12h string to 24h based on its prayer slot index.
// slot: 0 Fajr,1 Sunrise,2 Dhuhr,3 Asr,4 Maghrib,5 Isha
function to24(slot, hhmm) {
  const mm = hhmm.match(/(\d{1,2}):(\d{2})/);
  if (!mm) return null;
  let h = parseInt(mm[1], 10);
  const min = mm[2];
  if (slot === 3 || slot === 4 || slot === 5) {
    // Asr / Maghrib / Isha -> always PM
    if (h >= 1 && h <= 11) h += 12;
    // h === 12 stays 12
  }
  // Fajr, Sunrise, Dhuhr -> keep as-is (Dhuhr is already 11:xx or 12:xx)
  return `${String(h).padStart(2, '0')}:${min}`;
}

// Parse one month page. Returns { nameKu, rows: [{month, day, times[6]}] }.
function parseMonthPage(html) {
  const nameKu = parseNameKu(html);

  const bs = html.indexOf('<tbody');
  const be = html.indexOf('</tbody>');
  if (bs < 0 || be < 0) return { nameKu, rows: [] };
  const body = html.slice(bs, be);

  const rowChunks = body.split('<tr').slice(1); // drop the leading <tbody...> chunk
  const rows = [];

  for (const chunk of rowChunks) {
    const cells = [];
    const re = /<td[^>]*>([\s\S]*?)<\/td>/g;
    let m;
    while ((m = re.exec(chunk))) cells.push(stripTags(m[1]));
    if (cells.length < 9) continue;

    const dateCell = cells[1]; // "DD - <ku month> - YYYY"
    const dayMatch = dateCell.match(/^(\d{1,2})/);
    if (!dayMatch) continue;
    const day = parseInt(dayMatch[1], 10);

    // derive Gregorian month from the Kurdish month name in the date cell
    const nameOnly = dateCell
      .replace(/^\d{1,2}\s*-\s*/, '')
      .replace(/\s*-\s*\d{4}\s*$/, '')
      .trim();
    const month = KU_MONTHS[nameOnly];
    if (!month) continue;

    const raw = cells.slice(3, 9); // 6 prayer times
    const times = raw.map((t, i) => to24(i, t));
    if (times.some((t) => t === null)) continue;

    rows.push({ month, day, times });
  }

  return { nameKu, rows };
}

async function scrapeCity(city) {
  const days = {};
  let nameKu = city.nameKu;
  const monthsSeen = new Set();
  const failedMonths = [];

  for (let param = 1; param <= 12; param++) {
    const url = `${BASE}/${encodeURIComponent(city.url)}?month=${param}`;
    let html;
    try {
      html = await curlGetRetry(url);
    } catch (e) {
      failedMonths.push(param);
      await sleep(DELAY_MS);
      continue;
    }

    const { nameKu: pageName, rows } = parseMonthPage(html);
    if (pageName) nameKu = pageName;

    if (rows.length === 0) {
      failedMonths.push(param);
    } else {
      for (const r of rows) {
        days[`${r.month}-${r.day}`] = r.times;
        monthsSeen.add(r.month);
      }
    }
    await sleep(DELAY_MS);
  }

  return { nameKu, days, monthsSeen, failedMonths };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const index = [];
  const report = [];
  let grandTotalDays = 0;
  let okCities = 0;
  const failedCities = [];

  for (const city of CITIES) {
    process.stdout.write(`Scraping ${city.url} ... `);
    let result;
    try {
      result = await scrapeCity(city);
    } catch (e) {
      console.log(`FAILED (${e.message})`);
      failedCities.push(city.slug);
      report.push({ slug: city.slug, days: 0, months: 0, note: 'exception' });
      index.push({ slug: city.slug, nameKu: city.nameKu, lat: city.lat, lng: city.lng });
      continue;
    }

    const dayCount = Object.keys(result.days).length;
    grandTotalDays += dayCount;

    const out = {
      slug: city.slug,
      nameKu: result.nameKu || city.nameKu,
      year: YEAR,
      days: result.days,
    };
    const file = join(OUT_DIR, `${city.slug}.json`);
    await writeFile(file, JSON.stringify(out)); // compact, no pretty-print

    index.push({
      slug: city.slug,
      nameKu: result.nameKu || city.nameKu,
      lat: city.lat,
      lng: city.lng,
    });

    if (dayCount > 0) okCities++;
    else failedCities.push(city.slug);

    const monthsCount = result.monthsSeen.size;
    report.push({
      slug: city.slug,
      days: dayCount,
      months: monthsCount,
      failedParams: result.failedMonths,
    });

    console.log(
      `${dayCount} days, ${monthsCount}/12 months` +
        (result.failedMonths.length ? `, failed params: ${result.failedMonths.join(',')}` : ''),
    );
  }

  // index.json (compact)
  await writeFile(join(OUT_DIR, 'index.json'), JSON.stringify(index));

  // ---- summary ----
  console.log('\n========== SUMMARY ==========');
  console.log(`Cities written : ${CITIES.length}`);
  console.log(`Cities with data: ${okCities}`);
  console.log(`Total day-entries: ${grandTotalDays}`);
  if (failedCities.length) console.log(`Cities with NO data: ${failedCities.join(', ')}`);

  console.log('\n--- coverage (slug: days / months) ---');
  for (const r of report) {
    const flag = r.months === 12 ? '' : '  <-- INCOMPLETE';
    console.log(`${r.slug.padEnd(16)} ${String(r.days).padStart(4)} days  ${r.months}/12${flag}`);
  }

  // ---- spot check: Sulaymaniyah, May (month 5) ----
  const suly = report.find((r) => r.slug === 'sulaymaniyah');
  if (suly && suly.days > 0) {
    try {
      const { readFile } = await import('node:fs/promises');
      const data = JSON.parse(await readFile(join(OUT_DIR, 'sulaymaniyah.json'), 'utf8'));
      const d6 = data.days['5-6'];
      const d30 = data.days['5-30'];
      console.log('\n--- spot check: Sulaymaniyah ---');
      console.log('5-6  (table day 6) :', d6);
      console.log('5-30 (today card)  :', d30);
    } catch (e) {
      console.log('spot-check read failed:', e.message);
    }
  }
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
