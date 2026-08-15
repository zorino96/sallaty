'use client';

import { useEffect, useState } from 'react';
import { Square } from 'lucide-react';
import { useApp } from '@/lib/AppProvider';
import { nowPlaying, stopAdhan, subscribePlayback } from '@/lib/adhanPlayer';
import { trackById } from '@/data/adhanTracks';

export default function NowPlayingBar() {
  const { t, lang } = useApp();
  const [currentId, setCurrentId] = useState<string | null>(() => nowPlaying());

  useEffect(() => subscribePlayback(setCurrentId), []);

  if (!currentId) return null;
  const track = trackById(currentId);
  const label = track ? (lang === 'ar' ? track.ar : track.ku) : '';

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 76px + var(--ad-h))' }}
    >
      <button
        onClick={stopAdhan}
        className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-gold-500 px-4 py-2.5 text-white shadow-gold transition active:scale-95"
        aria-label={t('silenceAdhan')}
      >
        <Square size={14} fill="currentColor" className="opacity-90" />
        <span className="text-[12px] font-semibold leading-tight">
          {t('silenceAdhan')}
          {label && <span className="opacity-80"> · {label}</span>}
        </span>
        <span className="relative flex h-2 w-2 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
      </button>
    </div>
  );
}
