'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import { formatCountdown, formatTime, nextPrayer, skyPeriodForPrayer } from '@/lib/prayerTimes';
import SkyContainer from './SkyContainer';
import CelestialArc from './CelestialArc';
import StarEmblem from './StarEmblem';
import type { PrayerName } from '@/lib/types';

const I18N_KEY: Record<Exclude<PrayerName, 'none'>, string> = {
  fajr: 'fajr', sunrise: 'sunrise', dhuhr: 'dhuhr', asr: 'asr', maghrib: 'maghrib', isha: 'isha',
};

// Arabic name for the calligraphic display (shown in both languages — the
// Qur'anic name is universally read).
const AR_NAME: Record<Exclude<PrayerName, 'none'>, string> = {
  fajr: 'ٱلْفَجْر', sunrise: 'ٱلشُّرُوق', dhuhr: 'ٱلظُّهْر', asr: 'ٱلْعَصْر', maghrib: 'ٱلْمَغْرِب', isha: 'ٱلْعِشَاء',
};

export default function NextPrayerCard() {
  const { t, getTimes } = useApp();
  // `now` stays null until mount, so SSR and the first client render are
  // identical (the arc's sun position is sub-second sensitive). Time-dependent
  // geometry renders only on the client.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return (
      <SkyContainer forKey="isha" className="rounded-[30px] text-ivory-100 shadow-glass">
        <div className="pointer-events-none absolute inset-[6px] rounded-[24px] ring-1 ring-[rgba(251,239,198,0.28)]" />
        <div className="relative grid min-h-[300px] place-items-center">
          <StarEmblem size={92} color="#C9D4FF" glow />
        </div>
      </SkyContainer>
    );
  }

  const times = getTimes(now);
  const upcoming = nextPrayer(now, times);
  const period = skyPeriodForPrayer(upcoming.name);
  const ms = upcoming.at.getTime() - now.getTime();
  const key = upcoming.name as Exclude<PrayerName, 'none'>;
  const tKey = I18N_KEY[key] as Parameters<typeof t>[0];

  return (
    <SkyContainer forKey={period} className="rounded-[30px] text-ivory-100 shadow-glass">
      {/* gilded inner frame */}
      <div className="pointer-events-none absolute inset-[6px] rounded-[24px] ring-1 ring-[rgba(251,239,198,0.28)]" />

      <div className="relative px-5 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] uppercase tracking-kashida text-ivory-100/80">{t('nextPrayer')}</span>
          <span className="clk text-[13px] text-ivory-100/85 text-shadow-sky">{formatTime(upcoming.at)}</span>
        </div>
      </div>

      {/* the living dome */}
      <div className="relative -mt-1 px-2">
        <CelestialArc times={times} now={now} nextName={upcoming.name} />
      </div>

      {/* name + countdown nestled under the arc */}
      <div className="relative -mt-10 px-6 pb-6 text-center">
        <div className="gild gild-shimmer font-script text-[42px] leading-none text-shadow-sky" dir="rtl">
          {AR_NAME[key]}
        </div>
        <div className="mt-2 font-rabar text-[14px] font-semibold tracking-wide text-ivory-100/85">
          {t(tKey)}
        </div>

        <div className="mx-auto mt-4 flex w-fit items-center gap-3 rounded-full border border-[rgba(251,239,198,0.22)] bg-black/15 px-5 py-2 backdrop-blur-sm">
          <span className="text-[10px] uppercase tracking-[0.25em] text-ivory-100/70">{t('timeLeft')}</span>
          <span className="clk text-[22px] font-semibold leading-none text-ivory-100 text-shadow-sky" suppressHydrationWarning>
            {formatCountdown(ms)}
          </span>
        </div>
      </div>
    </SkyContainer>
  );
}
