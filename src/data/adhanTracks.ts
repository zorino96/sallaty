// Adhan + alert sounds.
//
// The two real adhans are bundled in public/audio/ and are freely licensed
// (Creative Commons) from Wikimedia Commons — attribution is shown on the
// Control page. The "chime" alerts have no file: they are synthesized live by
// src/lib/adhanPlayer.ts, so they are 100% copyright-free and noise-free.
//
// To add your own adhan: drop an .mp3 into public/audio/ and add an entry here
// with category 'adhan' and the matching `file` path.

export type AdhanTrack = {
  id: string;
  category: 'adhan' | 'alert';
  ku: string;
  ar: string;
  maqam?: string;
  file?: string;        // present → play the file; absent → synthesize a chime
  attribution?: string; // credit line shown on the Control page
  licenseUrl?: string;  // CC requires the licence itself be linked, not just named
  sourceUrl?: string;   // where the file came from, so the claim can be checked
};

export const adhanTracks: AdhanTrack[] = [
  // ── Real adhans (Creative Commons, bundled offline) ──
  {
    id: 'adhan-aqib',
    category: 'adhan',
    ku: 'بانگی ئەزان · عاقب عەزیز',
    ar: 'الأذان · عاقب عزيز',
    maqam: 'CC BY-SA',
    file: '/audio/adhan-aqib.mp3',
    attribution: 'The Adhan — Aaqib Azeez · CC BY-SA 4.0 (Wikimedia Commons)',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:The_Adhan_-_Muslim_Call_to_Prayer_-_Aaqib_Azeez.mp3',
  },
  // ⚠️ RIGHTS RISK — do not ship without deciding. Wikimedia Commons tags this
  // file "Public Domain Mark 1.0" plus a US PD-1923 tag ("published before 1
  // January 1931"), which cannot be true of a 1985 recording sourced from
  // YouTube. The tag appears to rest on the adhan *text* being ancient, which
  // says nothing about this *recording*. Sabah Fakhri died in 2021, so the
  // recording is very likely still in copyright and the Commons tag is simply
  // wrong. We keep the description honest about what Commons actually claims
  // rather than repeating "Creative Commons", which it never said.
  {
    id: 'adhan-fakhry',
    category: 'adhan',
    ku: 'بانگی ئەزان · سەباح فەخری',
    ar: 'الأذان · صباح فخري',
    maqam: 'PD?',
    file: '/audio/adhan-fakhry.mp3',
    attribution: 'Call to prayer — Sabah Fakhri (1985) · marked Public Domain on Wikimedia Commons',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Call_to_prayer_by_Sabah_Fakhry.mp3',
  },
  {
    id: 'adhan-egypt',
    category: 'adhan',
    ku: 'بانگی ئەزان · میسری (فەجر)',
    ar: 'الأذان · مصري (الفجر)',
    maqam: 'مصري',
    file: '/audio/adhan-egypt.mp3',
    // Uploaded to archive.org by "fouadadan1" — the reciter posting their own
    // recording and marking it public domain.
    attribution: 'Adhan al-Fajr — Fouad Adan · Public Domain Mark 1.0 (archive.org)',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    sourceUrl: 'https://archive.org/details/fouad-jawda_live_2',
  },

  // ── Synthesized alert chimes (copyright-free, perfectly clean) ──
  { id: 'chime-soft', category: 'alert', ku: 'زەنگی نازک',        ar: 'نغمة لطيفة' },
  { id: 'chime-warm', category: 'alert', ku: 'زەنگی گەرم',        ar: 'نغمة دافئة' },
  { id: 'chime-bell', category: 'alert', ku: 'زەنگی زەنگۆڵە',     ar: 'نغمة جرس' },
  { id: 'chime-rise', category: 'alert', ku: 'زەنگی بەرزبوونەوە', ar: 'نغمة تصاعدية' },
];

export const defaultAdhanId = 'adhan-aqib';

export function trackById(id: string): AdhanTrack | undefined {
  return adhanTracks.find((t) => t.id === id);
}

// Credit for every bundled track — rendered on the Control page. CC licences
// require the licence be linked, not merely named, so carry the URLs through.
export type AudioCredit = { text: string; licenseUrl?: string; sourceUrl?: string };

export const audioAttributions: AudioCredit[] = adhanTracks
  .filter((t) => t.attribution)
  .map((t) => ({ text: t.attribution as string, licenseUrl: t.licenseUrl, sourceUrl: t.sourceUrl }));
