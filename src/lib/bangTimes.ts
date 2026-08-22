// Official prayer times sourced from amozhgary.tv ("bang"), bundled per-city for
// offline use under /public/bang/. This is the PRIMARY source for Kurdish/Iraqi
// cities; src/lib/prayerTimes.ts (adhan calculation) is the fallback for places
// or dates the bundle doesn't cover.
//
// Yearly renewal: the bundle holds one year. When the running date isn't in the
// bundle (e.g. the year rolled over), `fetchBangMonthLive()` pulls the fresh
// month straight from amozhgary.tv (via Capacitor's native HTTP to dodge CORS)
// and caches it in localStorage, so the app stays correct without a rebuild.

import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { haversineKm } from './geolocation';
import { storage } from './storage';
import type { Coords, DailyTimes } from './types';

export type BangCityMeta = { slug: string; nameKu: string; lat: number; lng: number };

export type BangCityData = {
  slug: string;
  nameKu: string;
  year: number;
  days: Record<string, [string, string, string, string, string, string]>; // "M-D" → 6×"HH:MM"
};

// Beyond this distance from any amozhgary city we treat the user as "outside
// the covered region" and fall back to calculation (e.g. other countries).
const MAX_CITY_KM = 120;

let indexCache: BangCityMeta[] | null = null;
const cityCache = new Map<string, BangCityData | null>();

export async function loadBangIndex(): Promise<BangCityMeta[]> {
  if (indexCache) return indexCache;
  try {
    const res = await fetch('/bang/index.json');
    if (!res.ok) throw new Error('no index');
    indexCache = (await res.json()) as BangCityMeta[];
  } catch {
    indexCache = [];
  }
  return indexCache;
}

export function nearestBangCity(coords: Coords, index: BangCityMeta[]): { city: BangCityMeta; km: number } | null {
  let best: BangCityMeta | null = null;
  let bestKm = Infinity;
  for (const c of index) {
    const km = haversineKm(coords, { lat: c.lat, lng: c.lng });
    if (km < bestKm) {
      bestKm = km;
      best = c;
    }
  }
  if (!best || bestKm > MAX_CITY_KM) return null;
  return { city: best, km: bestKm };
}

export async function loadBangCity(slug: string): Promise<BangCityData | null> {
  if (cityCache.has(slug)) return cityCache.get(slug) ?? null;
  try {
    const res = await fetch(`/bang/${slug}.json`);
    if (!res.ok) throw new Error('no city');
    const data = (await res.json()) as BangCityData;
    cityCache.set(slug, data);
    return data;
  } catch {
    cityCache.set(slug, null);
    return null;
  }
}

