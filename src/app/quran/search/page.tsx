'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Mic, Search, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { surahById } from '@/data/quran/surahs';
import { arabicNumber } from '@/lib/quran';
import {
  countAyat, highlightParts, isIndexReady, loadSearchIndex, searchAyat,
} from '@/lib/quranSearch';

export default function QuranSearchPage() {
  const { t, lang } = useApp();
  const isAr = lang === 'ar';
  const router = useRouter();

  const [ready, setReady] = useState(isIndexReady());
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    loadSearchIndex().then(() => { if (alive) setReady(true); }).catch(() => undefined);
    inputRef.current?.focus();
    return () => { alive = false; };
  }, []);

  const { results, total } = useMemo(() => {
    if (!ready) return { results: [], total: 0 };
    return { results: searchAyat(query, 60), total: countAyat(query) };
  }, [query, ready]);

  // Voice → text: progressive enhancement, only if the browser exposes the
  // Web Speech API. No API key, no cost; gracefully absent otherwise.
  const speech = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
      .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition ?? null;
  }, []);

  const startVoice = (): void => {
    if (!speech) return;
    try {
      const Rec = speech as new () => {
        lang: string; interimResults: boolean; maxAlternatives: number;
        start: () => void; stop: () => void;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null; onerror: (() => void) | null;
      };
      const rec = new Rec();
      rec.lang = isAr ? 'ar-SA' : 'ckb-IQ';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const text = e.results?.[0]?.[0]?.transcript ?? '';
        if (text) setQuery(text);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const q = query.trim();

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={t('searchInQuran')} subtitle={t('quran')} backHref="/quran" />

      <section className="px-5">
        <div className="surface flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px]">
          <Search size={16} className="shrink-0 text-gold-600 dark:text-gold-300" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchAyat')}
            dir="rtl"
            className="w-full bg-transparent outline-none placeholder:text-ink-800/40 dark:placeholder:text-ivory-100/40"
          />
          {query && (
            <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="clear" className="shrink-0 opacity-60 active:scale-90">
              <X size={16} />
            </button>
          )}
          {speech && (
            <button
              onClick={startVoice}
              aria-label={t('voiceSearch')}
              className={
                'grid h-8 w-8 shrink-0 place-items-center rounded-full transition active:scale-90 ' +
                (listening ? 'bg-gold-500 text-white animate-halo' : 'bg-cream-100 text-gold-600 dark:bg-teal-800 dark:text-gold-300')
              }
            >
              <Mic size={15} />
            </button>
          )}
        </div>
        {listening && (
          <div className="mt-2 text-center text-[11px] text-gold-700 dark:text-gold-300">{t('listening')}</div>
        )}
      </section>

      <section className="flex-1 space-y-2 px-5 pt-3 pb-4">
        {!ready ? (
          <div className="surface flex items-center justify-center gap-2 rounded-2xl py-8 text-[12px] text-ink-800/55 dark:text-ivory-100/55">
            <LoaderCircle size={15} className="animate-spin" /> {t('quran')}
          </div>
        ) : q.length < 2 ? (
          <div className="surface rounded-2xl px-5 py-8 text-center text-[13px] leading-7 text-ink-800/55 dark:text-ivory-100/55">
            {q.length === 0 ? t('searchPrompt') : t('typeMore')}
          </div>
        ) : results.length === 0 ? (
          <div className="surface rounded-2xl px-5 py-8 text-center text-[13px] text-ink-800/55 dark:text-ivory-100/55">
            {t('noResults')}
          </div>
        ) : (
          <>
            <div className="px-1 pb-1 text-[11px] text-ink-800/55 dark:text-ivory-100/55">
              <span className="tabular">{isAr ? arabicNumber(total) : total}</span> {t('resultWord')}
            </div>
            {results.map((r) => {
              const meta = surahById(r.s);
              return (
                <button
                  key={`${r.s}-${r.a}`}
                  onClick={() => router.push(`/quran/${r.s}#ayah-${r.a}`)}
                  className="surface block w-full rounded-2xl p-4 text-start transition active:scale-[0.99]"
                >
                  <div className="mb-2 flex items-center justify-between gap-2 text-[10.5px]">
                    <span className="rounded-full bg-gold-500/15 px-2 py-0.5 font-semibold text-gold-700 dark:text-gold-300">
                      {meta?.name} · {t('ayahShort')} {isAr ? arabicNumber(r.a) : r.a}
                    </span>
                    <span className="text-ink-800/45 dark:text-ivory-100/40">{meta?.tr}</span>
                  </div>
                  <div className="font-arabic text-[18px] leading-[2] text-right line-clamp-2" dir="rtl">
                    {highlightParts(r.ar, q).map((p, i) =>
                      p.hit
                        ? <mark key={i} className="rounded bg-gold-400/40 px-0.5 text-inherit">{p.t}</mark>
                        : <span key={i}>{p.t}</span>,
                    )}
                  </div>
                  {r.ku && (
                    <div className="mt-2 line-clamp-2 border-t pt-2 text-[12.5px] leading-6 text-ink-800/70 dark:text-ivory-100/70" style={{ borderColor: 'var(--line)' }} dir="rtl">
                      {highlightParts(r.ku, q).map((p, i) =>
                        p.hit
                          ? <mark key={i} className="rounded bg-gold-400/40 px-0.5 text-inherit">{p.t}</mark>
                          : <span key={i}>{p.t}</span>,
                      )}
                    </div>
                  )}
                </button>
              );
            })}
            {total > results.length && (
              <div className="px-1 pt-1 text-center text-[11px] text-ink-800/45 dark:text-ivory-100/40">
                +{isAr ? arabicNumber(total - results.length) : total - results.length}
              </div>
            )}
          </>
        )}
      </section>

      <BottomNav />
    </main>
  );
}
