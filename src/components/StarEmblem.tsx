// Eight-pointed sun/star emblem drawn behind the hero card.
// Mirrors the SVG that the original Next.js bundle inlined.
type Props = { size?: number; color?: string };

export default function StarEmblem({ size = 260, color = '#FFFAE6' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="star-g" cx="50%" cy="50%" r="55%">
          <stop offset="0%"   stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.85} />
        </radialGradient>
      </defs>
      <g transform="translate(50 50)">
        {Array.from({ length: 8 }).map((_, i) => (
          <polygon
            key={`major-${i}`}
            points="0,-42 4,-6 0,0 -4,-6"
            fill="url(#star-g)"
            transform={`rotate(${i * 45})`}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <polygon
            key={`minor-${i}`}
            points="0,-22 2,-4 0,0 -2,-4"
            fill={color}
            opacity={0.75}
            transform={`rotate(${22.5 + i * 45})`}
          />
        ))}
        <circle r="4.5" fill={color} />
      </g>
    </svg>
  );
}
