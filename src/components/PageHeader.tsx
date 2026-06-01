'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Exact reconstruction of the original `BackHeader` component (chunk 8389).
type Props = {
  title: string;
  subtitle?: string;
  backHref?: string | null;
  right?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, backHref = '/', right }: Props) {
  return (
    <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-3">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="back"
          className="grid h-9 w-9 place-items-center rounded-full surface transition active:scale-90"
        >
          <ArrowRight size={16} className="rtl:rotate-180" />
        </Link>
      ) : (
        <div className="h-9 w-9" />
      )}
      <div className="min-w-0 text-center">
        {subtitle && (
          <div className="truncate text-[10px] uppercase tracking-[0.3em] text-ink-800/55 dark:text-cream-100/55">
            {subtitle}
          </div>
        )}
        <div className="truncate font-rabar text-[17px] font-bold leading-tight">{title}</div>
      </div>
      <div className="flex h-9 min-w-9 items-center justify-end">{right}</div>
    </div>
  );
}
