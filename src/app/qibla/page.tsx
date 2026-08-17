'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Navigation2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import StarEmblem from '@/components/StarEmblem';
import { useApp } from '@/lib/AppProvider';
import { distanceToMeccaKm, qiblaBearing } from '@/lib/geolocation';

type PermState = 'granted' | 'needed' | 'denied' | 'unsupported';

type OrientationEventLike = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

type DeviceOrientationEventiOS = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

function vibrate(p: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(p);
}

export default function QiblaPage() {
  const { t, coords } = useApp();
  const [heading, setHeading] = useState<number | null>(null);
  const [perm, setPerm] = useState<PermState>('granted');
  // Mirrors `heading` for the mount effect, which must read it without
  // re-running and re-attaching everything on each compass tick.
  const headingRef = useRef<number | null>(null);

  const onOrientation = useCallback((event: Event): void => {
    const e = event as OrientationEventLike;
    const h = e.webkitCompassHeading != null
      ? e.webkitCompassHeading
      : e.alpha != null
        ? 360 - e.alpha
        : null;
    if (h != null) {
      headingRef.current = h;
      setHeading(h);
      // A reading arriving is the only reliable proof the compass is allowed;
      // there is no API to query the current permission state.
      setPerm('granted');
    }
  }, []);

  const attach = useCallback((): void => {
    window.addEventListener('deviceorientationabsolute', onOrientation, true);
    window.addEventListener('deviceorientation', onOrientation, true);
  }, [onOrientation]);

  const detach = useCallback((): void => {
    window.removeEventListener('deviceorientationabsolute', onOrientation, true);
    window.removeEventListener('deviceorientation', onOrientation, true);
  }, [onOrientation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const E = window.DeviceOrientationEvent as DeviceOrientationEventiOS | undefined;
    if (!E) {
      setPerm('unsupported');
      return;
    }

    // Always listen first. iOS remembers a granted compass permission for the
    // origin, so on every visit after the first the readings simply arrive and
    // the compass is live with nothing to tap. Assuming a prompt is needed just
    // because `requestPermission` exists is what put a button in front of the
    // compass on every single visit.
    attach();

    if (typeof E.requestPermission !== 'function') return detach;

    // iOS 13+ only grants the permission from inside a user gesture, so it
    // cannot be asked for on mount. Instead, arm the *next* tap anywhere on the
    // page — the user reaches for the compass anyway, and that touch is a valid
    // gesture. No dedicated button, no extra step.
    let settled = false;
    const ask = (): void => {
      if (settled) return;
      settled = true;
      void requestPermission();
    };
    // Only bother if nothing is arriving; a live compass needs no permission.
    const timer = window.setTimeout(() => {
      if (headingRef.current == null) {
        setPerm('needed');
        window.addEventListener('pointerdown', ask, { once: true, capture: true });
      }
    }, 800);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', ask, true);
      detach();
    };
    // requestPermission is stable for the life of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attach, detach]);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const E = window.DeviceOrientationEvent as DeviceOrientationEventiOS | undefined;
    if (!E?.requestPermission) return;
    try {
      const result = await E.requestPermission();
      if (result === 'granted') {
        setPerm('granted');
        attach();
      } else {
        setPerm('denied');
      }
    } catch {
      setPerm('denied');
    }
    vibrate(10);
  }, [attach]);

  const bearing = useMemo(() => qiblaBearing(coords), [coords]);
  const distance = useMemo(() => distanceToMeccaKm(coords), [coords]);
  const rotation = heading == null ? -bearing : bearing - heading;
  const aligned = heading != null && Math.abs(((bearing - heading + 540) % 360) - 180) < 4;

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader
        title={t('qibla')}
        subtitle={t('facingQibla')}
        right={
          <button
            onClick={() => {
              setHeading(null);
              setTimeout(() => { detach(); attach(); }, 50);
              vibrate([10, 30, 10]);
            }}
            aria-label="recalibrate"
            className="grid h-9 w-9 place-items-center rounded-full surface transition active:scale-90"
          >
            <Navigation2 size={14} />
          </button>
        }
      />

      <section className="px-5">
        <div className="surface rounded-3xl px-5 pt-6 pb-5">
          <div className="relative mx-auto aspect-square w-[88%]">
            {/* Outer chunky ring */}
            <div className="absolute inset-0 rounded-full border-[6px] border-cream-200 dark:border-teal-700" />
            {/* Inner hairline */}
            <div className="absolute inset-2 rounded-full border" style={{ borderColor: 'var(--line)' }} />
            {/* 60 tick marks, major every 5th */}
            <svg viewBox="0 0 100 100" className="absolute inset-0">
              {Array.from({ length: 60 }).map((_, i) => {
                const major = i % 5 === 0;
                return (
                  <line
                    key={i}
                    x1="50"
                    y1={major ? '8' : '10'}
                    x2="50"
                    y2={major ? '13' : '12'}
                    transform={`rotate(${6 * i} 50 50)`}
                    stroke="currentColor"
                    strokeOpacity={major ? '0.4' : '0.18'}
                    strokeWidth={major ? '0.5' : '0.3'}
                  />
                );
              })}
            </svg>
            {/* Rotating needle */}
            <div
              className="absolute inset-0 transition-transform duration-200 ease-out"
              style={{ transform: `rotate(${rotation.toFixed(2)}deg)` }}
              suppressHydrationWarning
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <polygon points="50,12 53,50 50,55 47,50" fill="#C8A654" />
                <line x1="50" y1="55" x2="50" y2="86" stroke="#5B4A33" strokeOpacity="0.4" strokeWidth="0.6" />
              </svg>
            </div>
            {/* Centerpiece star — flips gold when aligned */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={
                  'grid h-16 w-16 place-items-center rounded-full ' +
                  (aligned ? 'bg-gold-500 text-white' : 'bg-cream-100 text-gold-600 dark:bg-teal-800')
                }
              >
                <StarEmblem size={36} />
              </div>
            </div>
            {/* N/E/S/W cardinals */}
            <div className="absolute inset-0 text-[10px] tracking-widest text-ink-800/50 dark:text-cream-100/55">
              <div className="absolute left-1/2 top-1 -translate-x-1/2">N</div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2">E</div>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2">S</div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2">W</div>
            </div>
          </div>

          {/* Two stat tiles */}
          <div className="mt-5 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-cream-100 px-3 py-3 dark:bg-teal-800/60">
              <div className="text-[10px] uppercase tracking-[0.25em] text-ink-800/55 dark:text-cream-100/55">
                {t('distanceToMecca')}
              </div>
              <div className="mt-1 font-rabar text-lg font-bold tabular">
                {Math.round(distance).toLocaleString()}{' '}
                <span className="text-xs opacity-70">{t('km')}</span>
              </div>
            </div>
            <div className="rounded-xl bg-cream-100 px-3 py-3 dark:bg-teal-800/60">
              <div className="text-[10px] uppercase tracking-[0.25em] text-ink-800/55 dark:text-cream-100/55">
                {t('bearing')}
              </div>
              <div className="mt-1 font-rabar text-lg font-bold tabular">
                {bearing.toFixed(1)}°
              </div>
            </div>
          </div>

          {/* Status row */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[12px] text-ink-800/60 dark:text-cream-100/60">
            <MapPin size={12} />
            {perm === 'needed' ? (
              // Not a button any more: the next tap anywhere grants the compass
              // permission, so say that. "Rotate the device to calibrate" is
              // advice for a compass that is already running, and following it
              // here gets the user nowhere.
              <span>{t('tapForCompass')}</span>
            ) : perm === 'denied' ? (
              <span className="opacity-70">{t('locationDenied')}</span>
            ) : heading == null ? (
              <span>{t('calibrate')}</span>
            ) : aligned ? (
              <span className="font-semibold text-gold-600 dark:text-gold-400">{t('facingQibla')}</span>
            ) : (
              <span>{t('calibrate')}</span>
            )}
          </div>
        </div>
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}
