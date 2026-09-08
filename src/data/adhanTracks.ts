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
  // The dawn adhan carries a line the other four do not — الصلاة خير من النوم,
  // "prayer is better than sleep" — so a recording of Dhuhr is not a recording
  // of Fajr. When a track ships its own dawn take, name it here and the alarm
  // uses it at Fajr only. Its res/raw and .caf base names get a `_fajr` suffix.
  fajrFile?: string;
  attribution?: string; // credit line shown on the Control page
  licenseUrl?: string;  // CC requires the licence itself be linked, not just named
  sourceUrl?: string;   // where the file came from, so the claim can be checked
};

export const adhanTracks: AdhanTrack[] = [
  // ── Real adhans (Creative Commons, bundled offline) ──
  // Removed: 'adhan-aqib' (Aaqib Azeez, CC BY-SA 4.0). Nothing was wrong with
  // its licence — it went because listeners did not like it, and it had been
  // the default, so it was the one most of them heard. See RETIRED_IDS below.
  // Removed: 'adhan-fakhry' (Sabah Fakhri, 1985). Wikimedia Commons marked it
  // public domain on a tag meaning "published before 1 January 1931" — which
  // cannot describe a 1985 recording taken from YouTube. See RETIRED_IDS below.
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
  {
    id: 'adhan-doha',
    category: 'adhan',
    ku: 'بانگی ئەزان · دۆحە',
    ar: 'الأذان · الدوحة',
    maqam: 'خليجي',
    file: '/audio/adhan-doha.mp3',
    // The only bundled track with its own dawn recording — the uploader captured
    // all five prayers separately, so Fajr keeps الصلاة خير من النوم instead of
    // borrowing the midday take.
    fajrFile: '/audio/adhan-doha-fajr.mp3',
    attribution: 'Adhan Recordings from Doha, Qatar · Public Domain Mark 1.0 (archive.org)',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    sourceUrl: 'https://archive.org/details/adhan.recordings.from.doha.qatar',
  },

  // ── Synthesized alert chimes (copyright-free, perfectly clean) ──
  { id: 'chime-soft', category: 'alert', ku: 'زەنگی نازک',        ar: 'نغمة لطيفة' },
  { id: 'chime-warm', category: 'alert', ku: 'زەنگی گەرم',        ar: 'نغمة دافئة' },
  { id: 'chime-bell', category: 'alert', ku: 'زەنگی زەنگۆڵە',     ar: 'نغمة جرس' },
  { id: 'chime-rise', category: 'alert', ku: 'زەنگی بەرزبوونەوە', ar: 'نغمة تصاعدية' },
];

// Doha, because it is the only track that ships its own dawn recording — a new
// install gets the right adhan at Fajr without touching a setting.
export const defaultAdhanId = 'adhan-doha';

// Tracks that once shipped and no longer do. A phone that already stored one of
// these would otherwise keep it forever: trackById returns undefined, soundBase
// falls back to '', and the user gets the device's default alarm tone at prayer
// time instead of a call to prayer — silently, with the setting still showing
// their old choice. Anything unrecognised resolves back to the default.
const RETIRED_IDS = ['adhan-fakhry', 'adhan-aqib'];

export function trackById(id: string): AdhanTrack | undefined {
  return adhanTracks.find((t) => t.id === id);
}

/** The id to actually use, given whatever a device has stored. */
export function resolveAdhanId(stored: string | undefined | null): string {
  if (!stored || RETIRED_IDS.includes(stored) || !trackById(stored)) return defaultAdhanId;
  return stored;
}

// Credit for every bundled track — rendered on the Control page. CC licences
// require the licence be linked, not merely named, so carry the URLs through.
export type AudioCredit = { text: string; licenseUrl?: string; sourceUrl?: string };

export const audioAttributions: AudioCredit[] = adhanTracks
  .filter((t) => t.attribution)
  .map((t) => ({ text: t.attribution as string, licenseUrl: t.licenseUrl, sourceUrl: t.sourceUrl }));
