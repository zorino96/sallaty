#!/usr/bin/env node
// One-time repair of the bundled amozhgary prayer times in public/bang/*.json.
//
// Two defects were found by auditing the scraped data against astronomical
// ground truth (sunrise/dhuhr are pure astronomy and must match within ~2 min):
//
//  (1) DECEMBER ↔ JANUARY SWAP (all 51 cities). The scraper assigned January's
//      official times to December and vice-versa. Verified: bundle["1-1"]
//      sunrise == astronomical Dec-1 sunrise (e.g. Basrah 06:28 == 06:28), and
//      bundle["12-1"] == astronomical Jan-1. Swapping the two months back
//      restores each month's correct official times. (Feb–Nov were correct.)
//
//  (2) A handful of isolated corrupt cells (impossible / out-of-order values),
//      fixed by interpolating the official times of the adjacent days — which
//      differ by <1 min from the true value near these dates.
//
// Idempotency note: this performs a SWAP, so running it twice returns to the
// broken state. Run exactly once on the known-broken bundle.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'public/bang';
const files = readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json');

// [city file, dayKey, prayerIndex(0=fajr..5=isha), corrected "HH:MM"]
const CELL_FIXES = [
  ['qasre.json', '6-11', 0, '03:10'], // fajr 04:10 → 03:10 (neighbours 6-10/6-14 = 03:10)
  ['qasre.json', '6-12', 0, '03:10'], // fajr 05:10 → 03:10
  ['qasre.json', '6-13', 0, '03:10'], // fajr 06:10 → 03:10
  ['qasre.json', '10-13', 0, '04:41'], // fajr 12:41 → 04:41 (between 04:40 and 04:42)
  ['halabja.json', '9-3', 4, '18:27'], // maghrib 14:27 → 18:27 (between 18:28 and 18:25)
  ['kalar.json', '4-21', 1, '05:24'], // sunrise 04:24 → 05:24 (between 05:25 and 05:23)
  ['al-shikhan.json', '1-10', 3, '14:58'], // asr 14:50 dip → 14:58 (trend 14:57→14:59)
  ['al-shikhan.json', '1-11', 3, '14:58'], // asr 14:50 dip → 14:58
];

let count = 0;
for (const f of files) {
  const path = join(DIR, f);
  const d = JSON.parse(readFileSync(path, 'utf8'));

  // (1) swap December (12-D) and January (1-D)
  for (let day = 1; day <= 31; day++) {
    const dec = `12-${day}`;
    const jan = `1-${day}`;
    if (d.days[dec] && d.days[jan]) {
      const tmp = d.days[dec];
      d.days[dec] = d.days[jan];
      d.days[jan] = tmp;
    }
  }

  // (2) isolated cell fixes for this city
  for (const [city, key, idx, val] of CELL_FIXES) {
    if (city === f && Array.isArray(d.days[key])) d.days[key][idx] = val;
  }

  writeFileSync(path, JSON.stringify(d));
  count++;
}

console.log(`repaired ${count} city files: Dec↔Jan swap + ${CELL_FIXES.length} isolated cell fixes`);
