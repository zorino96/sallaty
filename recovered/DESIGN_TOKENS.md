# Sallaty — Design tokens (recovered)

All values extracted from `assets/public/_next/static/css/6de3ead2e0b9001e.css` in the APK.

## CSS variables

```css
:root {
  --bg:       #F5EFE0;            /* cream — body bg, light mode */
  --bg-elev:  #FBF6E9;            /* cream-50 — elevated surface */
  --ink:      #2A1F12;            /* dark brown — primary text */
  --ink-soft: #5B4A33;            /* muted brown — secondary text */
  --gold:     #C8A654;            /* primary accent */
  --line:     rgba(91, 74, 51, 0.12);
}

.dark {
  --bg:       #0E2421;            /* deep teal — body bg, dark mode */
  --bg-elev:  #152F2B;            /* elevated surface */
  --ink:      #E8E0CB;            /* warm cream — primary text */
  --ink-soft: #9FB0A7;            /* muted teal-gray */
  --gold:     #D4AF6A;            /* slightly brighter gold for contrast */
  --line:     rgba(232, 224, 203, 0.10);
}
```

`body { font-family: var(--font-app, "Almarai","Vazirmatn","Rabar",sans-serif); font-feature-settings: "kern","liga","calt"; }`

## Tailwind theme extension

```ts
// tailwind.config.ts → theme.extend.colors
{
  gold: {
    400: '#D4AF6A',
    500: '#C8A654',
    600: '#A8893F',
    700: '#86692F',
  },
  cream: {
    50:  '#FBF6E9',
    100: '#F5EFE0',
    200: '#EEE5D0',
    300: '#E4D7B5',
  },
  ink: {
    800: '#1A1A1A',  // body class uses var(--ink) instead; ink-800 is a separate alpha-text utility
  },
  teal: {
    200: '#99F6E4',  // Tailwind default — used in dark mode highlights
    700: '#1D3D38',
    800: '#152F2B',
    900: '#0E2421',
  },
  sky: {
    fajr:    '#3D2C5C',  // mid-gradient stop
    shuruq:  '#E89B5E',  // sunrise
    dhuhr:   '#A8D0E0',
    asr:     '#B0703C',
    maghrib: '#6B1F35',
    isha:    '#14122A',
  },
}
```

## Prayer-period sky gradients

Used on the `NextPrayerCard` and similar hero panels — each prayer has its own atmospheric backdrop:

| Class | Gradient (top → 60% → bottom) | Meaning |
|---|---|---|
| `.bg-sky-fajr`    | `#1E1B3A → #3D2C5C → #6E4F7C` | Pre-dawn twilight |
| `.bg-sky-shuruq`  | `#F0C57E → #E89B5E → #C26545` | Sunrise |
| `.bg-sky-dhuhr`   | `#7AB4D1 → #A8D0E0 → #E5EFF3` | Midday clear sky |
| `.bg-sky-asr`     | `#C88B4F → #B0703C → #8B4E2A` | Afternoon amber |
| `.bg-sky-maghrib` | `#8B2840 → #6B1F35 → #2E1024` | Sunset |
| `.bg-sky-isha`    | `#1E1B3A → #14122A → #0A0820` | Night |

CSS form: `background-image: linear-gradient(180deg, <stop1>, <stop2> 50-60%, <stop3>);`

## Custom utilities

```css
.phone-frame {
  width: 100%; max-width: 420px; min-height: 100dvh;
  margin: 0 auto; position: relative; overflow: hidden;
  background: var(--bg);
}

.surface {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.6), 0 4px 16px rgba(91,74,51,.06);
}
.dark .surface {
  box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 6px 16px rgba(0,0,0,.35);
}

.shadow-glass { box-shadow: 0 8px 32px rgba(0,0,0,0.12); }

.tabular { font-variant-numeric: tabular-nums; }

.nav-active::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: 999px;
  background: rgba(200,166,84,.18);
  z-index: -1;
}

.spin-slow { animation: shimmer-rotate 80s linear infinite; }
@keyframes spin       { to { transform: rotate(1turn); } }
@keyframes fade-in    { 0% { opacity: 0; transform: translateY(8px); } }
@keyframes scale-pop  { 0% { transform: scale(.9); opacity: 0; } }
```

## Fonts

```css
@font-face {
  font-family: Rabar;
  src: url(https://cdn.jsdelivr.net/gh/rabar-rwk/Rabar-Font@main/Rabar_021.ttf) format("truetype");
  font-weight: 400;
  font-display: swap;
}

.font-rabar { font-family: Rabar, Vazirmatn, Almarai, sans-serif; }
```

Body default already falls back through `Almarai → Vazirmatn → Rabar → sans-serif`. The `.font-rabar` utility is used on display headings (e.g. the "سەڵاتی" title in the top app bar).

## Lucide icons used across the app

`activity, arrow-right, bell, bell-off, book-marked, book-open, calendar-days, chevron-left, chevron-right, compass, flame, gauge, graduation-cap, heart, house, map-pin, map-pinned, search, settings, sparkles, star`.

Source: `lucide-react`.

## Spacing & sizing conventions seen

- Phone frame: `max-w-[420px]`, `min-h-[100dvh]`, padding-top respects `env(safe-area-inset-top)` with `max(12px, …)`.
- Cards: `rounded-2xl` (rows), `rounded-3xl` (hero), `rounded-full` (toggles, nav pills).
- Tap targets: `h-10 w-10` icon buttons, `h-11 min-w-[44px]` nav items.
- Headings sizes: `text-3xl` (hero prayer name), `text-[16px]` (prayer rows), `text-[13.5px]` (card titles), `text-[10.5px]–[12px]` (caption / eyebrow with `tracking-[0.2em]–[0.3em]`).
- Bottom nav: sticky `w-[92%]` rounded-full bar with `padding-bottom: max(8px, env(safe-area-inset-bottom))`.

## Theme color meta tags

```html
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#F5EFE0">
<meta name="theme-color" media="(prefers-color-scheme: dark)"  content="#0E2421">
```

## Locale

`<html lang="ckb" dir="rtl">` — Sorani Kurdish, right-to-left.
