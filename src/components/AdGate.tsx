'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { hideBanner, showBanner } from '@/lib/ads';
import { nowPlaying, subscribePlayback } from '@/lib/adhanPlayer';

/**
 * Where a banner may NEVER appear. The rule we hold ourselves to: no advert
 * beside revealed text, remembrance of God, or an act of worship in progress.
 *
 *   /quran     — the Qur'an itself (reader, search, bookmarks)
 *   /adhkar    — morning/evening adhkār
 *   /azkar     — situational adhkār
 *   /dhikr     — the dhikr counter (worship in progress)
 *   /learn     — how to pray, step by step
 *   /qibla     — facing the Kaaba
 *   /guide, /onboarding — first-run flow, must stay clean
 *
 * Everything else (home, calendar, habits, mosques, settings, articles) shows a
 * single small bottom banner — never a full-screen or interrupting format.
 */
const AD_FREE = [
  '/quran',
  '/adhkar',
  '/azkar',
  '/dhikr',
  '/learn',
  '/qibla',
  '/guide',
  '/onboarding',
];

function isAdFree(path: string): boolean {
  return AD_FREE.some((p) => path === p || path.startsWith(p + '/'));
}

export default function AdGate() {
  const pathname = usePathname();
  // While the adhan is sounding, no advert is shown anywhere in the app.
  const [adhanPlaying, setAdhanPlaying] = useState(false);

  useEffect(() => {
    setAdhanPlaying(nowPlaying() !== null);
    return subscribePlayback((id) => setAdhanPlaying(id !== null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const blocked = isAdFree(pathname ?? '/') || adhanPlaying;

    void (async () => {
      if (blocked) {
        await hideBanner();
        if (!cancelled) document.body.classList.remove('has-ad');
      } else {
        await showBanner();
        if (!cancelled) document.body.classList.add('has-ad');
      }
    })();

    return () => { cancelled = true; };
  }, [pathname, adhanPlaying]);

  return null;
}
