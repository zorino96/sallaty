'use client';

import { useEffect, useState } from 'react';
import StarEmblem from './StarEmblem';
import { skyPeriodForHour } from '@/lib/prayerTimes';
import type { SkyPeriod } from '@/lib/types';

// Recovered from page-ccfbd1f73d6e7dbc.js — per-period background, emblem color, and labels.
const PERIODS: Record<SkyPeriod, { bg: string; emblem: string; ku: string; ar: string }> = {
  fajr:    { bg: 'bg-sky-fajr',    emblem: '#E9D7B7', ku: 'بەیانی',    ar: 'الفجر' },
  shuruq:  { bg: 'bg-sky-shuruq',  emblem: '#FFFFFF', ku: 'خۆرهەڵات', ar: 'الشروق' },
  dhuhr:   { bg: 'bg-sky-dhuhr',   emblem: '#FFFAE6', ku: 'نیوەڕۆ',    ar: 'الظهر' },
  asr:     { bg: 'bg-sky-asr',     emblem: '#FFF1D3', ku: 'عەسر',     ar: 'العصر' },
  maghrib: { bg: 'bg-sky-maghrib', emblem: '#FBE3CA', ku: 'مەغریب',   ar: 'المغرب' },
  isha:    { bg: 'bg-sky-isha',    emblem: '#C9B98E', ku: 'خەفتن',    ar: 'العشاء' },
};

type Props = {
  forKey?: SkyPeriod;
  showEmblem?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function SkyContainer({ forKey, showEmblem = true, className = '', children }: Props) {
  const [period, setPeriod] = useState<SkyPeriod>(forKey ?? 'dhuhr');

  useEffect(() => {
    if (forKey) {
      setPeriod(forKey);
      return;
    }
    const tick = () => setPeriod(skyPeriodForHour(new Date().getHours()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [forKey]);

  const meta = PERIODS[period];

  return (
    <div className={`relative overflow-hidden ${meta.bg} ${className}`}>
      {showEmblem && (
        <>
          <div className="pointer-events-none absolute -left-12 -top-10 opacity-30 animate-spin-slow">
            <StarEmblem size={260} color={meta.emblem} />
          </div>
          <div className="pointer-events-none absolute -right-16 bottom-8 opacity-20">
            <StarEmblem size={180} color={meta.emblem} />
          </div>
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
