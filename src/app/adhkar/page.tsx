'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { dhikrPresets, type DhikrCategory } from '@/data/dhikr';

type FilterTab = 'morning' | 'evening' | 'after-prayer' | 'sleep';
const TABS: FilterTab[] = ['morning', 'evening', 'after-prayer', 'sleep'];

export default function AdhkarPage() {
  const { t, lang } = useApp();
  const [active, setActive] = useState<FilterTab>('after-prayer');
  const [query, setQuery] = useState('');

  const tabLabel = (tab: FilterTab) => {
    switch (tab) {
      case 'morning':      return t('morningAdhkar');
      case 'evening':      return t('eveningAdhkar');
      case 'after-prayer': return t('afterPrayer');
      case 'sleep':        return t('sleep');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim();
    return dhikrPresets.filter((d) => {
      const category: DhikrCategory = d.category;
      const matchesTab = category === active || category === 'anytime';
      if (!matchesTab) return false;
      if (q === '') return true;
      return (
        d.arabic.includes(q) ||
        d.nameKu.includes(q) ||
        d.nameAr.includes(q) ||
        d.meaningKu.includes(q) ||
        d.meaningAr.includes(q)
      );
    });
  }, [active, query]);

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={tabLabel(active)} subtitle={t('adhkar')} />

      <section className="px-5">
        <div className="surface flex items-center gap-2 rounded-full px-3 py-2 text-[13px]">
          <Search size={14} className="opacity-60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'ابحث...' : 'گەڕان...'}
            className="w-full bg-transparent outline-none placeholder:text-ink-800/40 dark:placeholder:text-cream-100/40"
          />
        </div>
      </section>

      <section className="px-5 pt-3">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActive(tab);
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(6);
              }}
              className={
                'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] transition active:scale-95 ' +
                (active === tab ? 'bg-gold-500 border-gold-500 text-white shadow-gold' : 'surface')
              }
            >
              {tabLabel(tab)}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2 px-5 pt-3 pb-4">
        {filtered.map((d) => (
          <div key={d.id} className="surface rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[12px] font-semibold text-gold-700 dark:text-gold-400">
                {lang === 'ar' ? d.nameAr : d.nameKu}
              </div>
              {d.source && (
                <div className="truncate text-[10px] opacity-55">
                  {lang === 'ar' ? d.source.ar : d.source.ku}
                </div>
              )}
            </div>
            <div className="mt-1 font-arabic text-xl font-bold leading-relaxed">{d.arabic}</div>
            <div className="mt-1.5 text-[13px] leading-6 text-ink-800/65 dark:text-cream-100/70">
              {lang === 'ar' ? d.meaningAr : d.meaningKu}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <div className="text-ink-800/55 dark:text-cream-100/55">
                {lang === 'ar' ? 'مرات' : 'جار'} · <span className="tabular">{d.count}</span>
              </div>
              <Link
                href={`/dhikr?id=${d.id}`}
                className="rounded-full bg-gold-500/15 px-3 py-1.5 font-semibold text-gold-700 transition active:scale-95 dark:text-gold-400"
              >
                {t('start')} →
              </Link>
            </div>
          </div>
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
