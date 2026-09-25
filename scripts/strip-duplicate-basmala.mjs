#!/usr/bin/env node
// Takes the basmala back off verse 1, where the source data had glued it on.
//
// The app draws the basmala itself, above the verses, for every surah except
// Al-Fatihah (where it *is* verse 1) and At-Tawbah (which has none). The
// bundled Arabic text also carried it inside verse 1, so 112 of the 114 surahs
// showed it twice — once in the header and once at the head of the first verse,
// where it does not belong and where the Kurdish translation beside it (which
// was always correct) did not account for it.
//
//   node scripts/strip-duplicate-basmala.mjs [--write]
//
// Without --write it only reports. Nothing is typed by hand: the basmala is
// read out of surah 1's own verse 1, so it matches the file's exact
// orthography. Matching ignores diacritics, because surahs 95 and 97 spell it
// with one shadda more than the rest (بِّسْمِ rather than بِسْمِ).

import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'public/quran/ar';
const FATIHA = 1;   // the basmala is genuinely its first verse
const TAWBAH = 9;   // has no basmala at all

// Harakat, superscript alef, the hamza/madda marks, and tatweel. Stripped only
// for *comparison* — the text that gets written keeps every mark it had.
const MARKS = /[ً-ٰٕـ]/u;

const file = (s) => `${DIR}/${s}.json`;
const load = (s) => JSON.parse(readFileSync(file(s), 'utf8'));

/**
 * How many characters of `verse` are taken up by `basmala`, comparing only the
 * letters. Returns 0 when the verse does not open with it.
 */
function basmalaPrefixLength(verse, basmala) {
  let i = 0; // index into verse
  let j = 0; // index into basmala
  while (j < basmala.length) {
    if (MARKS.test(basmala[j])) { j++; continue; }
    while (i < verse.length && MARKS.test(verse[i])) i++;
    if (i >= verse.length || verse[i] !== basmala[j]) return 0;
    i++; j++;
  }
  // Carry any diacritics that trail the final letter, plus the space after it.
  while (i < verse.length && MARKS.test(verse[i])) i++;
  return i;
}

const write = process.argv.includes('--write');
const basmala = load(FATIHA).ayahs[0].t.trim();
console.log(`basmala taken from surah 1: ${basmala}\n`);

let changed = 0;
const untouched = [];

for (let s = 2; s <= 114; s++) {
  if (s === TAWBAH) { untouched.push(s); continue; }
  const data = load(s);
  const verse = data.ayahs[0].t;
  const cut = basmalaPrefixLength(verse.trimStart(), basmala);
  if (!cut) { untouched.push(s); continue; }

  const rest = verse.trimStart().slice(cut).trim();
  if (!rest) {
    console.error(`  surah ${s}: stripping would leave verse 1 empty — refusing.`);
    process.exit(1);
  }
  console.log(`  ${String(s).padStart(3)}  ${verse.trim().slice(0, 46)}…`);
  console.log(`       → ${rest.slice(0, 46)}`);
  if (write) {
    data.ayahs[0].t = rest;
    writeFileSync(file(s), JSON.stringify(data), 'utf8');
  }
  changed++;
}

console.log(`\n${changed} surah(s) ${write ? 'rewritten' : 'would change'}.`);
console.log(`left alone: ${untouched.join(', ') || '(none)'}`);
if (!write) console.log('\nRe-run with --write to apply.');
