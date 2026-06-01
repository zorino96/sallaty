'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Horizontal swipe navigation across the five primary tabs.
// Recovered from layout-ad20fe8bb46e279e.js. RTL: swipe-left = "forward in array".
const TABS = ['/', '/qibla', '/mosques', '/habits', '/settings'] as const;

export default function SwipeNav() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const target = e.target as Element | null;
      if (target?.closest?.('[data-swipe-ignore]')) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    };

    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) < 60 || Math.abs(dy) > 0.6 * Math.abs(dx)) return;
      const idx = TABS.indexOf(pathname as (typeof TABS)[number]);
      if (idx < 0) return;
      const next = dx < 0 ? idx + 1 : idx - 1;
      if (next < 0 || next >= TABS.length) return;
      router.push(TABS[next]);
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [pathname, router]);

  return null;
}
