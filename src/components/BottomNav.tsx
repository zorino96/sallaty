'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Flame, House, MapPinned, Settings } from 'lucide-react';
import { useApp } from '@/lib/AppProvider';
import type { StringKey } from '@/lib/i18n';

const TABS: Array<{ href: string; label: StringKey; icon: typeof House }> = [
  { href: '/',         label: 'home',     icon: House },
  { href: '/qibla',    label: 'qibla',    icon: Compass },
  { href: '/mosques',  label: 'mosques',  icon: MapPinned },
  { href: '/habits',   label: 'habits',   icon: Flame },
  { href: '/settings', label: 'settings', icon: Settings },
];

export default function BottomNav() {
  const { t } = useApp();
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-30 mx-auto mt-3 mb-3 w-[92%] rounded-full surface px-3 py-2"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <ul className="flex items-center justify-between">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <li key={href} className="relative">
              <Link
                href={href}
                aria-label={t(label)}
                aria-current={active ? 'page' : undefined}
                className={
                  'relative flex h-11 min-w-[44px] items-center justify-center rounded-full px-3 transition-all active:scale-90 ' +
                  (active
                    ? 'text-gold-600 dark:text-gold-400 nav-active'
                    : 'text-ink-800/60 dark:text-cream-100/55')
                }
              >
                <Icon size={20} strokeWidth={2.2} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
