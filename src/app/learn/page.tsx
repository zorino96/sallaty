'use client';

import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { learnSteps } from '@/data/staticPages';

export default function LearnPage() {
  const { t, lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={t('learnPrayer')} subtitle={t('learnPrayerSub')} />

      <section className="space-y-3 px-5 pb-6">
        {learnSteps.map((step, idx) => (
          <article key={step.id} className="surface rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-500/15 text-[13px] font-bold tabular text-gold-700 dark:text-gold-400">
                {idx + 1}
              </span>
              <h3 className="font-rabar text-[15px] font-bold leading-tight">
                {isAr ? step.titleAr : step.titleKu}
              </h3>
            </div>
            <p className="text-[13.5px] leading-7 text-ink-800/75 dark:text-cream-100/75">
              {isAr ? step.descAr : step.descKu}
            </p>
          </article>
        ))}
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}
