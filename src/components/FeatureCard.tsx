import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type Accent = 'default' | 'gold' | 'teal';

type Props = {
  href: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
  accent?: Accent;
};

const ACCENT_CLASS: Record<Accent, string> = {
  default: 'bg-cream-100 dark:bg-teal-800 text-gold-600',
  gold:    'bg-gold-500/15 text-gold-700 dark:text-gold-400',
  teal:    'bg-teal-700/15 text-teal-700 dark:text-teal-200',
};

export default function FeatureCard({ href, icon: Icon, label, hint, accent = 'default' }: Props) {
  return (
    <Link
      href={href}
      className="surface flex h-full flex-col gap-2 rounded-2xl px-3.5 py-3.5 transition active:scale-[0.98]"
    >
      <div className={`grid h-10 w-10 place-items-center rounded-full ${ACCENT_CLASS[accent]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold leading-tight truncate">{label}</div>
        {hint && (
          <div className="mt-0.5 text-[11px] leading-snug text-ink-800/55 dark:text-cream-100/55 line-clamp-2">
            {hint}
          </div>
        )}
      </div>
    </Link>
  );
}
