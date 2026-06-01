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
  file?: string;       // present → play the file; absent → synthesize a chime
  attribution?: string; // CC credit shown on the Control page
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
  },
  {
    id: 'adhan-fakhry',
    category: 'adhan',
    ku: 'بانگی ئەزان · سەباح فەخری',
    ar: 'الأذان · صباح فخري',
    maqam: 'CC',
    file: '/audio/adhan-fakhry.mp3',
    attribution: 'Call to prayer — Sabah Fakhri (1985) · Creative Commons (Wikimedia Commons)',
  },
  {
    id: 'adhan-egypt',
    category: 'adhan',
    ku: 'بانگی ئەزان · میسری (فەجر)',
    ar: 'الأذان · مصري (الفجر)',
    maqam: 'مصري',
    file: '/audio/adhan-egypt.mp3',
    attribution: 'Adhan al-Fajr — Fouad Adan · Public Domain (archive.org)',
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

// Attribution lines for every bundled CC track — rendered on the Control page.
export const audioAttributions: string[] = adhanTracks
  .filter((t) => t.attribution)
  .map((t) => t.attribution as string);
