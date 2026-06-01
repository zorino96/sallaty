'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { SURAHS, surahById } from '@/data/quran/surahs';
import {
  arabicNumber,
  loadSurahArabic,
  loadSurahKurdish,
  TAWBAH_NUMBER,
  type SurahArData,
  type SurahKuData,
} from '@/lib/quran';

export default function SurahDetailPage() {
  return <SurahContent />;
}

function SurahContent() {
  const params = useParams<{ surah: string }>();
  const n = Math.max(1, Math.min(114, parseInt(params.surah, 10) || 1));
  const meta = surahById(n);

  const { t } = useApp();
  const [ar, setAr] = useState<SurahArData | null>(null);
  const [ku, setKu] = useState<SurahKuData | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setError(null);
    setAr(null);
    setKu(null);
    void Promise.all([
      loadSurahArabic(n),
      loadSurahKurdish(n).catch(() => null),
    ])
      .then(([arData, kuData]) => {
        if (!alive) return;
        setAr(arData);
        if (kuData) setKu(kuData);
      })
      .catch(() => {
        if (alive) setError('Failed to load surah');
      });
    return () => {
      alive = false;
    };
  }, [n]);

  if (!meta) {
    return (
      <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <PageHeader title={t('quran')} backHref="/quran" />
        <div className="surface m-5 rounded-2xl p-6 text-center text-sm">—</div>
        <div className="flex-1" />
        <BottomNav />
      </main>
    );
  }

  const prev = SURAHS.find((s) => s.n === n - 1);
  const next = SURAHS.find((s) => s.n === n + 1);
  const showBismillah = n !== TAWBAH_NUMBER && n !== 1; // Al-Fatihah already starts with it

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader
        title={meta.name}
        subtitle={`${meta.tr} · ${arabicNumber(meta.count)} ${t('ayahShort')}`}
        backHref="/quran"
        right={
          <button
            onClick={() => setShowTranslation((v) => !v)}
            aria-label={t('showTranslation')}
            className="grid h-9 w-9 place-items-center rounded-full surface transition active:scale-90"
          >
            {showTranslation ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        }
      />

      <section className="px-5 pb-3">
        <div className="surface rounded-3xl px-5 py-5 text-center">
          <div className="font-rabar text-3xl font-bold">{meta.name}</div>
          <div className="mt-1 text-[12px] uppercase tracking-[0.3em] text-ink-800/55 dark:text-cream-100/55">
            {meta.tr} · {meta.trEn}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px]">
            <span
              className={
                'rounded-full px-2.5 py-0.5 font-semibold ' +
                (meta.rev === 'M'
                  ? 'bg-gold-500/15 text-gold-700 dark:text-gold-400'
                  : 'bg-teal-700/15 text-teal-700 dark:text-teal-200')
              }
            >
              {meta.rev === 'M' ? t('meccan') : t('medinan')}
            </span>
            <span className="tabular text-ink-800/55 dark:text-cream-100/55">
              {arabicNumber(meta.count)} {t('ayahShort')}
            </span>
          </div>
          {showBismillah && (
            <div className="mt-4 font-arabic text-2xl font-bold leading-relaxed">
              {t('bismillah')}
            </div>
          )}
        </div>
      </section>

      {error && (
        <div className="mx-5 mb-3 rounded-2xl bg-red-500/10 px-4 py-3 text-[12px] text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {!ar && !error && (
        <div className="mx-5 mb-3 flex items-center justify-center gap-2 rounded-2xl bg-cream-100 px-4 py-5 text-[12px] text-ink-800/55 dark:bg-teal-800/50 dark:text-cream-100/55">
          <LoaderCircle size={14} className="animate-spin" />
          <span>{meta.name}</span>
        </div>
      )}

      {ar && (
        <section className="space-y-2 px-5 pb-4">
          {ar.ayahs.map((a, i) => {
            const kuT = ku?.ayahs[i]?.t;
            return (
              <article key={a.n} className="surface rounded-2xl p-4">
                <div className="mb-2 flex items-center justify-between gap-2 text-[10.5px] text-ink-800/55 dark:text-cream-100/55">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gold-500/15 font-semibold text-gold-700 dark:text-gold-400">
                    <span className="tabular">{arabicNumber(a.n)}</span>
                  </span>
                  <span className="tabular">
                    {t('juzShort')} {arabicNumber(a.juz)} · {t('pageShort')} {arabicNumber(a.page)}
                  </span>
                </div>
                <div className="font-arabic text-[20px] font-bold leading-[2.2] text-right" dir="rtl">
                  {a.t}
                  <span className="mx-1 inline-block tabular text-[14px] text-gold-600 dark:text-gold-400">
                    ﴿{arabicNumber(a.n)}﴾
                  </span>
                </div>
                {showTranslation && kuT && (
                  <div
                    className="mt-3 border-t pt-3 text-[13.5px] leading-7 text-ink-800/75 dark:text-cream-100/75"
                    style={{ borderColor: 'var(--line)' }}
                    dir="rtl"
                  >
                    {kuT}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {/* Prev/Next surah navigation */}
      <section className="grid grid-cols-2 gap-2 px-5 pb-4">
        {prev ? (
          <Link
            href={`/quran/${prev.n}`}
            className="surface flex items-center gap-2 rounded-2xl px-3 py-3 text-start transition active:scale-[0.98]"
          >
            <ChevronRight size={14} className="rtl:rotate-180" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-800/55 dark:text-cream-100/55">
                {arabicNumber(prev.n)}
              </div>
              <div className="truncate font-rabar text-[13px] font-bold">{prev.name}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/quran/${next.n}`}
            className="surface flex items-center justify-end gap-2 rounded-2xl px-3 py-3 text-end transition active:scale-[0.98]"
          >
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-800/55 dark:text-cream-100/55">
                {arabicNumber(next.n)}
              </div>
              <div className="truncate font-rabar text-[13px] font-bold">{next.name}</div>
            </div>
            <ChevronLeft size={14} className="rtl:rotate-180" />
          </Link>
        ) : (
          <div />
        )}
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}
