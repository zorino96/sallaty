'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dictionaries, type Lang, type StringKey } from './i18n';
import { getCurrentCoords, reverseGeocode } from './geolocation';
import { computeDailyTimes, DEFAULT_COORDS } from './prayerTimes';
import {
  bangTimesFromData,
  fetchBangMonthLive,
  loadBangCity,
  loadBangIndex,
  nearestBangCity,
  type BangCityData,
  type BangCityMeta,
} from './bangTimes';
import { storage } from './storage';
import {
  cancelAllScheduled,
  checkNotifPermission,
  requestNotifPermission,
  schedulePrayerNotifications,
} from './notifications';
import {
  ZERO_ADJUSTMENTS,
  type Adjustments,
  type CalcMethodId,
  type Coords,
  type DailyTimes,
  type GeoStatus,
  type NotifPerm,
  type PrayerName,
  type ThemeMode,
} from './types';

// One-tap preset that nudges the calculated times toward the Iraqi/Kurdistan
// Awqaf published schedule (slightly later Fajr, earlier Isha + a Dhuhr safety
// minute). Users can still fine-tune each prayer afterwards.
export const IRAQ_PRESET: Adjustments = {
  fajr: 2, sunrise: 0, dhuhr: 2, asr: 1, maghrib: 2, isha: -3,
};

type AppCtx = {
  ready: boolean;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: StringKey) => string;

  theme: ThemeMode;
  setTheme: (m: ThemeMode) => void;

  coords: Coords;
  city: string | undefined;
  geoStatus: GeoStatus;
  refreshLocation: () => Promise<void>;

  onboarded: boolean;
  setOnboarded: (b: boolean) => void;

  method: CalcMethodId;
  setMethod: (m: CalcMethodId) => void;

  madhab: 'shafi' | 'hanafi';
  setMadhab: (m: 'shafi' | 'hanafi') => void;

  adjustments: Adjustments;
  setAdjustment: (prayer: keyof Adjustments, minutes: number) => void;
  applyIraqPreset: () => void;
  resetAdjustments: () => void;

  adhanId: string;
  setAdhanId: (id: string) => void;

  notifEnabled: boolean;
  notifPerm: NotifPerm;
  enableNotifications: () => Promise<void>;
  disableNotifications: () => void;

  getTimes: (date?: Date) => DailyTimes;
  // Where today's times come from: official amozhgary bundle/live, or local calc.
  timesSource: 'bang' | 'calc';
  bangCityName: string | null;
};

