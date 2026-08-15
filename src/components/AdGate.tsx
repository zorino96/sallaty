'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { hideBanner, showBanner } from '@/lib/ads';
import { nowPlaying, subscribePlayback } from '@/lib/adhanPlayer';

/**
 * Where a banner may never appear.
 *
 *   /guide, /onboarding — the first-run flow, which must stay clean
 *
 * Every other screen shows one small banner pinned below the navigation bar —
 * never a full-screen, interstitial or interrupting format, and never anything
 * that covers content. The bar is lifted clear of it (see --ad-h in
 * globals.css) so no tap ever lands on an advert by accident.
 *
 * The adhan is still protected: while it is sounding, every banner is hidden
 * app-wide, whatever screen the user is on.
 */
const AD_FREE = [
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
