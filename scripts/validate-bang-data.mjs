// Validates the bundled official prayer tables under public/bang/.
//
// These 51 files are the app's one real differentiator — the municipal
// amozhgary timetables, not a calculation. Nothing else checks them: they are
// imported once a year by hand, and a bad import would ship as authoritative
// prayer times. This is the check that would catch it.
//
// The same rules run at runtime against the live scrape (isPlausibleRow in
// src/lib/bangTimes.ts), so a year-rollover fetch that returns garbage is
// rejected instead of displayed. Keep the two in step.
//
//   npm run validate:bang

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'public/bang';
const LABELS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Widest plausible window for each prayer across Iraqi latitudes, in minutes
// from midnight. Deliberately loose — this catches a broken import (a 12h/24h
// mix-up, a shifted column, an empty cell), not a two-minute disagreement.
const WINDOWS = {
  fajr:    [2 * 60, 7 * 60],
  sunrise: [4 * 60, 8 * 60 + 30],
  dhuhr:   [10 * 60 + 30, 14 * 60],
  asr:     [13 * 60, 18 * 60],
  maghrib: [15 * 60, 21 * 60],
  isha:    [16 * 60 + 30, 23 * 60],
};

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function minutes(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}

/** Every rule a row of six times must satisfy. Returns [] when the row is good. */
export function rowProblems(row, label = '') {
  const where = label ? `${label}: ` : '';
  if (!Array.isArray(row) || row.length !== 6) {
    return [`${where}expected 6 times, got ${Array.isArray(row) ? row.length : typeof row}`];
  }
  const problems = [];
  const mins = [];
  for (let i = 0; i < 6; i++) {
    const v = minutes(row[i]);
    if (v === null) {
      problems.push(`${where}${LABELS[i]} is not HH:MM ("${row[i]}")`);
      mins.push(null);
      continue;
    }
    const [lo, hi] = WINDOWS[LABELS[i]];
    if (v < lo || v > hi) {
      problems.push(`${where}${LABELS[i]} ${row[i]} outside plausible window`);
    }
    mins.push(v);
  }
  // The six must run forward through the day. A column swap or a 12h/24h
  // mistake shows up here even when every value is individually plausible.
  for (let i = 1; i < 6; i++) {
    if (mins[i] !== null && mins[i - 1] !== null && mins[i] <= mins[i - 1]) {
      problems.push(`${where}${LABELS[i]} ${row[i]} is not after ${LABELS[i - 1]} ${row[i - 1]}`);
    }
  }
  return problems;
}

/** Every "M-D" key a non-leap year must have. */
function expectedKeys() {
  const keys = [];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= DAYS_IN_MONTH[m - 1]; d++) keys.push(`${m}-${d}`);
  }
  return keys;
}

function main() {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json');
  if (files.length === 0) {
    console.error(`FAIL  no city files under ${DIR}/`);
    process.exit(1);
  }

  const wanted = expectedKeys();
  const years = new Set();
  let failed = 0;
  let rowsChecked = 0;

  for (const file of files) {
    const problems = [];
    let data;
    try {
      data = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
    } catch (err) {
      console.error(`FAIL  ${file}  unparseable: ${err.message}`);
      failed++;
      continue;
    }

    for (const field of ['slug', 'nameKu', 'year', 'days']) {
      if (data[field] === undefined) problems.push(`missing "${field}"`);
    }
    if (typeof data.year === 'number') years.add(data.year);
    if (data.slug && `${data.slug}.json` !== file) {
      problems.push(`slug "${data.slug}" does not match filename`);
    }

    const days = data.days ?? {};
    const missing = wanted.filter((k) => !(k in days));
    // bangTimesFromData does a bare days[dayKey(date)] lookup, so a missing key
    // is a silent fall-through to calculated times on exactly that day.
    if (missing.length) {
      problems.push(`${missing.length} missing day(s): ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ' …' : ''}`);
    }
    const extra = Object.keys(days).filter((k) => !wanted.includes(k));
    if (extra.length) problems.push(`unexpected key(s): ${extra.slice(0, 5).join(', ')}`);

    for (const key of wanted) {
      if (!(key in days)) continue;
      rowsChecked++;
      problems.push(...rowProblems(days[key], key));
    }

    if (problems.length) {
      failed++;
      console.error(`FAIL  ${file}`);
      for (const p of problems.slice(0, 8)) console.error(`        ${p}`);
      if (problems.length > 8) console.error(`        … and ${problems.length - 8} more`);
    }
  }

  const ok = files.length - failed;
  console.log(`\n${ok}/${files.length} city files valid · ${rowsChecked} days checked · year(s): ${[...years].join(', ')}`);

  if (years.size > 1) {
    console.error(`FAIL  cities disagree on the year — the bundle must be one year`);
    process.exit(1);
  }
  // The bundle covers one calendar year. Past that, the app depends on the live
  // amozhgary fetch, which is a scrape and can break without warning. Say so
  // while there is still time to import the next year's tables.
  const year = [...years][0];
  const currentYear = new Date().getFullYear();
  if (typeof year === 'number' && year <= currentYear) {
    const daysLeft = Math.ceil((new Date(year + 1, 0, 1) - new Date()) / 86400000);
    if (daysLeft <= 150) {
      console.warn(
        `\nWARN  the ${year} tables expire in ${daysLeft} day(s). After that every city\n` +
        `      falls through to the live amozhgary scrape, and offline users get\n` +
        `      calculated times. Import the ${year + 1} tables before then.`,
      );
    }
  }

  if (failed) {
    console.error(`\n${failed} file(s) failed validation`);
    process.exit(1);
  }
  console.log('All bundled prayer tables valid.');
}

main();