const Ctx = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [lang, setLangState] = useState<Lang>('ku');
  const [theme, setThemeState] = useState<ThemeMode>('auto');
  const [coords, setCoords] = useState<Coords>(DEFAULT_COORDS);
  const [city, setCity] = useState<string | undefined>(undefined);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [onboarded, setOnboardedState] = useState(false);
  const [method, setMethodState] = useState<CalcMethodId>('MuslimWorldLeague');
  const [madhab, setMadhabState] = useState<'shafi' | 'hanafi'>('shafi');
  const [adjustments, setAdjustments] = useState<Adjustments>(ZERO_ADJUSTMENTS);
  const [adhanId, setAdhanIdState] = useState('adhan-aqib');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotifPerm>('default');

  // Official amozhgary.tv times for the nearest covered city (primary source).
  const [bangData, setBangData] = useState<BangCityData | null>(null);
  const [bangMeta, setBangMeta] = useState<BangCityMeta | null>(null);
  // Live-fetched months merged in for dates the bundle doesn't cover (year rollover).
  const [liveOverlay, setLiveOverlay] = useState<Record<string, [string, string, string, string, string, string]>>({});

  // Hydrate from localStorage on first mount.
  useEffect(() => {
    setLangState(storage.get<Lang>('lang', 'ku'));
    setThemeState(storage.get<ThemeMode>('theme', 'auto'));
    setCoords(storage.get<Coords>('coords', DEFAULT_COORDS));
    setCity(storage.get<string | undefined>('city', undefined));
    setOnboardedState(storage.get<boolean>('onboarded', false));
    setMethodState(storage.get<CalcMethodId>('method', 'Karachi'));
    setMadhabState(storage.get<'shafi' | 'hanafi'>('madhab', 'shafi'));
    setAdjustments(storage.get<Adjustments>('adjustments', ZERO_ADJUSTMENTS));
    setAdhanIdState(storage.get<string>('adhan', 'adhan-aqib'));
    setNotifEnabled(storage.get<boolean>('notifEnabled', false));
    void checkNotifPermission().then(setNotifPerm).catch(() => setNotifPerm('default'));
    setReady(true);
  }, []);

  // Apply theme class.
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    const apply = (mode: ThemeMode) => {
      const dark =
        mode === 'dark' ||
        (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.toggle('dark', dark);
    };
    apply(theme);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => theme === 'auto' && apply(theme);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, ready]);

  // Apply lang + dir on <html>.
  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang === 'ku' ? 'ckb' : 'ar';
    document.documentElement.dir = 'rtl';
  }, [lang, ready]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storage.set('lang', l);
  }, []);

  const setTheme = useCallback((m: ThemeMode) => {
    setThemeState(m);
    storage.set('theme', m);
  }, []);

  const setOnboarded = useCallback((b: boolean) => {
    setOnboardedState(b);
    storage.set('onboarded', b);
  }, []);

  const setMethod = useCallback((m: CalcMethodId) => {
    setMethodState(m);
    storage.set('method', m);
  }, []);

  const setMadhab = useCallback((m: 'shafi' | 'hanafi') => {
    setMadhabState(m);
    storage.set('madhab', m);
  }, []);

  const setAdjustment = useCallback((prayer: keyof Adjustments, minutes: number) => {
    setAdjustments((prev) => {
      const clamped = Math.max(-30, Math.min(30, Math.round(minutes)));
      const next = { ...prev, [prayer]: clamped };
      storage.set('adjustments', next);
      return next;
    });
  }, []);

  const applyIraqPreset = useCallback(() => {
    setAdjustments(() => {
      storage.set('adjustments', IRAQ_PRESET);
      return IRAQ_PRESET;
    });
  }, []);

  const resetAdjustments = useCallback(() => {
    setAdjustments(() => {
      storage.set('adjustments', ZERO_ADJUSTMENTS);
      return ZERO_ADJUSTMENTS;
    });
  }, []);

  const setAdhanId = useCallback((id: string) => {
    setAdhanIdState(id);
    storage.set('adhan', id);
  }, []);

  const refreshLocation = useCallback(async () => {
    setGeoStatus('locating');
    const result = await getCurrentCoords();
    if (!result) {
      setGeoStatus('denied');
      return;
    }
    setCoords(result);
    storage.set('coords', result);
    setGeoStatus('granted');
    const detected = await reverseGeocode(result, lang).catch(() => undefined);
    if (detected) {
      setCity(detected);
      storage.set('city', detected);
    }
  }, [lang]);

  const enableNotifications = useCallback(async () => {
    const perm = await requestNotifPermission();
    setNotifPerm(perm);
    if (perm === 'granted') {
      setNotifEnabled(true);
      storage.set('notifEnabled', true);
    }
  }, []);

  const disableNotifications = useCallback(() => {
    setNotifEnabled(false);
    storage.set('notifEnabled', false);
    void cancelAllScheduled();
  }, []);

  // Load the nearest amozhgary city's bundled times whenever the location changes.
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    void (async () => {
      const index = await loadBangIndex();
      const near = nearestBangCity(coords, index);
      if (!alive) return;
      if (!near) {
        setBangMeta(null);
        setBangData(null);
        return;
      }
      setBangMeta(near.city);
      const data = await loadBangCity(near.city.slug);
      if (alive) setBangData(data);
    })();
    return () => {
      alive = false;
    };
  }, [ready, coords]);

  // Resolve a date's times: official bundle → live overlay → local calculation.
  const resolveTimes = useCallback(
    (date: Date): { times: DailyTimes; source: 'bang' | 'calc' } => {
      if (bangData) {
        const bundled = bangTimesFromData(bangData, date);
        if (bundled) return { times: bundled, source: 'bang' };
      }
      const key = `${date.getMonth() + 1}-${date.getDate()}`;
      const row = liveOverlay[key];
      if (row) {
        const toDate = (hhmm: string) => {
          const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
          const d = new Date(date);
          d.setHours(h, m, 0, 0);
          return d;
        };
        return {
          times: {
            fajr: toDate(row[0]), sunrise: toDate(row[1]), dhuhr: toDate(row[2]),
            asr: toDate(row[3]), maghrib: toDate(row[4]), isha: toDate(row[5]),
          },
          source: 'bang',
        };
      }
      return {
        times: computeDailyTimes(coords, date, { method, madhab, adjustments }),
        source: 'calc',
      };
    },
    [bangData, liveOverlay, coords, method, madhab, adjustments],
  );

  // Yearly renewal: if today isn't covered by the bundle, pull the live month
  // from amozhgary.tv and merge it in (cached). Falls back silently to calc.
  useEffect(() => {
    if (!ready || !bangMeta) return;
    const today = new Date();
    const covered = bangData && bangTimesFromData(bangData, today);
    const key = `${today.getMonth() + 1}-${today.getDate()}`;
    if (covered || liveOverlay[key]) return;
    let alive = true;
    void (async () => {
      const onSite = bangMeta.slug
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
      const month = await fetchBangMonthLive(onSite, today.getMonth() + 1);
      if (alive && month) setLiveOverlay((prev) => ({ ...prev, ...month }));
    })();
    return () => {
      alive = false;
    };
  }, [ready, bangMeta, bangData, liveOverlay]);

  const getTimes = useCallback((date?: Date) => resolveTimes(date ?? new Date()).times, [resolveTimes]);

  const timesSource = useMemo(() => resolveTimes(new Date()).source, [resolveTimes]);

  // (Re)schedule notifications whenever the active prayer times or settings change.
  useEffect(() => {
    if (!ready) return;
    if (!(notifEnabled && notifPerm === 'granted')) {
      void cancelAllScheduled();
      return;
    }
    const times = resolveTimes(new Date()).times;
    const dict = dictionaries[lang] as Record<string, string>;
    const labelFor = (p: PrayerName): string => dict[p] ?? p;
    void schedulePrayerNotifications({
      times,
      title: dict.prayerTime ?? 'Prayer time',
      bodyFor: labelFor,
      silenceLabel: dict.silenceAdhan ?? 'Silence',
      isMuted: () => false,
      adhanId,
    });
  }, [ready, notifEnabled, notifPerm, resolveTimes, lang, adhanId]);

  const value = useMemo<AppCtx>(
    () => ({
      ready,
      lang,
      setLang,
      t: (k: StringKey) => (dictionaries[lang] as Record<string, string>)[k] ?? k,
      theme,
      setTheme,
      coords,
      city,
      geoStatus,
      refreshLocation,
      onboarded,
      setOnboarded,
      method,
      setMethod,
      madhab,
      setMadhab,
      adjustments,
      setAdjustment,
      applyIraqPreset,
      resetAdjustments,
      adhanId,
      setAdhanId,
      notifEnabled,
      notifPerm,
      enableNotifications,
      disableNotifications,
      getTimes,
      timesSource,
      bangCityName: bangMeta?.nameKu ?? null,
    }),
    [
      ready, lang, setLang, theme, setTheme, coords, city, geoStatus, refreshLocation,
      onboarded, setOnboarded, method, setMethod, madhab, setMadhab,
      adjustments, setAdjustment, applyIraqPreset, resetAdjustments, adhanId, setAdhanId,
      notifEnabled, notifPerm, enableNotifications, disableNotifications, getTimes,
      timesSource, bangMeta,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
