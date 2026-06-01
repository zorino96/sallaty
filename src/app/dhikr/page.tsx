'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw, Star } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { dhikrPresets } from '@/data/dhikr';

function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(pattern);
}

export default function DhikrPage() {
  const { t, lang } = useApp();
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(0);

  // Allow the /adhkar page to deep-link with ?id=... — pick that preset on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;
    const i = dhikrPresets.findIndex((d) => d.id === id);
    if (i >= 0) setIdx(i);
  }, []);

  const preset = dhikrPresets[idx];
  const target = preset.count;
  const stars = Math.min(5, Math.floor((count / target) * 5));

  const increment = useCallback(() => {
    setCount((c) => {
      const next = c + 1;
      if (next % target === 0)       vibrate([40, 60, 100]);
      else if (next % 33 === 0)      vibrate([30, 30, 30]);
      else                           vibrate(12);
      return next;
    });
  }, [target]);

  const reset = (): void => setCount(0);

  const prev = (): void => {
    setIdx((i) => (i - 1 + dhikrPresets.length) % dhikrPresets.length);
    setCount(0);
    vibrate(8);
  };

  const next = (): void => {
    setIdx((i) => (i + 1) % dhikrPresets.length);
    setCount(0);
    vibrate(8);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'AudioVolumeUp', 'AudioVolumeDown', ' '].includes(e.key)) {
        e.preventDefault();
        increment();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [increment]);

  const titleText = useMemo(() => (lang === 'ar' ? preset.nameAr : preset.nameKu), [lang, preset]);
  const meaningText = lang === 'ar' ? preset.meaningAr : preset.meaningKu;

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader
        title={titleText}
        subtitle={t('dhikr')}
        right={
          <button
            onClick={reset}
            aria-label="reset"
            className="grid h-9 w-9 place-items-center rounded-full surface transition active:scale-90"
          >
            <RotateCcw size={14} />
          </button>
        }
      />

      <section className="px-5">
        <div className="surface rounded-3xl px-5 pt-7 pb-5 text-center">
          <div className="font-arabic text-3xl font-bold leading-tight">{preset.arabic}</div>
          <div className="mt-2 text-[12px] leading-6 text-ink-800/60 dark:text-cream-100/60">
            {meaningText}
          </div>
          <button
            onClick={increment}
            className="relative mx-auto mt-7 grid h-60 w-60 place-items-center rounded-full bg-gradient-to-b from-cream-50 to-cream-200 text-center shadow-glass transition active:scale-[0.99] dark:from-teal-800 dark:to-teal-900"
          >
            <div className="absolute inset-1 rounded-full ring-2 ring-gold-500/40" />
            <div className="absolute inset-3 rounded-full ring-1 ring-black/5 dark:ring-white/10" />
            <div>
              <div className="font-rabar text-[64px] font-bold leading-none tabular">{count}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-ink-800/55 dark:text-cream-100/55">
                / {target}
              </div>
            </div>
          </button>
          <div className="mt-5 flex items-center justify-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < stars ? 'fill-gold-500 stroke-gold-500' : 'stroke-ink-800/30 dark:stroke-cream-100/25'}
              />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <button
              onClick={prev}
              className="surface rounded-full py-2.5 text-[11px] uppercase tracking-widest transition active:scale-95"
            >
              prev
            </button>
            <button
              onClick={reset}
              className="rounded-full bg-gold-500 py-2.5 text-[11px] uppercase tracking-widest text-white shadow-gold transition active:scale-95"
            >
              {t('reset')}
            </button>
            <button
              onClick={next}
              className="surface rounded-full py-2.5 text-[11px] uppercase tracking-widest transition active:scale-95"
            >
              next
            </button>
          </div>
          <div className="mt-3 text-[11px] text-ink-800/55 dark:text-cream-100/55">
            tap card · ↑/↓ keys · volume buttons
          </div>
        </div>
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}
