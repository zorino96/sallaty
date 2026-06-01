'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { formatTime, hijriDate, hijriDateShort } from '@/lib/prayerTimes';

function vibrate(p: number): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(p);
}

export default function CalendarPage() {
  const { t, lang, getTimes } = useApp();
  const [cursor, setCursor] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const days = useMemo(() => {
    const out: Date[] = [];
    const month = cursor.getMonth();
    const walker = new Date(cursor);
    while (walker.getMonth() === month) {
      out.push(new Date(walker));
      walker.setDate(walker.getDate() + 1);
    }
    return out;
  }, [cursor]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'ar-IQ', {
        month: 'long',
        year: 'numeric',
      }).format(cursor),
    [cursor, lang],
  );

  const hijriLabel = useMemo(() => hijriDate(cursor, lang), [cursor, lang]);

  const todayKey = new Date().toDateString();

  const shiftMonth = (delta: number): void => {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + delta);
    setCursor(next);
    vibrate(8);
  };

  const goToday = (): void => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    setCursor(d);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader
        title={t('calendarTitle')}
        subtitle={t('calendarSub')}
        right={
          <button
            onClick={goToday}
            className="surface rounded-full px-3 py-1.5 text-[10px] uppercase tracking-widest transition active:scale-95"
          >
            {t('today')}
          </button>
        }
      />

      <section className="px-5">
        <div className="surface flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="previous month"
            className="grid h-8 w-8 place-items-center rounded-full bg-cream-100 active:scale-90 dark:bg-teal-800"
          >
            <ChevronRight size={14} className="rtl:rotate-180" />
          </button>
          <div className="text-center leading-tight">
            <div className="font-rabar text-[14px] font-semibold">{monthLabel}</div>
            {hijriLabel && (
              <div className="text-[10.5px] text-gold-700 dark:text-gold-400">{hijriLabel}</div>
            )}
          </div>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="next month"
            className="grid h-8 w-8 place-items-center rounded-full bg-cream-100 active:scale-90 dark:bg-teal-800"
          >
            <ChevronLeft size={14} className="rtl:rotate-180" />
          </button>
        </div>
      </section>

      <section className="px-5 pt-3 pb-4">
        <div className="surface overflow-hidden rounded-2xl">
          <div
            className="grid items-center gap-1 bg-cream-100 px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-ink-800/55 dark:bg-teal-800/70 dark:text-cream-100/55"
            style={{ gridTemplateColumns: '44px minmax(0,1fr) repeat(5, minmax(0,1fr))' }}
          >
            <div className="text-center">{t('dayShort')}</div>
            <div className="text-center">{t('hijriShort')}</div>
            <div className="text-center">{t('fajr')}</div>
            <div className="text-center">{t('dhuhr')}</div>
            <div className="text-center">{t('asr')}</div>
            <div className="text-center">{t('maghrib')}</div>
            <div className="text-center">{t('isha')}</div>
          </div>
          {days.map((d) => {
            const isToday = d.toDateString() === todayKey;
            const times = getTimes(d);
            const weekday = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'ar-IQ', {
              weekday: 'short',
            }).format(d);
            return (
              <div
                key={d.toDateString()}
                className={
                  'tabular grid items-center gap-1 border-t px-2 py-2 text-[11px] ' +
                  (isToday ? 'bg-gold-500/10' : '')
                }
                style={{
                  gridTemplateColumns: '44px minmax(0,1fr) repeat(5, minmax(0,1fr))',
                  borderColor: 'var(--line)',
                }}
              >
                <div className="text-center leading-tight">
                  <div className={'font-semibold ' + (isToday ? 'text-gold-700 dark:text-gold-400' : '')}>
                    {d.getDate()}
                  </div>
                  <div className="text-[9.5px] opacity-55">{weekday}</div>
                </div>
                <div className="text-center text-[10px] leading-tight opacity-70">
                  {hijriDateShort(d, lang)}
                </div>
                <div className="text-center">{formatTime(times.fajr)}</div>
                <div className="text-center">{formatTime(times.dhuhr)}</div>
                <div className="text-center">{formatTime(times.asr)}</div>
                <div className="text-center">{formatTime(times.maghrib)}</div>
                <div className="text-center">{formatTime(times.isha)}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}
