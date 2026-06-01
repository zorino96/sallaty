// Girih rosette — a concentric 16/8-point khatam star drawn as illuminated
// line-art. Used as decorative illumination behind the hero, in headers, and
// as a loading/anchor motif. Kept prop-compatible with the old emblem
// (size, color) and extended with `variant` + `glow`.

type Props = {
  size?: number;
  color?: string;
  variant?: 'rosette' | 'star';
  glow?: boolean;
  strokeWidth?: number;
  className?: string;
};

function star(points: number, rOuter: number, rInner: number, cx = 50, cy = 50): string {
  const step = Math.PI / points; // half-segment
  let d = '';
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return `${d}Z`;
}

export default function StarEmblem({
  size = 240,
  color = '#E7C77B',
  variant = 'rosette',
  glow = false,
  strokeWidth = 1,
  className = '',
}: Props) {
  const id = `em-${variant}-${Math.round(size)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={className}
      style={glow ? { filter: `drop-shadow(0 0 6px ${color}66)` } : undefined}
    >
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity={0.95} />
          <stop offset="100%" stopColor={color} stopOpacity={0.4} />
        </radialGradient>
      </defs>
      <g fill="none" stroke={`url(#${id})`} strokeWidth={strokeWidth} strokeLinejoin="round">
        {variant === 'rosette' && (
          <>
            {/* radial spokes */}
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={`spoke-${i}`}
                x1="50" y1="50" x2="50" y2="3"
                opacity={0.35}
                transform={`rotate(${i * 45} 50 50)`}
              />
            ))}
            <circle cx="50" cy="50" r="47" opacity={0.5} />
            <path d={star(16, 46, 30)} />
            <path d={star(8, 33, 18)} opacity={0.85} transform="rotate(22.5 50 50)" />
            <circle cx="50" cy="50" r="9" />
            <circle cx="50" cy="50" r="3.4" fill={color} stroke="none" />
          </>
        )}
        {variant === 'star' && (
          <>
            <path d={star(8, 44, 18)} />
            <path d={star(8, 30, 12)} opacity={0.8} transform="rotate(22.5 50 50)" />
            <circle cx="50" cy="50" r="3.4" fill={color} stroke="none" />
          </>
        )}
      </g>
    </svg>
  );
}
