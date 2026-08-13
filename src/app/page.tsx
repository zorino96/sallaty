'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity, Bell, BellOff, BookMarked, BookOpen, CalendarDays, ChevronLeft, Compass, Flame,
  Gauge, GraduationCap, HandHeart, Heart, Loader2, MapPin, MapPinned,
  ScrollText, Settings, Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import FeatureCard from '@/components/FeatureCard';
import NextPrayerCard from '@/components/NextPrayerCard';
import PrayerRow from '@/components/PrayerRow';
import StarEmblem from '@/components/StarEmblem';
import { useApp } from '@/lib/AppProvider';
import { currentPrayer, hijriDate } from '@/lib/prayerTimes';
import { storage } from '@/lib/storage';

export default function Home() {
  const {
    t, lang, city, geoStatus, getTimes, onboarded,
    notifEnabled, notifPerm, enableNotifications, disableNotifications,
  } = useApp();
  const router = useRouter();

  // Open the city picker (in Settings) when the location bar is tapped.
  const goToCityPicker = (): void => {
    storage.set('openCityPicker', true);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(6);
    router.push('/settings');
  };

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
  const cur = currentPrayer(now, times);
  const hijri = hijriDate(now, lang);
  const notifOn = notifEnabled && notifPerm === 'granted';
  const locationLabel =
    geoStatus === 'locating' ? t('locating')
    : geoStatus === 'denied' ? t('locationDenied')
    : city ?? t('locationAuto');

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}>
      {/* ── crown bar ── */}
      <header className="animate-rise flex items-center justify-between px-5 pb-1 pt-2">
        <Link
          href="/settings"
          aria-label={t('settings')}
          className="surface grid h-10 w-10 place-items-center rounded-full text-gold-700 transition active:scale-90 dark:text-gold-300"
        >
          <Settings size={16} />
        </Link>

        <div className="flex flex-col items-center leading-none">
          <div className="flex items-center gap-2">
            <StarEmblem size={16} color="var(--gold)" variant="star" />
            <span className="gild gild-shimmer font-rabar text-[19px] font-bold">{t('appName')}</span>
            <StarEmblem size={16} color="var(--gold)" variant="star" />
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-kashida text-ink-800/50 dark:text-ivory-100/50">
            {t('todaysPrayers')}
          </div>
          {hijri && <div className="mt-1 font-naskh text-[12px] text-gold-700 dark:text-gold-300">{hijri}</div>}
        </div>

        <Link
          href="/habits"
          aria-label={t('habits')}
          className="surface grid h-10 w-10 place-items-center rounded-full text-gold-700 transition active:scale-90 dark:text-gold-300"
        >
          <Activity size={16} />
        </Link>
      </header>

      {/* ── the living hero ── */}
      <section className="animate-rise px-5 pt-2" style={{ animationDelay: '70ms' }}>
        <NextPrayerCard />
      </section>

      {/* ── notifications ── */}
      <section className="animate-rise px-5 pt-3" style={{ animationDelay: '150ms' }}>
        <button
          onClick={() => {
            if (notifOn) disableNotifications();
            else void enableNotifications();
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(8);
          }}
          disabled={notifPerm === 'denied' || notifPerm === 'unsupported'}
          aria-pressed={notifOn}
          className={
            'surface flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 transition active:scale-[0.99] ' +
            (notifPerm === 'denied' || notifPerm === 'unsupported' ? 'opacity-60' : '')
          }
        >
          <span className="flex items-center gap-3">
            <span
              className={
                'grid h-10 w-10 place-items-center rounded-full transition ' +
                (notifOn
                  ? 'bg-gradient-to-b from-gold-300 to-gold-600 text-ink-900 shadow-gold'
                  : 'bg-cream-100 text-gold-600 dark:bg-teal-800 dark:text-gold-300')
              }
            >
              {notifOn ? <Bell size={17} /> : <BellOff size={17} />}
            </span>
            <span className="text-start text-[13.5px] font-bold leading-tight">
              {t('notifications')}
              <span className="block text-[10.5px] font-normal text-ink-800/55 dark:text-ivory-100/55">
                {notifPerm === 'denied' ? t('notifDenied')
                  : notifPerm === 'unsupported' ? '—'
                  : t(notifOn ? 'notifEnabledLabel' : 'notifDisabled')}
              </span>
            </span>
          </span>
          <span className={'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ' + (notifOn ? 'bg-gold-500' : 'bg-cream-200 dark:bg-teal-900')}>
            <span className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all" style={{ insetInlineStart: notifOn ? 'calc(100% - 26px)' : '2px' }} />
          </span>
        </button>
      </section>

      {/* ── today's five ── */}
      <section className="animate-rise px-5 pt-4" style={{ animationDelay: '230ms' }}>
        {/* location selector → opens the city picker in Settings */}
        <button
          onClick={goToCityPicker}
          aria-label={t('chooseCity')}
          className="surface mb-2.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-start transition active:scale-[0.99]"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-300">
            {geoStatus === 'locating' ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-rabar text-[13px] font-bold leading-tight">{locationLabel}</span>
            <span className="block truncate text-[10px] font-semibold text-gold-700/85 dark:text-gold-300/85">{t('setLocationHint')}</span>
          </span>
          <ChevronLeft size={15} className="shrink-0 opacity-40 rtl:rotate-180" />
        </button>

        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-kashida text-ink-800/50 dark:text-ivory-100/50">{t('todaysPrayers')}</span>
        </div>
        <div className="space-y-2">
          {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((name) => (
            <PrayerRow key={name} name={name} time={times[name]} current={cur === name} />
          ))}
        </div>
      </section>

      {/* ── Qur'an — the illuminated frontispiece ── */}
      <section className="animate-rise px-5 pt-5" style={{ animationDelay: '320ms' }}>
        <Link
          href="/quran"
          className="surface relative flex items-center gap-4 overflow-hidden rounded-[18px] rounded-t-[28px] px-5 py-5 transition active:scale-[0.99]"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 opacity-[0.12] animate-spin-slow">
            <StarEmblem size={150} color="#C9A24A" />
          </div>
          <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-gold-300 to-gold-600 text-ink-900 shadow-gold">
            <ScrollText size={28} />
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="gild font-script text-[26px] leading-none" dir="rtl">ٱلْقُرْآن</div>
            <div className="mt-1 font-rabar text-[14px] font-bold">{t('quran')}</div>
            <div className="mt-0.5 truncate text-[11px] text-ink-800/55 dark:text-ivory-100/55">{t('quranSub')}</div>
          </div>
        </Link>
      </section>

      {/* ── the cabinet of features ── */}
      <section className="animate-rise px-5 pt-4" style={{ animationDelay: '400ms' }}>
        <div className="rule mb-3"><span className="block h-1.5 w-1.5 rotate-45 bg-current opacity-80" /></div>
        <div className="grid auto-rows-fr grid-cols-2 gap-2.5">
          <FeatureCard href="/control"      icon={Gauge}         label={t('control')}         hint={t('controlSub')}          accent="gold" />
          <FeatureCard href="/calendar"     icon={CalendarDays}  label={t('calendarTitle')}   hint={t('calendarSub')}         accent="teal" />
          <FeatureCard href="/qibla"        icon={Compass}       label={t('qibla')}           hint={t('facingQibla')} />
          <FeatureCard href="/mosques"      icon={MapPinned}     label={t('mosques')}         hint={t('nearestMosque')} />
          <FeatureCard href="/habits"       icon={Flame}         label={t('monthHeatmap')}    hint={t('congregationLog')} />
          <FeatureCard href="/adhkar"       icon={BookOpen}      label={t('adhkar')}          hint={t('morningAdhkar')}       accent="gold" />
          <FeatureCard href="/dhikr"        icon={Sparkles}      label={t('dhikr')}           hint={t('chooseDhikr')}         accent="teal" />
          <FeatureCard href="/learn"        icon={GraduationCap} label={t('learnPrayer')}     hint={t('learnPrayerSub')} />
          <FeatureCard href="/prayer-types" icon={BookMarked}    label={t('prayerTypes')}     hint={t('prayerTypesSub')} />
          <FeatureCard href="/azkar"        icon={HandHeart}     label={t('azkarCollection')} hint={t('azkarCollectionSub')}  accent="teal" />
          <FeatureCard href="/adab"         icon={Heart}         label={t('adabKids')}        hint={t('adabKidsSub')}         accent="gold" />
        </div>
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}
