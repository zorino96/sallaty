'use client';

import { CloudSun, Moon, Sun, Sunrise, Sunset, type LucideIcon } from 'lucide-react';
import { useApp } from '@/lib/AppProvider';
import { formatTime } from '@/lib/prayerTimes';
import type { PrayerName } from '@/lib/types';

type Key = Exclude<PrayerName, 'none' | 'sunrise'>;

type Props = {
  name: Key;
  time: Date;
  current?: boolean;
};

const META: Record<Key, { icon: LucideIcon; ar: string; tint: string }> = {
  fajr:    { icon: Sunrise, ar: 'ٱلْفَجْر',   tint: 'text-jewel-violet bg-jewel-violet/12' },
  dhuhr:   { icon: Sun,     ar: 'ٱلظُّهْر',   tint: 'text-lapis-500 bg-lapis-500/12 dark:text-lapis-300' },
  asr:     { icon: CloudSun,ar: 'ٱلْعَصْر',   tint: 'text-jewel-amber bg-jewel-amber/12' },
  maghrib: { icon: Sunset,  ar: 'ٱلْمَغْرِب', tint: 'text-jewel-garnet bg-jewel-garnet/12' },
  isha:    { icon: Moon,    ar: 'ٱلْعِشَاء',  tint: 'text-lapis-400 bg-lapis-700/15' },
};

export default function PrayerRow({ name, time, current }: Props) {
  const { t } = useApp();
  const { icon: Icon, ar, tint } = META[name];

  return (
    <div
      className={
        'surface relative flex items-center justify-between overflow-hidden rounded-2xl px-3.5 py-3 transition ' +
        (current ? 'ring-1 ring-gold-500/55 shadow-glow' : '')
      }
    >
      {current && (
        <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-gradient-to-b from-gold-300 to-gold-600" />
      )}
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tint}`}>
          <Icon size={17} strokeWidth={2} />
        </span>
        <div className="leading-tight">
          <div className="text-[15px] font-bold">{t(name)}</div>
          <div className="font-naskh text-[12px] text-gold-700/80 dark:text-gold-300/70">{ar}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {current && <span className="dot animate-halo" />}
        <span className="clk text-[18px] font-semibold text-ink-800 dark:text-ivory-100">{formatTime(time)}</span>
      </div>
    </div>
  );
}
