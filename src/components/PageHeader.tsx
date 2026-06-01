'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Crowned page header: a gilded back medallion, a calligraphic title flanked by
// a manuscript rule, and an optional right slot. Shared across every page, so
// the whole app inherits the illuminated feel.
type Props = {
  title: string;
  subtitle?: string;
  backHref?: string | null;
  right?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, backHref = '/', right }: Props) {
  return (
    <div className="px-5 pt-4 pb-2">
      <div className="flex items-center justify-between gap-2">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="back"
            className="surface grid h-10 w-10 place-items-center rounded-full text-gold-700 transition active:scale-90 dark:text-gold-300"
          >
            <ArrowRight size={16} className="rtl:rotate-180" />
          </Link>
        ) : (
          <div className="h-10 w-10" />
        )}

        <div className="min-w-0 text-center">
          {subtitle && (
            <div className="truncate text-[9.5px] uppercase tracking-kashida text-gold-700/80 dark:text-gold-300/75">
              {subtitle}
            </div>
          )}
          <div className="truncate font-rabar text-[18px] font-bold leading-tight">{title}</div>
        </div>

        <div className="flex h-10 min-w-10 items-center justify-end">{right}</div>
      </div>

      <div className="rule mx-auto mt-2.5 w-3/5">
        <span className="block h-1.5 w-1.5 rotate-45 bg-current opacity-80" />
      </div>
    </div>
  );
}
