'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LoaderCircle, MapPin } from 'lucide-react';
import StarEmblem from '@/components/StarEmblem';
import { useApp } from '@/lib/AppProvider';

function vibrate(p: number): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(p);
}

export default function OnboardingPage() {
  const { t, lang, setLang, setOnboarded, refreshLocation, geoStatus } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onContinue = async (): Promise<void> => {
    if (busy) return;
    setBusy(true);
    await refreshLocation().catch(() => undefined);
    setOnboarded(true);
    router.replace('/');
  };

  const welcomeTitleShort = t('welcomeTitle').split('·')[0].trim();

  return (
    <main className="relative min-h-[100dvh]">
      {/* Maroon hero with rotating starbursts and a centered star emblem */}
      <section className="relative h-[58dvh] overflow-hidden bg-sky-maghrib">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-16 -top-10 animate-spin-slow">
            <StarEmblem size={340} color="#FBE3CA" />
          </div>
          <div className="absolute -right-20 bottom-4 opacity-60">
            <StarEmblem size={260} color="#FBC79C" />
          </div>
        </div>
        <div className="relative flex h-full flex-col items-center justify-center text-white">
          <StarEmblem size={64} color="#FFE2C7" />
          <h1 className="mt-6 font-rabar text-4xl font-bold">{t('todaysPrayers')}</h1>
          <div className="mt-1 text-xl opacity-90">{t('appName')}</div>
          <div className="mt-3 text-[11px] uppercase tracking-[0.4em] opacity-70">
            نوێژەکانم بۆ مۆبایل
          </div>
        </div>
      </section>

      {/* Bottom card with welcome text + lang picker + continue */}
      <section className="relative -mt-6 rounded-t-[28px] bg-cream-100 px-6 pb-10 pt-7 dark:bg-teal-900">
        <div className="text-center text-[12px] uppercase tracking-[0.35em] text-ink-800/60 dark:text-cream-100/60">
          ONBOARDING
        </div>
        <h2 className="mt-2 text-center font-rabar text-2xl font-bold">{welcomeTitleShort}</h2>
        <p className="mt-2 whitespace-pre-line text-center text-sm leading-7 text-ink-800/70 dark:text-cream-100/70">
          {t('welcomeSub')}
        </p>

        <div className="mt-7 text-center text-[12px] uppercase tracking-[0.25em] text-ink-800/55 dark:text-cream-100/55">
          {t('chooseLang')}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => { setLang('ku'); vibrate(8); }}
            className={
              'surface rounded-2xl px-4 py-4 text-center transition active:scale-95 ' +
              (lang === 'ku' ? 'shadow-gold ring-2 ring-gold-500' : '')
            }
          >
            <div className="font-rabar text-lg font-semibold">کوردی</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-ink-800/55 dark:text-cream-100/55">
              KURDISH
            </div>
          </button>
          <button
            onClick={() => { setLang('ar'); vibrate(8); }}
            className={
              'surface rounded-2xl px-4 py-4 text-center transition active:scale-95 ' +
              (lang === 'ar' ? 'shadow-gold ring-2 ring-gold-500' : '')
            }
          >
            <div className="font-arabic text-lg font-semibold">العربية</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-ink-800/55 dark:text-cream-100/55">
              ARABIC
            </div>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-800/55 dark:text-cream-100/55">
          <MapPin size={12} />
          <span>{t('detectMyLocation')}</span>
        </div>

        <button
          onClick={onContinue}
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-3.5 text-white shadow-gold transition active:scale-95 disabled:opacity-80"
        >
          {(busy || geoStatus === 'locating') && <LoaderCircle size={16} className="animate-spin" />}
          <span className="font-semibold">{t('next')}</span>
          <ArrowLeft size={16} className="rotate-180 rtl:rotate-0" />
        </button>
      </section>
    </main>
  );
}