// Combine a "HH:MM" string with a date into a local Date.
function at(date: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

function dayKey(date: Date): string {
  return `${date.getMonth() + 1}-${date.getDate()}`;
}

// Build DailyTimes from a city's bundled record for the given date, or null.
export function bangTimesFromData(data: BangCityData, date: Date): DailyTimes | null {
  if (date.getFullYear() !== data.year) return null;
  const row = data.days[dayKey(date)];
  if (!row) return null;
  const [fajr, sunrise, dhuhr, asr, maghrib, isha] = row;
  return {
    fajr: at(date, fajr),
    sunrise: at(date, sunrise),
    dhuhr: at(date, dhuhr),
    asr: at(date, asr),
    maghrib: at(date, maghrib),
    isha: at(date, isha),
  };
}

// ── Live yearly-refresh from amozhgary.tv ────────────────────────────────────

const PRAYER_LABELS = ['بەیانی', 'خۆرهەڵاتن', 'نیوەڕۆ', 'عەسر', 'مەغریب', 'عیشاء'];

// 12h → 24h. fajr/sunrise/dhuhr are morning/noon; asr/maghrib/isha are PM.
function to24(idx: number, hhmm: string): string {
  let [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  if (idx >= 3 && h >= 1 && h <= 11) h += 12; // asr, maghrib, isha
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

async function getHtml(url: string): Promise<string | null> {
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await CapacitorHttp.get({ url, headers: { 'User-Agent': 'Mozilla/5.0' } });
      return typeof res.data === 'string' ? res.data : String(res.data ?? '');
    }
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Widest plausible window per prayer across Iraqi latitudes, minutes from
// midnight. Loose on purpose: this rejects a broken scrape (a 12h/24h slip, a
// shifted column, a page that stopped being a timetable), not a two-minute
// disagreement. scripts/validate-bang-data.mjs applies the same rules to the
// bundled files — keep the two in step.
const PLAUSIBLE: ReadonlyArray<readonly [number, number]> = [
  [2 * 60, 7 * 60],            // fajr
  [4 * 60, 8 * 60 + 30],       // sunrise
  [10 * 60 + 30, 14 * 60],     // dhuhr
  [13 * 60, 18 * 60],          // asr
  [15 * 60, 21 * 60],          // maghrib
  [16 * 60 + 30, 23 * 60],     // isha
];

function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}

/**
 * Whether six scraped times can be a real day. The times must each sit in
 * their window and must run forward through the day — a swapped or duplicated
 * column fails the ordering check even when every value looks fine alone.
 *
 * Anything this rejects is dropped rather than shown. Displaying a wrong
 * prayer time with the authority of the official tables is worse than falling
 * back to the calculation, which is at least honest about what it is.
 */
export function isPlausibleRow(row: readonly string[]): boolean {
  if (row.length !== 6) return false;
  let prev = -1;
  for (let i = 0; i < 6; i++) {
    const v = toMinutes(row[i]);
    if (v === null) return false;
    const [lo, hi] = PLAUSIBLE[i];
    if (v < lo || v > hi) return false;
    if (v <= prev) return false;
    prev = v;
  }
  return true;
}

/** What the last live-refresh attempt did. Read by the /control screen. */
export type BangFetchStatus = {
  at: number;
  outcome: 'ok' | 'unreachable' | 'unparsed' | 'implausible';
  /** Days accepted, when the outcome is 'ok'. */
  days?: number;
  /** Days thrown out by isPlausibleRow, whatever the outcome. */
  rejected?: number;
};

const FETCH_STATUS_KEY = 'bang.lastFetch';

function recordFetch(status: BangFetchStatus): void {
  storage.set(FETCH_STATUS_KEY, status);
}

/** The last live-refresh attempt, or null if one has never run. */
export function lastBangFetch(): BangFetchStatus | null {
  return storage.get<BangFetchStatus | null>(FETCH_STATUS_KEY, null);
}

// Fetch + parse one month for a city, returning {"M-D":[6×HH:MM 24h]} or null.
export async function fetchBangMonthLive(
  citySlugOnSite: string,
  month: number,
): Promise<Record<string, [string, string, string, string, string, string]> | null> {
  const url = `https://amozhgary.tv/bang/${encodeURIComponent(citySlugOnSite)}?month=${month}`;
  const html = await getHtml(url);
  if (!html) {
    recordFetch({ at: Date.now(), outcome: 'unreachable' });
    return null;
  }

  // The month table renders each day as a row containing the 6 labelled times.
  // We scan for "<day> - <monthName> - <year>" anchors and the following 6 times.
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const out: Record<string, [string, string, string, string, string, string]> = {};

  // Each labelled block looks like: بەیانی: 03:19 خۆرهەڵاتن: 04:45 ... عیشاء : 08:35
  // paired with a day number nearby. We capture day + the 6 times that follow.
  const dayRe = /(\d{1,2})\s*-\s*[^-]{2,15}-\s*20\d{2}[\s\S]{0,40}?بەیانی\s*:?\s*(\d{1,2}:\d{2})[\s\S]{0,30}?(\d{1,2}:\d{2})[\s\S]{0,30}?(\d{1,2}:\d{2})[\s\S]{0,30}?(\d{1,2}:\d{2})[\s\S]{0,30}?(\d{1,2}:\d{2})[\s\S]{0,30}?(\d{1,2}:\d{2})/g;
  let mt: RegExpExecArray | null;
  let rejected = 0;
  while ((mt = dayRe.exec(text)) !== null) {
    const day = parseInt(mt[1], 10);
    const raw = [mt[2], mt[3], mt[4], mt[5], mt[6], mt[7]];
    const conv = raw.map((t, i) => to24(i, t)) as [string, string, string, string, string, string];
    // A regex this shape can match six unrelated times on a page that is no
    // longer a timetable. Only keep rows that could be a real day.
    if (!isPlausibleRow(conv)) {
      rejected++;
      continue;
    }
    out[`${month}-${day}`] = conv;
  }

  const days = Object.keys(out).length;
  if (!days) {
    // Nothing usable: either the page stopped matching, or everything it
    // yielded was nonsense. Those are different problems, so say which.
    recordFetch({
      at: Date.now(),
      outcome: rejected > 0 ? 'implausible' : 'unparsed',
      rejected,
    });
    return null;
  }
  recordFetch({ at: Date.now(), outcome: 'ok', days, rejected });
  return out;
}

// Try to get times for a date when the bundle doesn't cover it: pull the live
// month from amozhgary, cache it, and combine into DailyTimes. Best-effort.
export async function liveBangTimes(
  cityMeta: BangCityMeta,
  date: Date,
): Promise<DailyTimes | null> {
  const cacheKey = `bang.${cityMeta.slug}.${date.getFullYear()}.${date.getMonth() + 1}`;
  let month = storage.get<Record<string, [string, string, string, string, string, string]> | null>(cacheKey, null);
  if (!month) {
    // The on-site slug is the original (spaced/cased) name; we stored it lowercased.
    // Re-fetch the index entry's display slug isn't kept, so we title-case the slug back.
    const onSite = cityMeta.slug
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
    month = await fetchBangMonthLive(onSite, date.getMonth() + 1);
    if (month) storage.set(cacheKey, month);
  }
  if (!month) return null;
  const row = month[`${date.getMonth() + 1}-${date.getDate()}`];
  if (!row) return null;
  const [fajr, sunrise, dhuhr, asr, maghrib, isha] = row;
  return {
    fajr: at(date, fajr),
    sunrise: at(date, sunrise),
    dhuhr: at(date, dhuhr),
    asr: at(date, asr),
    maghrib: at(date, maghrib),
    isha: at(date, isha),
  };
}
