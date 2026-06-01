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

// A floating brass instrument bar. The active tab lifts into a gilded medallion.
export default function BottomNav() {
  const { t } = useApp();
  const pathname = usePathname();

  return (
    <nav
      className="glass sticky bottom-0 z-30 mx-auto mt-3 mb-3 w-[92%] max-w-[412px] rounded-[26px] px-2.5 pt-2"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <ul className="flex items-end justify-between">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={t(label)}
                aria-current={active ? 'page' : undefined}
                className="group flex flex-col items-center gap-1 rounded-2xl py-1 transition active:scale-90"
              >
                <span
                  className={
                    'grid h-10 w-10 place-items-center rounded-full transition-all duration-300 ' +
                    (active
                      ? '-translate-y-2 bg-gradient-to-b from-gold-300 to-gold-600 text-ink-900 shadow-gold'
                      : 'text-ink-800/55 dark:text-ivory-100/55 group-hover:text-gold-600')
                  }
                >
                  <Icon size={active ? 19 : 20} strokeWidth={active ? 2.4 : 2} />
                </span>
                <span
                  className={
                    'text-[9.5px] font-semibold leading-none transition-all duration-300 ' +
                    (active
                      ? '-translate-y-1.5 text-gold-700 dark:text-gold-300 opacity-100'
                      : 'text-ink-800/45 dark:text-ivory-100/40 opacity-0 group-hover:opacity-100')
                  }
                >
                  {t(label)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
