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
    router.replace('/guide'); // first-run → how-to-use guide → home
  };

  const welcomeTitleShort = t('welcomeTitle').split('·')[0].trim();

  return (
    <main className="phone-frame relative min-h-[100dvh]">
      {/* Night-of-illumination hero */}
      <section className="sky-maghrib relative h-[56dvh] overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-16 opacity-[0.28] animate-spin-slow">
          <StarEmblem size={380} color="#FFC79E" />
        </div>
        <div className="pointer-events-none absolute -right-24 bottom-2 opacity-20 animate-spin-rev">
          <StarEmblem size={280} color="#FBE3CA" variant="star" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{ backgroundImage: 'var(--grainurl)' }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: 'inset 0 -50px 70px -30px rgba(0,0,0,0.6)' }}
        />

        <div className="relative flex h-full flex-col items-center justify-center text-ivory-100">
          <div className="relative grid place-items-center">
            <div className="absolute animate-spin-slow opacity-80"><StarEmblem size={108} color="#FFE2C7" /></div>
            <StarEmblem size={54} color="#FFF3DD" variant="star" glow />
          </div>
          <h1 className="gild gild-shimmer mt-7 font-rabar text-[42px] font-bold leading-none">{t('appName')}</h1>
          <div className="mt-3 font-rabar text-[17px] text-ivory-100/90 text-shadow-sky">{t('todaysPrayers')}</div>
          <div className="mt-3 text-[10px] uppercase tracking-kashida text-ivory-100/65">نوێژەکانم بۆ مۆبایل</div>
        </div>
      </section>

      {/* Welcome / language / continue */}
      <section className="surface relative -mt-8 rounded-t-[34px] px-6 pb-10 pt-6">
        <div className="rule mb-4 w-2/5 mx-auto"><span className="block h-1.5 w-1.5 rotate-45 bg-current opacity-80" /></div>

        <h2 className="text-center font-rabar text-[24px] font-bold">{welcomeTitleShort}</h2>
        <p className="mt-2 whitespace-pre-line text-center text-[13.5px] leading-7 text-ink-800/70 dark:text-ivory-100/70">
          {t('welcomeSub')}
        </p>

        <div className="mt-6 text-center text-[10px] uppercase tracking-kashida text-gold-700/80 dark:text-gold-300/75">
          {t('chooseLang')}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => { setLang('ku'); vibrate(8); }}
            className={'surface rounded-2xl px-4 py-4 text-center transition active:scale-95 ' + (lang === 'ku' ? 'shadow-glow ring-2 ring-gold-500' : '')}
          >
            <div className="font-rabar text-lg font-bold">کوردی</div>
            <div className="mt-1 text-[9px] uppercase tracking-kashida text-ink-800/50 dark:text-ivory-100/50">KURDISH</div>
          </button>
          <button
            onClick={() => { setLang('ar'); vibrate(8); }}
            className={'surface rounded-2xl px-4 py-4 text-center transition active:scale-95 ' + (lang === 'ar' ? 'shadow-glow ring-2 ring-gold-500' : '')}
          >
            <div className="font-naskh text-xl font-bold">العربية</div>
            <div className="mt-1 text-[9px] uppercase tracking-kashida text-ink-800/50 dark:text-ivory-100/50">ARABIC</div>
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-ink-800/55 dark:text-ivory-100/55">
          <MapPin size={12} />
          <span>{t('detectMyLocation')}</span>
        </div>

        <button
          onClick={onContinue}
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-300 to-gold-600 px-5 py-4 text-ink-900 shadow-gold transition active:scale-95 disabled:opacity-80"
        >
          {(busy || geoStatus === 'locating') && <LoaderCircle size={16} className="animate-spin" />}
          <span className="font-bold">{t('next')}</span>
          <ArrowLeft size={16} className="rotate-180 rtl:rotate-0" />
        </button>
      </section>
    </main>
  );
}
