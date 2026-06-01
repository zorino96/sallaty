'use client';

import { Sparkles } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { adabArticles } from '@/data/staticPages';

export default function AdabPage() {
  const { t, lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={t('adabKids')} subtitle={t('adabKidsSub')} />

      <section className="space-y-3 px-5 pb-4">
        {adabArticles.map((article) => (
          <article key={article.id} className="surface rounded-2xl px-4 py-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-400">
                <Sparkles size={16} />
              </div>
              <div className="font-rabar text-[15px] font-semibold">
                {isAr ? article.titleAr : article.titleKu}
              </div>
            </div>
            <ul className="mt-3 space-y-2.5">
              {article.items.map((bullet, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-[13px] leading-7 text-ink-800/75 dark:text-cream-100/75"
                >
                  <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500/60" />
                  <span>{isAr ? bullet.ar : bullet.ku}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}
