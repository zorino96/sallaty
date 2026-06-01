// Mirror of `Prayer.d.ts` from the recovered files — the original public type.
export const Prayer = {
  Fajr: 'fajr',
  Sunrise: 'sunrise',
  Dhuhr: 'dhuhr',
  Asr: 'asr',
  Maghrib: 'maghrib',
  Isha: 'isha',
  None: 'none',
} as const;

export type PrayerName = (typeof Prayer)[keyof typeof Prayer];

export type Coords = { lat: number; lng: number };

export type DailyTimes = {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
};

export type SkyPeriod = 'fajr' | 'shuruq' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type Lang = 'ku' | 'ar';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type GeoStatus = 'idle' | 'locating' | 'granted' | 'denied';
export type NotifPerm = 'default' | 'granted' | 'denied' | 'unsupported';

export type CalcMethodId =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Turkey'
  | 'Tehran';

// Per-prayer manual offsets in minutes (so users can match their local mosque/Awqaf exactly).
export type Adjustments = {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
};

export const ZERO_ADJUSTMENTS: Adjustments = {
  fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0,
};

export default Prayer;
