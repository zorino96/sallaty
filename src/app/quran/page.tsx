'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { SURAHS, TOTAL_AYAHS, type Surah } from '@/data/quran/surahs';
import { arabicNumber } from '@/lib/quran';

export default function QuranIndexPage() {
  const { t, lang } = useApp();
  const isAr = lang === 'ar';
  const [query, setQuery] = useState('');

  const filtered: Surah[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SURAHS;
    return SURAHS.filter((s) => {
      const num = String(s.n);
      return (
        num.startsWith(q) ||
        s.name.includes(query.trim()) ||
        s.tr.toLowerCase().includes(q) ||
        s.trEn.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={t('quran')} subtitle={`${arabicNumber(SURAHS.length)} · ${arabicNumber(TOTAL_AYAHS)} ${t('ayahShort')}`} />

      <section className="px-5">
        <div className="surface flex items-center gap-2 rounded-full px-3 py-2 text-[13px]">
          <Search size={14} className="opacity-60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchSurah')}
            className="w-full bg-transparent outline-none placeholder:text-ink-800/40 dark:placeholder:text-cream-100/40"
          />
        </div>
      </section>

      <section className="space-y-1.5 px-5 pt-3 pb-4">
        {filtered.map((s) => (
          <Link
            key={s.n}
            href={`/quran/${s.n}`}
            className="surface flex items-center gap-3 rounded-2xl px-4 py-3 transition active:scale-[0.99]"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center">
              {/* 8-point star badge with the surah number — common Mushaf motif */}
              <svg viewBox="0 0 40 40" className="h-10 w-10 text-gold-500" aria-hidden="true">
                <g fill="none" stroke="currentColor" strokeWidth="1.2">
                  <polygon points="20,3 24,16 37,16 26,24 30,37 20,29 10,37 14,24 3,16 16,16" opacity="0.55" />
                  <polygon points="20,7 23,17 33,17 25,23 28,33 20,27 12,33 15,23 7,17 17,17" opacity="0.35" />
                </g>
                <text
                  x="20"
                  y="24"
                  textAnchor="middle"
                  className="font-rabar fill-current text-[11px] font-bold"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {arabicNumber(s.n)}
                </text>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <div className="truncate text-[15px] font-bold leading-tight">{s.name}</div>
                <div className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-ink-800/55 dark:text-cream-100/55">
                  {s.tr}
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-800/55 dark:text-cream-100/55">
                <span
                  className={
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold ' +
                    (s.rev === 'M'
                      ? 'bg-gold-500/15 text-gold-700 dark:text-gold-400'
                      : 'bg-teal-700/15 text-teal-700 dark:text-teal-200')
                  }
                >
                  {s.rev === 'M' ? t('meccan') : t('medinan')}
                </span>
                <span className="tabular">{isAr ? `${arabicNumber(s.count)} ${t('ayahShort')}` : `${s.count} ${t('ayahShort')}`}</span>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="surface rounded-2xl p-6 text-center text-sm text-ink-800/55 dark:text-cream-100/55">
            —
          </div>
        )}
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}
