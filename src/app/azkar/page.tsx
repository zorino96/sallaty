'use client';

import { Clock, Sparkles } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { azkarGroups } from '@/data/azkar';

export default function AzkarPage() {
  const { t, lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={t('azkarCollection')} subtitle={t('azkarCollectionSub')} />

      <section className="space-y-4 px-5 pb-6">
        {azkarGroups.map((group) => (
          <div key={group.id} className="space-y-2">
            {/* group heading */}
            <div className="flex items-center gap-2 pt-1">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-400">
                <Sparkles size={15} />
              </span>
              <h2 className="font-rabar text-[15px] font-bold leading-tight">
                {isAr ? group.titleAr : group.titleKu}
              </h2>
            </div>

            {group.items.map((z) => (
              <article key={z.id} className="surface rounded-2xl p-4">
                <div className="text-right text-[19px] font-bold leading-[2]" dir="rtl">
                  {z.arabic}
                </div>
                <div className="mt-2 text-[13px] leading-7 text-ink-800/75 dark:text-cream-100/75">
                  {z.meaningKu}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-800/55 dark:text-cream-100/55">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} className="opacity-70" />
                    <span className="font-semibold">{t('whenLabel')}:</span>
                    <span>{isAr ? z.whenAr : z.whenKu}</span>
                  </span>
                  {z.count && (
                    <span className="rounded-full bg-gold-500/15 px-2 py-0.5 font-semibold tabular text-gold-700 dark:text-gold-400">
                      {z.count}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ))}
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}
