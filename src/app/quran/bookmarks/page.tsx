'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, LoaderCircle, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { surahById } from '@/data/quran/surahs';
import { arabicNumber } from '@/lib/quran';
import { getBookmarks, removeBookmark, subscribeBookmarks, type Bookmark as Bm } from '@/lib/bookmarks';
import { ayahText, isIndexReady, loadSearchIndex } from '@/lib/quranSearch';

export default function QuranBookmarksPage() {
  const { t, lang } = useApp();
  const isAr = lang === 'ar';
  const router = useRouter();

  const [ready, setReady] = useState(isIndexReady());
  const [items, setItems] = useState<Bm[]>([]);

  useEffect(() => {
    let alive = true;
    setItems(getBookmarks());
    loadSearchIndex().then(() => { if (alive) setReady(true); }).catch(() => { if (alive) setReady(true); });
    const unsub = subscribeBookmarks(() => setItems(getBookmarks()));
    return () => { alive = false; unsub(); };
  }, []);

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={t('bookmarks')} subtitle={t('bookmarksSub')} backHref="/quran" />

      <section className="flex-1 space-y-2 px-5 pt-1 pb-4">
        {items.length === 0 ? (
          <div className="surface rounded-2xl px-5 py-10 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-300">
              <Bookmark size={22} />
            </div>
            <div className="text-[13px] leading-7 text-ink-800/55 dark:text-ivory-100/55">{t('noBookmarks')}</div>
          </div>
        ) : !ready ? (
          <div className="surface flex items-center justify-center gap-2 rounded-2xl py-8 text-[12px] text-ink-800/55 dark:text-ivory-100/55">
            <LoaderCircle size={15} className="animate-spin" />
          </div>
        ) : (
          items.map((b) => {
            const meta = surahById(b.s);
            const txt = ayahText(b.s, b.a);
            return (
              <div key={`${b.s}-${b.a}`} className="surface flex items-stretch gap-2 overflow-hidden rounded-2xl">
                <button
                  onClick={() => router.push(`/quran/${b.s}#ayah-${b.a}`)}
                  className="min-w-0 flex-1 p-4 text-start transition active:scale-[0.99]"
                >
                  <div className="mb-2 flex items-center gap-2 text-[10.5px]">
                    <span className="rounded-full bg-gold-500/15 px-2 py-0.5 font-semibold text-gold-700 dark:text-gold-300">
                      {meta?.name} · {t('ayahShort')} {isAr ? arabicNumber(b.a) : b.a}
                    </span>
                  </div>
                  {txt && (
                    <div className="font-arabic text-[18px] leading-[2] text-right line-clamp-2" dir="rtl">{txt.ar}</div>
                  )}
                  {txt?.ku && (
                    <div className="mt-1.5 line-clamp-1 text-[12.5px] text-ink-800/65 dark:text-ivory-100/65" dir="rtl">{txt.ku}</div>
                  )}
                </button>
                <button
                  onClick={() => removeBookmark(b.s, b.a)}
                  aria-label="remove"
                  className="grid w-11 shrink-0 place-items-center text-ink-800/40 transition active:scale-90 hover:text-jewel-garnet dark:text-ivory-100/40"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })
        )}
      </section>

      <BottomNav />
    </main>
  );
}
