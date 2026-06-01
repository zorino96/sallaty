// Metadata for all 114 surahs. Loaded eagerly (~13 KB) so the index page
// renders instantly. Per-surah verse data lives in public/quran/{ar,ku}/{n}.json
// and is fetched on demand by `src/lib/quran.ts`.

import surahMeta from '../../../public/quran/surahs.json';

export type Surah = {
  n: number;         // 1..114
  name: string;      // Arabic name with diacritics
  tr: string;        // Latin transliteration ("Al-Faatiha")
  trEn: string;      // English meaning ("The Opening")
  count: number;     // number of ayahs
  rev: 'M' | 'D';    // M = Meccan, D = Medinan
};

export const SURAHS = surahMeta as Surah[];

export function surahById(n: number): Surah | undefined {
  return SURAHS.find((s) => s.n === n);
}

// The 7-verse Al-Fatihah and any other commonly-cited references can use this:
export const SURAH_COUNT = SURAHS.length;
export const TOTAL_AYAHS = SURAHS.reduce((sum, s) => sum + s.count, 0); // 6236
