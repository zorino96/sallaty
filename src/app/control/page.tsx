'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bell, Check, Database, Globe, Info, LoaderCircle, MapPin, Play,
  RefreshCw, Volume2, Wifi, WifiOff,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { formatTime } from '@/lib/prayerTimes';
import { currentStreak, getCheckins, subscribeCheckins, trackedDays } from '@/lib/habits';
import { adhanTracks, audioAttributions } from '@/data/adhanTracks';
import { playAdhan, stopAdhan } from '@/lib/adhanPlayer';
import { fireTestNotification } from '@/lib/notifications';

const APP_VERSION = '0.2.0';

export default function ControlPage() {
  const {
    t, lang, city, coords, geoStatus, refreshLocation,
    adhanId, setAdhanId, notifEnabled, notifPerm, enableNotifications, getTimes,
    timesSource, bangCityName,
  } = useApp();

  const [now, setNow] = useState<Date>(() => new Date());
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  const [screen, setScreen] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [, forceTick] = useState(0);
  const [checkinCount, setCheckinCount] = useState(0);
  const [habitDays, setHabitDays] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setCheckinCount(getCheckins().length);
      setHabitDays(trackedDays().length);
      setStreak(currentStreak());
      forceTick((x) => x + 1);
    };
    refresh();
    const unsubCheckins = subscribeCheckins(refresh);
    const tick = setInterval(() => setNow(new Date()), 30_000);
    const onOnline  = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onResize  = () => setScreen({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('resize', onResize);
    return () => {
      unsubCheckins();
      clearInterval(tick);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const times = useMemo(() => getTimes(now), [getTimes, now]);

  const storageUsage = useMemo(() => {
    if (typeof localStorage === 'undefined') return 0;
    let bytes = 0;
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith('selati.')) {
        bytes += k.length + (localStorage.getItem(k)?.length ?? 0);
      }
    }
    return bytes;
  }, [checkinCount, habitDays]);

  const permLabel =
    geoStatus === 'granted'     ? t('permissionGranted')
    : geoStatus === 'denied'    ? t('permissionDenied')
    : geoStatus === 'locating'  ? t('locating')
    : t('permissionNotAsked');

  const testNotification = async (): Promise<void> => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(8);
    if (notifPerm !== 'granted') await enableNotifications();
    // On native this arms a real alarm ~5s out (lock the screen to verify the
    // adhan + screen-wake). On web it plays in-page. No immediate in-app play
    // here, so the native test isn't doubled.
    await fireTestNotification(t('prayerTime'), t('testNotification'), adhanId);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={t('control')} subtitle={t('controlSub')} />

      <section className="space-y-2 px-5 pb-6">
        <Section icon={<Info size={16} />} title={t('appInfo')}>
          <Row label={t('version')}       value={APP_VERSION} />
          <Row label={t('dataYear')}      value={String(new Date().getFullYear())} />
          <Row label={t('citiesCovered')} value="—" />
          <Row label={t('bundledDays')}   value="—" />
        </Section>

        <Section
          icon={<MapPin size={16} />}
          title={t('locationStatus')}
          action={
            <button
              onClick={refreshLocation}
              disabled={geoStatus === 'locating'}
              aria-label={t('refreshLocation')}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-500 text-white shadow-gold transition active:scale-90 disabled:opacity-60"
            >
              {geoStatus === 'locating'
                ? <LoaderCircle size={14} className="animate-spin" />
                : <RefreshCw size={14} />}
            </button>
          }
        >
          <Row label={t('detectedCity')} value={city ?? '—'} />
          <Row
            label="lat / lng"
            value={
              <span dir="ltr" className="tabular">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>
            }
          />
          <Row label={t('permissionGranted')} value={permLabel} />
        </Section>

        <Section icon={<Bell size={16} />} title={t('todayTimes')}>
          <Row
            label={t('timesSource')}
            value={timesSource === 'bang'
              ? `${t('sourceBundled')}${bangCityName ? ` · ${bangCityName}` : ''}`
              : t('sourceCalculated')}
          />
          {(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((p) => (
            <Row
              key={p}
              label={t(p)}
              value={<span className="tabular">{formatTime(times[p])}</span>}
            />
          ))}
        </Section>

        <Section
          icon={<Bell size={16} />}
          title={t('notificationStatus')}
          action={
            <button
              onClick={testNotification}
              className="shrink-0 rounded-full bg-gold-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-gold transition active:scale-95"
            >
              {t('testNotification')}
            </button>
          }
        >
          <Row label={t('notifEnabledLabel')} value={notifEnabled ? t('notifEnabledLabel') : t('notifDisabled')} />
          <Row
            label={t('permissionGranted')}
            value={
              notifPerm === 'granted'    ? t('permissionGranted')
              : notifPerm === 'denied'   ? t('permissionDenied')
              : notifPerm === 'unsupported' ? t('permissionUnsupported')
              : t('permissionNotAsked')
            }
          />
        </Section>

        <Section
          icon={<Volume2 size={16} />}
          title={t('audioSettings')}
          action={
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => playAdhan(adhanId)}
                aria-label={t('testAdhan')}
                className="grid h-9 w-9 place-items-center rounded-full bg-gold-500 text-white shadow-gold transition active:scale-90"
              >
                <Play size={13} />
              </button>
              <button
                onClick={stopAdhan}
                aria-label="stop"
                className="grid h-9 w-9 place-items-center rounded-full bg-cream-100 transition active:scale-90 dark:bg-teal-800"
              >
                ⏹
              </button>
            </div>
          }
        >
          <div className="space-y-1">
            {adhanTracks.map((a) => {
              const selected = a.id === adhanId;
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    setAdhanId(a.id);
                    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(6);
                  }}
                  aria-pressed={selected}
                  className={
                    'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-start transition active:scale-[0.99] ' +
                    (selected
                      ? 'bg-gold-500 text-white shadow-gold'
                      : 'bg-cream-100 text-ink-800 dark:bg-teal-800/60 dark:text-cream-100')
                  }
                >
                  <span className="min-w-0 truncate text-[12.5px] font-semibold">
                    {lang === 'ar' ? a.ar : a.ku}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {a.maqam && (
                      <span
                        className={
                          'rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold ' +
                          (selected ? 'bg-white/25' : 'bg-gold-500/15 text-gold-700 dark:text-gold-300')
                        }
                      >
                        {a.maqam}
                      </span>
                    )}
                    <span
                      className={
                        'rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold ' +
                        (selected
                          ? 'bg-white/25'
                          : 'bg-cream-200 text-ink-800/60 dark:bg-teal-900/60 dark:text-cream-100/60')
                      }
                    >
                      {a.category === 'adhan' ? t('realAdhans') : t('alertChimes')}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {audioAttributions.length > 0 && (
            <div className="mt-2 space-y-1 px-1 text-[9.5px] leading-4 text-ink-800/45 dark:text-cream-100/40" dir="ltr">
              {audioAttributions.map((a, i) => (
                <div key={i}>
                  {a.text}
                  {(a.licenseUrl || a.sourceUrl) && (
                    <>
                      {' · '}
                      {a.licenseUrl && (
                        <a href={a.licenseUrl} target="_blank" rel="noreferrer" className="underline">
                          license
                        </a>
                      )}
                      {a.licenseUrl && a.sourceUrl && ' · '}
                      {a.sourceUrl && (
                        <a href={a.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                          source
                        </a>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Where the app's content comes from — shown so every source is credited. */}
        <Section icon={<Database size={16} />} title={lang === 'ar' ? 'المصادر' : 'سەرچاوەکان'}>
          <div className="space-y-2 px-1 py-1 text-[11px] leading-5 text-ink-800/60 dark:text-cream-100/55">
            <div>
              <div className="font-semibold text-ink-800/80 dark:text-cream-100/75">
                {lang === 'ar' ? 'أوقات الصلاة' : 'کاتەکانی نوێژ'}
              </div>
              <div dir="ltr">amozhgary.tv — official published schedule</div>
            </div>
            <div>
              <div className="font-semibold text-ink-800/80 dark:text-cream-100/75">
                {lang === 'ar' ? 'ترجمة القرآن الكردية' : 'وەرگێڕانی کوردیی قورئان'}
              </div>
              <div>تەفسیری ئاسان — بورهان محمد ئەمین</div>
              <div dir="ltr">Tafsiri Asan — Burhan Muhammad-Amin</div>
            </div>
            {/* Tanzil's licence is CC BY 3.0, and it asks for three specific
                things in return: the copyright notice reproduced, the source
                named, and a link back so readers can follow corrections to the
                text. Crediting "Tanzil.net" alone does not satisfy it. */}
            <div>
              <div className="font-semibold text-ink-800/80 dark:text-cream-100/75">
                {lang === 'ar' ? 'النص القرآني' : 'دەقی قورئان'}
              </div>
              <div dir="ltr">Uthmani script — Tanzil Project</div>
              <div dir="ltr" className="text-[10px] leading-4 opacity-75">
                Tanzil Quran Text Copyright © 2007–2021 Tanzil Project
                <br />
                License: Creative Commons Attribution 3.0 —{' '}
                <a
                  href="https://creativecommons.org/licenses/by/3.0/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  creativecommons.org/licenses/by/3.0
                </a>
                <br />
                <a href="https://tanzil.net" target="_blank" rel="noreferrer" className="underline">
                  tanzil.net
                </a>
              </div>
            </div>
          </div>
        </Section>

        <Section icon={<Check size={16} />} title={t('tracking')}>
          <Row label={t('checkInsCount')}   value={String(checkinCount)} />
          <Row label={t('habitsDaysCount')} value={String(habitDays)} />
          <Row label={t('streakCount')}     value={String(streak)} />
        </Section>

        <Section icon={<Database size={16} />} title={t('diagnostics')}>
          <Row
            label={t('onlineStatus')}
            value={
              <span
                className={
                  'inline-flex items-center gap-1 ' +
                  (online ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')
                }
              >
                {online ? <Wifi size={12} /> : <WifiOff size={12} />}
                {online ? t('online') : t('offline')}
              </span>
            }
          />
          <Row
            label={t('platform')}
            value={
              <span className="inline-flex items-center gap-1">
                <Globe size={12} />
                {t('web')}
              </span>
            }
          />
          <Row
            label={t('screenSize')}
            value={<span dir="ltr" className="tabular">{screen.w}×{screen.h}</span>}
          />
          <Row
            label={t('storageUsage')}
            value={
              <span dir="ltr" className="tabular">
                {(storageUsage / 1024).toFixed(1)} {t('kbUsed')}
              </span>
            }
          />
          <Row label={t('language')} value={lang} />
        </Section>
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}

function Section({
  icon, title, action, children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="surface rounded-2xl p-3">
      <div className="flex items-center justify-between gap-2 px-1 pb-2 text-[13px]">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream-100 text-gold-600 dark:bg-teal-800">
            {icon}
          </span>
          <span className="truncate font-semibold">{title}</span>
        </div>
        {action}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-cream-100 px-3 py-2 dark:bg-teal-800/60">
      <span className="shrink-0 text-[12px] text-ink-800/65 dark:text-cream-100/65">{label}</span>
      <span className="min-w-0 truncate text-[12.5px] font-semibold">{value}</span>
    </div>
  );
}
