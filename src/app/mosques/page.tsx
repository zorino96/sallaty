'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, LoaderCircle, MapPin, MapPinned, Navigation, RefreshCw } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import {
  defaultMapProvider, findNearbyMosques, mosqueMapsUrl, nearbyMosquesMapsUrl,
  otherMapProvider, type MapProvider, type Mosque,
} from '@/lib/mosques';
import { addCheckin } from '@/lib/habits';

function vibrate(p: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(p);
}

export default function MosquesPage() {
  const { t, lang, coords, city, geoStatus, refreshLocation } = useApp();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [justChecked, setJustChecked] = useState<string | null>(null);
  // Which lookup is the current one. Opening this screen fires a search against
  // whatever coordinates are known, then the location fix lands and fires a
  // second — and Overpass answers in whatever order it likes. Without this the
  // slower, staler reply could arrive last and overwrite the good list with the
  // wrong one, which is how a first visit ends up showing nothing while a
  // second visit reads it straight from the cache and looks fine.
  const currentRequest = useRef(0);
  // Resolved after mount: Capacitor.getPlatform() is 'web' during the static
  // export, so choosing at render time would bake the wrong maps app in.
  const [mapProvider, setMapProvider] = useState<MapProvider>('google');
  useEffect(() => { setMapProvider(defaultMapProvider()); }, []);
  const altProvider = otherMapProvider(mapProvider);
  const providerLabel = (p: MapProvider): string =>
    p === 'apple' ? t('openInAppleMaps') : t('openInGoogleMaps');

  // Ask for a fresh fix on first open if we've never located the user.
  useEffect(() => {
    if (geoStatus === 'idle') void refreshLocation();
  }, [geoStatus, refreshLocation]);

  // Best-effort nearby list (Overpass). Never blocks the page — the Google-Maps
  // button above works regardless — but it does say what it is doing.
  const loadList = useCallback(async () => {
    const request = ++currentRequest.current;
    setState('loading');
    try {
      const found = await findNearbyMosques(coords, 8, 25);
      if (request !== currentRequest.current) return;
      setMosques(found);
      setState('ready');
    } catch {
      if (request !== currentRequest.current) return;
      setMosques([]);
      setState('error');
    }
  }, [coords]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const checkIn = (m: Mosque): void => {
    const name = (lang === 'ar' ? m.nameAr : m.name) || m.name || m.nameAr;
    addCheckin({ prayer: 'fajr', mosqueName: name, lat: m.lat, lng: m.lng });
    vibrate([10, 30, 10]);
    setJustChecked(m.id);
    setTimeout(() => setJustChecked(null), 2200);
  };

  const located = geoStatus === 'granted' || city != null;
  const locationLabel =
    geoStatus === 'locating' ? t('locating')
    : geoStatus === 'denied' ? t('locationDenied')
    : city ?? t('yourLocation');

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={t('mosques')} subtitle={t('nearestMosque')} />

      <section className="space-y-3 px-5 pt-1 pb-4">
        {/* Location card — always visible, shows city + coords */}
        <div className="surface flex items-center gap-3 rounded-2xl px-4 py-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-600">
            <MapPin size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.3em] text-ink-800/55 dark:text-cream-100/55">
              {t('yourLocation')}
            </div>
            <div className="mt-0.5 truncate font-rabar text-[15px] font-bold leading-tight">
              {locationLabel}
            </div>
            <div className="mt-0.5 truncate text-[10.5px] tabular text-ink-800/55 dark:text-cream-100/55" dir="ltr">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </div>
          </div>
          <button
            onClick={() => { void refreshLocation(); vibrate(6); }}
            disabled={geoStatus === 'locating'}
            aria-label={t('refreshLocation')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-500 text-white shadow-gold transition active:scale-90 disabled:opacity-60"
          >
            {geoStatus === 'locating' ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </button>
        </div>

        {/* Primary action — a live mosque search in the platform's own maps app,
            with the other one offered underneath. App Review rejected 1.0 under
            Guideline 4 for offering only a third-party map on iPhone. */}
        <a
          href={nearbyMosquesMapsUrl(coords, mapProvider)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => vibrate(8)}
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 px-4 py-4 text-white shadow-gold transition active:scale-[0.99]"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20">
            <Navigation size={24} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold leading-tight">{t('findInMaps')}</span>
            <span className="mt-0.5 block text-[11px] opacity-85">{providerLabel(mapProvider)}</span>
          </span>
          <ExternalLink size={18} className="shrink-0 opacity-90" />
        </a>

        <a
          href={nearbyMosquesMapsUrl(coords, altProvider)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => vibrate(6)}
          className="surface flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-[12.5px] font-semibold text-ink-800/70 transition active:scale-[0.99] dark:text-cream-100/70"
        >
          <ExternalLink size={13} className="shrink-0 opacity-70" />
          {providerLabel(altProvider)}
        </a>

        {!located && geoStatus !== 'locating' && (
          <p className="px-1 text-center text-[11.5px] leading-5 text-ink-800/55 dark:text-cream-100/55">
            {t('locationNeeded')}
          </p>
        )}

        {/* Nearby mosque list. Every outcome says something: an Overpass lookup
            can take a while, and a screen that stays blank while it works reads
            as broken rather than busy. */}
        <div className="pt-1">
          <div className="flex items-center justify-between px-1 pb-1.5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-800/55 dark:text-cream-100/55">
              {t('nearbyList')}
            </span>
            {state === 'loading' && <LoaderCircle size={12} className="animate-spin opacity-60" />}
          </div>

          {state === 'loading' ? (
            <div className="surface flex items-center justify-center gap-2 rounded-2xl px-4 py-5 text-[12.5px] text-ink-800/60 dark:text-cream-100/60">
              <LoaderCircle size={14} className="animate-spin opacity-70" />
              {t('loadingMosques')}
            </div>
          ) : state === 'error' ? (
            <div className="surface flex flex-col items-center gap-2.5 rounded-2xl px-4 py-5">
              <span className="text-[12.5px] text-ink-800/60 dark:text-cream-100/60">{t('mosquesError')}</span>
              <button
                onClick={() => { void loadList(); vibrate(6); }}
                className="rounded-full bg-gold-500 px-4 py-1.5 text-[11.5px] font-semibold text-white shadow-gold transition active:scale-95"
              >
                {t('retry')}
              </button>
            </div>
          ) : mosques.length === 0 ? (
            <div className="surface flex items-center justify-center rounded-2xl px-4 py-5 text-[12.5px] text-ink-800/60 dark:text-cream-100/60">
              {t('noMosquesFound')}
            </div>
          ) : (
            <div className="space-y-2">
              {mosques.slice(0, 20).map((m) => {
                const display =
                  (lang === 'ar' ? m.nameAr : m.name) || m.name || m.nameAr || (lang === 'ar' ? 'مسجد' : 'مزگەوت');
                const checked = justChecked === m.id;
                return (
                  <div key={m.id} className="surface flex items-center gap-3 rounded-2xl px-3 py-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-400">
                      <MapPinned size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold">{display}</div>
                      <div className="text-[11px] tabular text-ink-800/55 dark:text-cream-100/55">
                        {m.distanceKm?.toFixed(2)} {t('km')} · {t('distance')}
                      </div>
                    </div>
                    <a
                      href={mosqueMapsUrl(m, mapProvider)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('openInMap')}
                      className="grid h-9 w-9 place-items-center rounded-full bg-cream-100 transition active:scale-90 dark:bg-teal-800"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => checkIn(m)}
                      aria-label={t('checkIn')}
                      className={
                        'grid h-9 w-9 place-items-center rounded-full transition active:scale-90 ' +
                        (checked ? 'bg-emerald-500 text-white' : 'bg-gold-500 text-white shadow-gold')
                      }
                    >
                      <span className="text-[11px] font-bold">✓</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}
