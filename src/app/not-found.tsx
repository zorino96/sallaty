'use client';

import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';

export default function NotFound() {
  const { t } = useApp();
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="font-rabar text-4xl font-bold">404</div>
      <div className="text-sm text-ink-800/70 dark:text-cream-100/70">
        {t('appName')}
      </div>
      <Link
        href="/"
        className="mt-4 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-white shadow-gold"
      >
        {t('home')}
      </Link>
    </main>
  );
}
