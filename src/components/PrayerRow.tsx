'use client';

import { useApp } from '@/lib/AppProvider';
import { formatTime } from '@/lib/prayerTimes';
import type { PrayerName } from '@/lib/types';

type Props = {
  name: Exclude<PrayerName, 'none' | 'sunrise'>;
  time: Date;
  current?: boolean;
};

export default function PrayerRow({ name, time, current }: Props) {
  const { t } = useApp();
  return (
    <div
      className={
        'relative flex items-center justify-between rounded-2xl px-4 py-3.5 transition surface ' +
        (current ? 'ring-1 ring-gold-500/50' : '')
      }
    >
      <div className="flex items-center gap-3">
        <div className="text-[16px] font-semibold">{t(name)}</div>
      </div>
      <div className="tabular text-[16px] font-semibold opacity-90">{formatTime(time)}</div>
    </div>
  );
}
