import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes as AdhanPrayerTimes,
  type CalculationParameters,
} from 'adhan';
import { Prayer, type CalcMethodId, type Coords, type DailyTimes, type PrayerName, type SkyPeriod } from './types';

export const DEFAULT_COORDS: Coords = { lat: 36.1911, lng: 44.0093 }; // Erbil / Hewlêr fallback

const METHODS: Record<CalcMethodId, () => CalculationParameters> = {
  MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  Egyptian:          CalculationMethod.Egyptian,
  Karachi:           CalculationMethod.Karachi,
  UmmAlQura:         CalculationMethod.UmmAlQura,
  Turkey:            CalculationMethod.Turkey,
  Tehran:            CalculationMethod.Tehran,
};

export type ComputeOptions = {
  method?: CalcMethodId;
  madhab?: 'shafi' | 'hanafi';
  adjustments?: Partial<Record<PrayerName, number>>; // minutes
};

export function computeDailyTimes(coords: Coords, date: Date = new Date(), opts: ComputeOptions = {}): DailyTimes {
  const params = (METHODS[opts.method ?? 'Karachi'] ?? METHODS.Karachi)();
  params.madhab = opts.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  if (opts.adjustments) {
    params.adjustments = { ...params.adjustments, ...opts.adjustments };
  }
  const c = new Coordinates(coords.lat, coords.lng);
  const t = new AdhanPrayerTimes(c, date, params);
  return {
    fajr:    t.fajr,
    sunrise: t.sunrise,
    dhuhr:   t.dhuhr,
    asr:     t.asr,
    maghrib: t.maghrib,
    isha:    t.isha,
  };
}

export type NextPrayerInfo = { name: PrayerName; at: Date };

const ORDER: PrayerName[] = [Prayer.Fajr, Prayer.Sunrise, Prayer.Dhuhr, Prayer.Asr, Prayer.Maghrib, Prayer.Isha];

export function nextPrayer(now: Date, times: DailyTimes): NextPrayerInfo {
  for (const name of ORDER) {
    const at = times[name as keyof DailyTimes];
    if (at.getTime() > now.getTime()) return { name, at };
  }
  // After Isha → tomorrow's Fajr.
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  // We don't have tomorrow's coords/params here — the caller is expected to re-compute,
  // but for a single-day card use today's Fajr as the "Fajr tomorrow" anchor by adding 24h.
  const fajrTomorrow = new Date(times.fajr.getTime() + 24 * 60 * 60 * 1000);
  return { name: Prayer.Fajr, at: fajrTomorrow };
}

export function currentPrayer(now: Date, times: DailyTimes): PrayerName {
  let active: PrayerName = Prayer.None;
  for (const name of ORDER) {
    if (times[name as keyof DailyTimes].getTime() <= now.getTime()) active = name;
    else break;
  }
  return active;
}

// Maps a 0–23 hour-of-day to the visual sky period used by the hero card.
export function skyPeriodForHour(hour: number): SkyPeriod {
  if (hour >= 3  && hour < 5)  return 'fajr';
  if (hour >= 5  && hour < 7)  return 'shuruq';
  if (hour >= 7  && hour < 15) return 'dhuhr';
  if (hour >= 15 && hour < 18) return 'asr';
  if (hour >= 18 && hour < 20) return 'maghrib';
  return 'isha';
}

export function skyPeriodForPrayer(name: PrayerName): SkyPeriod {
  switch (name) {
    case Prayer.Fajr:    return 'fajr';
    case Prayer.Sunrise: return 'shuruq';
    case Prayer.Dhuhr:   return 'dhuhr';
    case Prayer.Asr:     return 'asr';
    case Prayer.Maghrib: return 'maghrib';
    case Prayer.Isha:    return 'isha';
    default:             return 'dhuhr';
  }
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatCountdown(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function hijriDate(d: Date, lang: 'ku' | 'ar' = 'ku'): string {
  try {
    return new Intl.DateTimeFormat(
      `${lang === 'ku' ? 'ar-IQ' : 'ar-EG'}-u-ca-islamic-umalqura`,
      { day: 'numeric', month: 'long', year: 'numeric' },
    ).format(d);
  } catch {
    return '';
  }
}

export function hijriDateShort(d: Date, lang: 'ku' | 'ar' = 'ku'): string {
  try {
    return new Intl.DateTimeFormat(
      `${lang === 'ku' ? 'ar-IQ' : 'ar-EG'}-u-ca-islamic-umalqura`,
      { day: 'numeric', month: 'short' },
    ).format(d);
  } catch {
    return '';
  }
}
