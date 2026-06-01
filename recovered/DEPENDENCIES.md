# Sallaty — Recovered Dependencies

Identified from APK bundle inspection.

## Runtime

| Package | Version | Evidence |
|---|---|---|
| `next` | **15.5.18** | `main-4110f18aa40ee819.js` |
| `react` | **19.2.6** | `framework-3501e0f16f8c9170.js` |
| `react-dom` | **19.2.6** | same chunk |
| `tailwindcss` | **3.4.19** | CSS banner comment |
| `adhan` | latest | `CalculationMethod`, `MuslimWorldLeague`, `UmmAlQura`, `Karachi`, `Egyptian`, `Coordinates` strings present |
| `lucide-react` | latest | `"lucide"` plus dozens of `lucide-XXX` class names; React 19 compatible |

## Capacitor

| Plugin | Source of truth |
|---|---|
| `@capacitor/app` | `capacitor.plugins.json` |
| `@capacitor/local-notifications` | `capacitor.plugins.json` + bundle refs `LocalNotifications` |
| `@capacitor/splash-screen` | `capacitor.plugins.json` |
| `@capacitor/status-bar` | `capacitor.plugins.json` |
| `@capacitor/core` | implicit |
| `@capacitor/android` | implicit (APK is built) |

Capacitor config (`capacitor.config.json`):

- `appId`: `com.selati.app`
- `appName`: سەڵاتی
- `webDir`: `out`  → confirms `next export` (static)
- `android.allowMixedContent`: false
- SplashScreen background: `#0E2421`, duration 1200ms, full screen, immersive
- StatusBar style: DARK, background `#0E2421`, no overlay
- CapacitorHttp: enabled

## What is NOT used

- No `framer-motion`, no `next-themes`, no `zustand`/`jotai`, no `@radix-ui/*`, no `clsx`/`tailwind-merge` (Tailwind classes are written directly), no `sonner`/`react-hot-toast`, no `swr`/`react-query`.
- No `moment-hijri` / `hijri-converter` / `intl-hijri` — Hijri dates are produced by **native `Intl.DateTimeFormat('ar-IQ-u-ca-islamic-umalqura'|'ar-EG-u-ca-islamic-umalqura', …)`**.
- No `@capacitor/geolocation` plugin — location is read via the browser **`navigator.geolocation.getCurrentPosition`** API (works because Capacitor exposes it inside the WebView).
- No `@capacitor/preferences` — settings are persisted to **`localStorage`**.

## Theme / branding constants

| Token | Value | Source |
|---|---|---|
| `appName` | `سەڵاتی` | capacitor.config.json |
| PWA name | `سەڵاتی — نوێژەکانم` | manifest.json |
| Short name | `سەڵاتی` | manifest.json |
| Tagline | "Prayer times, Qibla, Adhkar and habit tracking" | manifest.json |
| `lang` | `ckb` (Sorani Kurdish) | manifest.json + `<html>` |
| `dir` | `rtl` | manifest.json + `<html>` |
| Light bg / `theme-color` light | `#F5EFE0` (cream) | manifest.json + `<meta theme-color>` |
| Dark bg / `theme-color` dark | `#0E2421` (deep teal) | `<meta theme-color>` + splash |
| Accent | `#C8A654` (gold) | manifest.json `theme_color` |
| Font (Kurdish) | **Rabar** (class `font-rabar`) | every HTML page |
| Icon font / icon kit | `lucide-react` | every page |

## Calculation method support

`adhan` `CalculationMethod` references in the bundle: `MuslimWorldLeague`, `Egyptian`, `Karachi`, `UmmAlQura`. The settings page likely exposes these as choices.

## Qibla calculation

Custom — uses the spherical bearing formula with hard-coded Kaaba coordinates `21.4225, 39.8262` inside `app/qibla/page-*.js`. Reads compass via `DeviceOrientationEvent` (webkitCompassHeading on iOS).

## Local persistence

`localStorage` is used in:

- `322-...js` (shared chunk — probably an `AppProvider` reading settings)
- `app/control/page-*.js`
- `app/page-*.js` (home)

## Geolocation

`navigator.geolocation.getCurrentPosition` used in:

- `322-...js` (shared)
- `d0deef33.*.js` (probably a hook chunk)
