import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import StarEmblem from './StarEmblem';

type Accent = 'default' | 'gold' | 'teal';

type Props = {
  href: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
  accent?: Accent;
};

// Tinted medallion per accent, drawn from illuminated pigments.
const MEDALLION: Record<Accent, string> = {
  default: 'bg-gradient-to-b from-gold-300/40 to-gold-600/20 text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300',
  gold:    'bg-jewel-amber/15 text-jewel-amber ring-1 ring-jewel-amber/30',
  teal:    'bg-lapis-500/15 text-lapis-600 ring-1 ring-lapis-500/30 dark:text-lapis-300',
};

const FLOURISH: Record<Accent, string> = {
  default: '#C9A24A',
  gold:    '#D9923A',
  teal:    '#5E78D6',
};

export default function FeatureCard({ href, icon: Icon, label, hint, accent = 'default' }: Props) {
  return (
    <Link
      href={href}
      className="surface group relative flex h-full flex-col gap-2.5 overflow-hidden rounded-[18px] rounded-t-[26px] px-3.5 py-3.5 transition-all duration-300 active:scale-[0.97] hover:-translate-y-0.5"
    >
      {/* corner illumination */}
      <div className="pointer-events-none absolute -bottom-7 -left-7 opacity-[0.10] transition-opacity duration-300 group-hover:opacity-20">
        <StarEmblem size={92} color={FLOURISH[accent]} variant="star" />
      </div>

      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${MEDALLION[accent]}`}>
        <Icon size={19} strokeWidth={2} />
      </div>
      <div className="relative min-w-0">
        <div className="truncate text-[13.5px] font-bold leading-tight">{label}</div>
        {hint && (
          <div className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-ink-800/55 dark:text-ivory-100/50">
            {hint}
          </div>
        )}
      </div>
    </Link>
  );
}
