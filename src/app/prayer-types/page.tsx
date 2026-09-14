'use client';

import { useState } from 'react';
import { ChevronDown, Clock, ListOrdered } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { prayerTypeItems, type PrayerKind } from '@/data/staticPages';

type Filter = 'all' | PrayerKind;

function vibrate(p: number): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(p);
}

// A supplication can have a gap in it that the reader fills with their own
// words — the Istikhara names your need, twice. Printed du'a books mark the
// spot inside the line rather than in a footnote, because you need to know
// where to stop at the moment you reach it, not afterwards. `{{need}}` in the
// Arabic marks that gap.
const NEED_SLOT = '{{need}}';
const NEED_LABEL = { ku: 'ناوی پێویستییەکەت دەهێنیت', ar: 'تُسمّي حاجتك' };

function withNeedSlots(arabic: string, isAr: boolean): React.ReactNode[] {
  return arabic.split(NEED_SLOT).flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <span
            key={i}
            className="mx-1 inline-block rounded-full bg-gold-500/20 px-2 py-0.5 align-middle font-rabar text-[11px] font-semibold text-gold-700 dark:text-gold-300"
          >
            {isAr ? NEED_LABEL.ar : NEED_LABEL.ku}
          </span>,
          part,
        ],
  );
}

const CATEGORY_BADGE: Record<PrayerKind, { ku: string; ar: string }> = {
  fard:     { ku: 'فەرز',   ar: 'فرض'  },
  sunnah:   { ku: 'سونەت',  ar: 'سنّة' },
  nafila:   { ku: 'نافیلە', ar: 'نافلة' },
  occasion: { ku: 'بۆنە',   ar: 'مناسبة' },
};

export default function PrayerTypesPage() {
  const { t, lang } = useApp();
  const isAr = lang === 'ar';
  const [filter, setFilter] = useState<Filter>('all');
  // Only the entries that carry their own words open — the rest have nothing
  // behind the summary to show.
  const [open, setOpen] = useState<string | null>(null);

  const tabs: Array<{ id: Filter; label: string }> = [
    { id: 'all',      label: isAr ? 'الكل' : 'هەموو' },
    { id: 'fard',     label: isAr ? CATEGORY_BADGE.fard.ar     : CATEGORY_BADGE.fard.ku },
    { id: 'sunnah',   label: isAr ? CATEGORY_BADGE.sunnah.ar   : CATEGORY_BADGE.sunnah.ku },
    { id: 'nafila',   label: isAr ? CATEGORY_BADGE.nafila.ar   : CATEGORY_BADGE.nafila.ku },
    { id: 'occasion', label: isAr ? CATEGORY_BADGE.occasion.ar : CATEGORY_BADGE.occasion.ku },
  ];

  const filtered = filter === 'all' ? prayerTypeItems : prayerTypeItems.filter((i) => i.kind === filter);

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={t('prayerTypes')} subtitle={t('prayerTypesSub')} />

      <section className="px-5 pt-1">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setFilter(tab.id); vibrate(6); }}
              className={
                'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] transition active:scale-95 ' +
                (filter === tab.id ? 'border-gold-500 bg-gold-500 text-white shadow-gold' : 'surface')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2 px-5 pt-3 pb-6">
        {filtered.map((item) => {
          const badge = CATEGORY_BADGE[item.kind];
          return (
            <article key={item.id} className="surface rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-rabar text-[15px] font-bold leading-tight">
                  {isAr ? item.nameAr : item.nameKu}
                </h3>
                <span className="shrink-0 rounded-full bg-gold-500/15 px-2 py-0.5 text-[11px] font-semibold text-gold-700 dark:text-gold-400">
                  {isAr ? badge.ar : badge.ku}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-800/65 dark:text-cream-100/65">
                <div className="inline-flex items-center gap-1.5">
                  <ListOrdered size={12} className="opacity-60" />
                  <span className="tabular">{isAr ? item.rakatsAr : item.rakatsKu}</span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <Clock size={12} className="opacity-60" />
                  <span>{isAr ? item.whenAr : item.whenKu}</span>
                </div>
              </div>
              <p className="mt-2 text-[13px] leading-6 text-ink-800/75 dark:text-cream-100/75">
                {isAr ? item.descAr : item.descKu}
              </p>

              {item.steps && (() => {
                const isOpen = open === item.id;
                return (
                  <>
                    <button
                      onClick={() => { setOpen(isOpen ? null : item.id); vibrate(6); }}
                      aria-expanded={isOpen}
                      className="mt-3 flex w-full items-center justify-between gap-2 rounded-xl bg-gold-500/10 px-3 py-2 text-[12px] font-semibold text-gold-700 transition active:scale-[0.99] dark:text-gold-300"
                    >
                      <span>{isAr ? 'الأدعية والخطوات' : 'دوعا و هەنگاوەکان'}</span>
                      <ChevronDown
                        size={14}
                        className={'transition-transform duration-300 ' + (isOpen ? 'rotate-180' : '')}
                      />
                    </button>

                    {isOpen && (
                      <div className="mt-2 space-y-3">
                        {item.steps.map((step, n) => (
                          <div key={n} className="rounded-xl bg-cream-100 p-3 dark:bg-teal-900/50">
                            <div className="text-[12px] font-bold text-gold-700 dark:text-gold-300">
                              {isAr ? step.labelAr : step.labelKu}
                            </div>
                            {step.arabic && (
                              <div className="mt-2 text-right text-[19px] font-bold leading-[2.1]" dir="rtl">
                                {withNeedSlots(step.arabic, isAr)}
                              </div>
                            )}
                            <p className="mt-2 text-[12.5px] leading-6 text-ink-800/75 dark:text-cream-100/75">
                              {isAr ? step.meaningAr : step.meaningKu}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </article>
          );
        })}
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
