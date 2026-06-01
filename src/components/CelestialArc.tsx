'use client';

// The Celestial Arc — a living astrolabe dome. The five daily prayers are
// plotted as gilded nodes along an arc that mirrors the sun's path (east /
// right → zenith → west / left, matching RTL reading). A sun (day) or crescent
// (night) glides to the real position for `now`; the upcoming prayer's node
// pulses. Pure presentational component — feed it today's times + now.

import type { DailyTimes, PrayerName } from '@/lib/types';

const R = 150;
const CX = 170;
const BASE = 170;

// Hand-tuned node angles (deg, 0°=right horizon, 90°=zenith, 180°=left horizon).
const ANG: Record<Exclude<PrayerName, 'none'>, number> = {
  fajr: 22, sunrise: 51, dhuhr: 90, asr: 129, maghrib: 157, isha: 171,
};
const SEQ: Array<Exclude<PrayerName, 'none'>> = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

const pt = (deg: number): [number, number] => {
  const r = (deg * Math.PI) / 180;
  return [CX + R * Math.cos(r), BASE - R * Math.sin(r)];
};

function sunAngle(now: number, times: DailyTimes): number {
  const t = (n: Exclude<PrayerName, 'none'>) => times[n].getTime();
  if (now <= t('fajr')) {
    const before = Math.min(16, ((t('fajr') - now) / 3_600_000) * 5);
    return ANG.fajr - before;
  }
  if (now >= t('isha')) {
    const after = Math.min(9, ((now - t('isha')) / 3_600_000) * 4);
    return ANG.isha + after;
  }
  for (let i = 0; i < SEQ.length - 1; i += 1) {
    const a = SEQ[i];
    const b = SEQ[i + 1];
    if (now >= t(a) && now < t(b)) {
      const frac = (now - t(a)) / (t(b) - t(a));
      return ANG[a] + (ANG[b] - ANG[a]) * frac;
    }
  }
  return ANG.dhuhr;
}

type Props = {
  times: DailyTimes;
  now: Date;
  nextName: PrayerName;
};

export default function CelestialArc({ times, now, nextName }: Props) {
  const nowMs = now.getTime();
  const isDay = nowMs >= times.sunrise.getTime() && nowMs < times.maghrib.getTime();
  const sa = sunAngle(nowMs, times);
  const [sx, sy] = pt(sa);

  // Smooth gilded arc, sampled so the curve is foolproof regardless of arc flags.
  let arc = '';
  for (let d = 8; d <= 172; d += 2) {
    const [x, y] = pt(d);
    arc += `${d === 8 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  // Inner astrolabe band (decorative, shorter span).
  let band = '';
  for (let d = 28; d <= 152; d += 2) {
    const r = (d * Math.PI) / 180;
    const x = CX + (R - 26) * Math.cos(r);
    const y = BASE - (R - 26) * Math.sin(r);
    band += `${d === 28 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
  }

  // A few fixed "stars" in the dome (brighter at night).
  const stars = [
    [60, 44], [108, 28], [150, 20], [212, 26], [264, 40],
    [88, 64], [240, 66], [188, 46], [134, 52],
  ];

  return (
    <svg viewBox="0 0 340 188" className="block w-full" aria-hidden="true">
      <defs>
        <linearGradient id="arcGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9A7322" />
          <stop offset="50%" stopColor="#FBEFC6" />
          <stop offset="100%" stopColor="#9A7322" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--sky-glow, #FFE7B0)" stopOpacity="1" />
          <stop offset="55%" stopColor="var(--sky-glow, #FFE7B0)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--sky-glow, #FFE7B0)" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>

      {/* stars */}
      {stars.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 1.5 : 1}
          fill="#FBEFC6"
          className="animate-twinkle"
          style={{ opacity: isDay ? 0.18 : 0.9, animationDelay: `${(i % 5) * 0.5}s` }}
        />
      ))}

      {/* horizon */}
      <line x1="18" y1={BASE} x2="322" y2={BASE} stroke="var(--sky-glow,#E7C77B)" strokeWidth="1" opacity="0.4" />
      <circle cx="18" cy={BASE} r="2.2" fill="var(--sky-glow,#E7C77B)" opacity="0.7" />
      <circle cx="322" cy={BASE} r="2.2" fill="var(--sky-glow,#E7C77B)" opacity="0.7" />

      {/* inner decorative band */}
      <path d={band} fill="none" stroke="#FBEFC6" strokeWidth="0.75" opacity="0.28" strokeDasharray="1 5" strokeLinecap="round" />

      {/* the gilded dome */}
      <path
        d={arc}
        fill="none"
        stroke="url(#arcGold)"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="animate-draw"
        style={{ ['--len' as string]: '470', strokeDasharray: 470 }}
      />

      {/* node ticks + dots */}
      {SEQ.map((name) => {
        const [nx, ny] = pt(ANG[name]);
        const [ox, oy] = (() => {
          const r = (ANG[name] * Math.PI) / 180;
          return [CX + (R + 7) * Math.cos(r), BASE - (R + 7) * Math.sin(r)];
        })();
        const passed = times[name].getTime() <= nowMs;
        const isNext = name === nextName;
        return (
          <g key={name}>
            <line x1={nx} y1={ny} x2={ox} y2={oy} stroke="var(--sky-glow,#E7C77B)" strokeWidth="1" opacity="0.45" />
            {isNext && (
              <circle cx={nx} cy={ny} r="9" fill="none" stroke="#FBEFC6" strokeWidth="1.4" className="animate-halo" style={{ transformOrigin: `${nx}px ${ny}px` }} />
            )}
            <circle
              cx={nx}
              cy={ny}
              r={isNext ? 4 : 3}
              fill={passed || isNext ? '#FBEFC6' : 'none'}
              stroke="#FBEFC6"
              strokeWidth="1.3"
              opacity={passed && !isNext ? 0.7 : 1}
            />
          </g>
        );
      })}

      {/* the wanderer — sun by day, crescent by night */}
      <g className="animate-float-y" style={{ transformOrigin: `${sx}px ${sy}px` }}>
        <circle cx={sx} cy={sy} r="22" fill="url(#sunGlow)" className="animate-halo" style={{ transformOrigin: `${sx}px ${sy}px` }} />
        {isDay ? (
          <>
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1={sx} y1={sy - 9} x2={sx} y2={sy - 13.5}
                stroke="var(--sky-glow,#FFE7B0)"
                strokeWidth="1.4"
                strokeLinecap="round"
                transform={`rotate(${i * 30} ${sx} ${sy})`}
                opacity="0.9"
              />
            ))}
            <circle cx={sx} cy={sy} r="7" fill="var(--sky-glow,#FFE7B0)" filter="url(#soft)" />
            <circle cx={sx} cy={sy} r="6" fill="#FFFDF4" />
          </>
        ) : (
          <>
            <circle cx={sx} cy={sy} r="7.5" fill="var(--sky-glow,#C9D4FF)" filter="url(#soft)" />
            <circle cx={sx} cy={sy} r="6.5" fill="#FBEFC6" />
            <circle cx={sx + 2.6} cy={sy - 1.4} r="5.6" fill="var(--sky-deep,#0B1437)" />
          </>
        )}
      </g>
    </svg>
  );
}
