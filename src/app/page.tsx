'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Bell,
  BellOff,
  BookMarked,
  BookOpen,
  CalendarDays,
  Compass,
  Flame,
  Gauge,
  GraduationCap,
  HandHeart,
  Heart,
  Loader2,
  MapPin,
  MapPinned,
  ScrollText,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import FeatureCard from '@/components/FeatureCard';
import NextPrayerCard from '@/components/NextPrayerCard';
import PrayerRow from '@/components/PrayerRow';
import { useApp } from '@/lib/AppProvider';
import { hijriDate } from '@/lib/prayerTimes';

export default function Home() {
  const {
    t,
    lang,
    city,
    geoStatus,
    refreshLocation,
    getTimes,
    onboarded,
    notifEnabled,
    notifPerm,
    enableNotifications,
    disableNotifications,
  } = useApp();
  const router = useRouter();

  // First-run users → /onboarding. Mirrors the original APK behaviour.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('selati.onboarded') === 'true';
    if (!onboarded && !stored) router.replace('/onboarding');
  }, [onboarded, router]);

  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const times = getTimes(now);
  const hijri = hijriDate(now, lang);
  const notifOn = notifEnabled && notifPerm === 'granted';
  const locationLabel =
    geoStatus === 'locating' ? t('locating')
    : geoStatus === 'denied' ? t('locationDenied')
    : city ?? t('locationAuto');

  return (
    <main
      className="flex min-h-[100dvh] flex-col"
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center justify-between px-5 pb-2 pt-2">
        <Link
          href="/settings"
          aria-label={t('settings')}
          className="grid h-10 w-10 place-items-center rounded-full surface transition active:scale-90"
        >
          <Settings size={16} />
        </Link>
        <div className="text-center leading-tight">
          <div className="font-rabar text-[15px] font-semibold">{t('appName')}</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-ink-800/55 dark:text-cream-100/55">
            {t('todaysPrayers')}
          </div>
          {hijri && (
            <div className="mt-0.5 text-[10.5px] text-gold-700 dark:text-gold-400">{hijri}</div>
          )}
        </div>
        <Link
          href="/habits"
          aria-label={t('habits')}
          className="grid h-10 w-10 place-items-center rounded-full surface transition active:scale-90"
        >
          <Activity size={16} />
        </Link>
      </div>

      <section className="px-5">
        <NextPrayerCard />
      </section>

      <section className="px-5 pt-3">
        <button
          onClick={() => {
            if (notifOn) disableNotifications();
            else void enableNotifications();
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(8);
          }}
          disabled={notifPerm === 'denied' || notifPerm === 'unsupported'}
          aria-pressed={notifOn}
          className={
            'surface flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-2.5 transition active:scale-[0.99] ' +
            (notifPerm === 'denied' || notifPerm === 'unsupported' ? 'opacity-60' : '')
          }
        >
          <span className="flex items-center gap-2.5">
            <span
              className={
                'grid h-9 w-9 place-items-center rounded-full ' +
                (notifOn ? 'bg-gold-500 text-white shadow-gold' : 'bg-cream-100 dark:bg-teal-800 text-gold-600')
              }
            >
              {notifOn ? <Bell size={16} /> : <BellOff size={16} />}
            </span>
            <span className="text-[13.5px] font-semibold leading-tight">
              {t('notifications')}
              <span className="block text-[10.5px] font-normal text-ink-800/55 dark:text-cream-100/55">
                {notifPerm === 'denied'
                  ? t('notifDenied')
                  : notifPerm === 'unsupported'
                  ? '—'
                  : t(notifOn ? 'notifEnabledLabel' : 'notifDisabled')}
              </span>
            </span>
          </span>
          <span
            className={
              'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ' +
              (notifOn ? 'bg-gold-500' : 'bg-cream-200 dark:bg-teal-900')
            }
          >
            <span
              className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all"
              style={{ insetInlineStart: notifOn ? 'calc(100% - 26px)' : '2px' }}
            />
          </span>
        </button>
      </section>

      <section className="px-5 pt-4">
        <div className="flex items-center justify-end pb-2">
          <button
            onClick={refreshLocation}
            disabled={geoStatus === 'locating'}
            aria-label={t('refreshLocation')}
            className="flex items-center gap-1 text-[11px] text-ink-800/55 dark:text-cream-100/55 transition active:scale-95 disabled:opacity-60 max-w-[200px]"
          >
            {geoStatus === 'locating' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <MapPin size={12} />
            )}
            <span className="truncate">{locationLabel}</span>
          </button>
        </div>
        <div className="space-y-2">
          {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((name) => (
            <PrayerRow key={name} name={name} time={times[name]} />
          ))}
        </div>
      </section>

      {/* Quran hero card — the highest-priority section on the home page */}
      <section className="px-5 pt-5">
        <Link
          href="/quran"
          className="surface relative flex items-center gap-4 overflow-hidden rounded-3xl px-5 py-4 transition active:scale-[0.99]"
        >
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-gold">
            <ScrollText size={26} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-rabar text-[16px] font-bold leading-tight">{t('quran')}</div>
            <div className="mt-0.5 truncate text-[11px] text-ink-800/55 dark:text-cream-100/55">
              {t('quranSub')}
            </div>
          </div>
          <svg viewBox="0 0 100 100" className="absolute -left-6 -bottom-6 h-24 w-24 opacity-10" aria-hidden="true">
            <g fill="currentColor">
              <polygon points="50,5 60,40 95,40 67,60 78,95 50,73 22,95 33,60 5,40 40,40" />
            </g>
          </svg>
        </Link>
      </section>

      <section className="px-5 pt-3">
        <div className="grid grid-cols-2 auto-rows-fr gap-2">
          <FeatureCard href="/control"       icon={Gauge}          label={t('control')}      hint={t('controlSub')}      accent="gold" />
          <FeatureCard href="/calendar"      icon={CalendarDays}   label={t('calendarTitle')} hint={t('calendarSub')}     accent="teal" />
          <FeatureCard href="/qibla"         icon={Compass}        label={t('qibla')}        hint={t('facingQibla')} />
          <FeatureCard href="/mosques"       icon={MapPinned}      label={t('mosques')}      hint={t('nearestMosque')} />
          <FeatureCard href="/habits"        icon={Flame}          label={t('monthHeatmap')} hint={t('congregationLog')} />
          <FeatureCard href="/adhkar"        icon={BookOpen}       label={t('adhkar')}       hint={t('morningAdhkar')}   accent="gold" />
          <FeatureCard href="/dhikr"         icon={Sparkles}       label={t('dhikr')}        hint={t('chooseDhikr')}     accent="teal" />
          <FeatureCard href="/learn"         icon={GraduationCap}  label={t('learnPrayer')}  hint={t('learnPrayerSub')} />
          <FeatureCard href="/prayer-types"  icon={BookMarked}     label={t('prayerTypes')}  hint={t('prayerTypesSub')} />
          <FeatureCard href="/adab"          icon={Heart}          label={t('adabKids')}     hint={t('adabKidsSub')}     accent="gold" />
          <FeatureCard href="/azkar"         icon={HandHeart}      label={t('azkarCollection')} hint={t('azkarCollectionSub')} accent="teal" />
        </div>
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}
