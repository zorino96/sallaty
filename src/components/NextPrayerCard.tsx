'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import { formatCountdown, formatTime, nextPrayer, skyPeriodForPrayer } from '@/lib/prayerTimes';
import SkyContainer from './SkyContainer';
import type { PrayerName } from '@/lib/types';

const I18N_KEY: Record<Exclude<PrayerName, 'none'>, string> = {
  fajr: 'fajr',
  sunrise: 'sunrise',
  dhuhr: 'dhuhr',
  asr: 'asr',
  maghrib: 'maghrib',
  isha: 'isha',
};

export default function NextPrayerCard() {
  const { t, getTimes } = useApp();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const times = getTimes(now);
  const upcoming = nextPrayer(now, times);
  const period = skyPeriodForPrayer(upcoming.name);
  const ms = upcoming.at.getTime() - now.getTime();
  const tKey = I18N_KEY[upcoming.name as Exclude<PrayerName, 'none'>] as Parameters<typeof t>[0];

  return (
    <SkyContainer forKey={period} className="rounded-3xl text-white shadow-glass">
      <div className="flex items-center justify-between px-6 pt-5">
        <div className="text-[12px] tracking-[0.2em] opacity-80">{t('nextPrayer')}</div>
        <div className="text-[12px] opacity-80 tabular">{formatTime(upcoming.at)}</div>
      </div>
      <div className="px-6 pt-2 pb-6">
        <div className="text-3xl font-bold leading-tight">{t(tKey)}</div>
        <div className="mt-1 text-[13px] opacity-80">
          {t('timeLeft')} · <span className="tabular">{formatCountdown(ms)}</span>
        </div>
      </div>
    </SkyContainer>
  );
}
