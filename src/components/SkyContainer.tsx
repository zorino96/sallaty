'use client';

import { useEffect, useState } from 'react';
import StarEmblem from './StarEmblem';
import { skyPeriodForHour } from '@/lib/prayerTimes';
import type { SkyPeriod } from '@/lib/types';

// Sky of the hour: jewel-toned gradient + a slowly-turning girih rosette of
// illumination, a grain veil, and a vignette to seat the content.
const PERIODS: Record<SkyPeriod, { cls: string; emblem: string }> = {
  fajr:    { cls: 'sky-fajr',    emblem: '#F2BBC6' },
  shuruq:  { cls: 'sky-shuruq',  emblem: '#FFE7B0' },
  dhuhr:   { cls: 'sky-dhuhr',   emblem: '#FFFFFF' },
  asr:     { cls: 'sky-asr',     emblem: '#FFE2A6' },
  maghrib: { cls: 'sky-maghrib', emblem: '#FFC79E' },
  isha:    { cls: 'sky-isha',    emblem: '#C9D4FF' },
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
    <div className={`relative overflow-hidden ${meta.cls} ${className}`}>
      {showEmblem && (
        <>
          <div className="pointer-events-none absolute -left-20 -top-24 opacity-[0.22] animate-spin-slow">
            <StarEmblem size={300} color={meta.emblem} />
          </div>
          <div className="pointer-events-none absolute -right-16 -bottom-16 opacity-[0.16] animate-spin-rev">
            <StarEmblem size={200} color={meta.emblem} variant="star" />
          </div>
        </>
      )}
      {/* grain + vignette */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: 'var(--grainurl)' }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: 'inset 0 -40px 60px -30px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.16)' }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
