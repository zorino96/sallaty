'use client';

import BottomNav from './BottomNav';
import PageHeader from './PageHeader';
import { useApp } from '@/lib/AppProvider';
import type { StringKey } from '@/lib/i18n';

type Props = {
  titleKey: StringKey;
  subtitleKey?: StringKey;
  children?: React.ReactNode;
};

// Used for pages whose full content has not yet been re-implemented from the
// recovered bundle. They render the real shell so the layout and navigation
// match the original — only the body is a placeholder.
export default function StubPage({ titleKey, subtitleKey, children }: Props) {
  const { t } = useApp();
  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={t(titleKey)} subtitle={subtitleKey ? t(subtitleKey) : undefined} />
      <section className="px-5 pt-2 pb-10">
        {children ?? (
          <div className="surface rounded-2xl p-6 text-center text-[13px] text-ink-800/65 dark:text-cream-100/65">
            {t('todayTab')} · {t(titleKey)}
          </div>
        )}
      </section>
      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}
