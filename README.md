# Sallaty (سەڵاتی) — Prayer Times

A Muslim prayer-times PWA with Kurdish-Sorani and Arabic UI, packaged for Android via Capacitor.

## Stack (recovered from APK)

| Layer        | What |
|---|---|
| Framework    | Next.js 15 (App Router, `output: 'export'`) |
| Runtime      | React 19 |
| Styling      | Tailwind CSS 3.4 with custom theme tokens (gold/cream/teal/sky-*) and the **Rabar** Kurdish font |
| Calculations | [`adhan`](https://github.com/batoulapps/adhan-js) — Umm-al-Qura / MWL / Karachi / Egyptian / Turkey / Tehran |
| Hijri dates  | native `Intl.DateTimeFormat('ar-IQ-u-ca-islamic-umalqura')` |
| Geolocation  | `navigator.geolocation` + bigdatacloud reverse-geocode |
| Native shell | Capacitor 6 (Android) — plugins: `app`, `local-notifications`, `splash-screen`, `status-bar` |
| Icons        | `lucide-react` |
| State        | React Context (`AppProvider`) + `localStorage` (prefix `selati.`) |

## Run as a PWA

```powershell
npm install
npm run dev
```

Opens at <http://localhost:3000>. Permission prompts for location and notifications work in any modern browser.

## Build the Android APK

```powershell
npm run build         # next build && next export → ./out
npx cap add android   # one-time, creates ./android
npm run cap:sync      # copies ./out into the Android project
npx cap open android  # opens Android Studio → Build → Generate APK
```

The Capacitor config (`capacitor.config.ts`) matches the original APK exactly: app id `com.selati.app`, splash `#0E2421`, status bar dark.

## Project layout

```
public/                    static assets (manifest.json, icon.svg)
src/
  app/                     Next.js App Router routes
    layout.tsx             RTL <html>, AppProvider, phone-frame
    page.tsx               home dashboard
    qibla/, mosques/, habits/, adhkar/, dhikr/, calendar/,
    learn/, prayer-types/, adab/, control/, settings/, onboarding/
    not-found.tsx
    globals.css            CSS vars + sky gradients + Rabar @font-face
  components/
    NextPrayerCard.tsx     hero card with live countdown
    PrayerRow.tsx          single prayer row
    SkyContainer.tsx       per-period gradient + animated star emblems
    StarEmblem.tsx         8-pointed star SVG
    FeatureCard.tsx        2-column grid tile
    BottomNav.tsx          sticky 5-tab nav
    PageHeader.tsx         back-arrow + RTL header
    StubPage.tsx           placeholder shell for pages whose content is
                           still being lifted out of the recovered bundle
  lib/
    AppProvider.tsx        React context: lang, theme, coords, geoStatus,
                           notifications, calc method, madhab, getTimes
    i18n.ts                ku + ar dictionaries (200+ keys, verbatim)
    prayerTimes.ts         adhan integration + skyPeriod helpers
    geolocation.ts         getCurrentPosition + reverseGeocode + qibla
    storage.ts             selati.* localStorage helpers
    types.ts               Prayer enum (recovered) + shared types
recovered/                 the original APK + reverse-engineering artifacts
  apk-extracted/           full `unzip selati-debug.apk`
  beautified/              js-beautify'd Next.js chunks
  PAGE_SURVEY.md           one section per route, every Tailwind class + Kurdish string
  DEPENDENCIES.md          exact package versions
  DESIGN_TOKENS.md         CSS vars, palette, sky gradients, animations
  CONTENT_DATA.md          (in progress) extracted lists / articles per page
  rn-attempt/              the wrong-stack React Native scaffold (kept for reference)
```

## Status of each page

| Route | Status |
|---|---|
| `/` (home) | ✅ Full design: header, hero card, notif toggle, location, 5 prayer rows, 10-item feature grid, bottom nav |
| `/qibla` | ✅ Compass needle + bearing + distance to Mecca |
| `/settings` | ✅ Language / theme / calc-method / madhab |
| `/onboarding` | ✅ Welcome + language picker + permission request |
| `/not-found` | ✅ |
| `/adhkar`, `/dhikr`, `/calendar`, `/mosques`, `/habits`, `/learn`, `/prayer-types`, `/adab`, `/control` | 🟡 Shell + nav working; content payload still being lifted from the bundle |
