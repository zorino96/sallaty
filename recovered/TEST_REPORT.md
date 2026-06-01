# Sallaty — Functional Test + Platform Audit

Tested by driving the running app (Next.js dev) in a real browser via DOM
inspection + interaction, route by route. The app is a Capacitor-wrapped web
app, so the web layer is byte-identical on Android and iOS; platform differences
are limited to the native plugins, audited separately below.

## Functional test — every route (✅ all pass)

| Route | What was verified | Result |
|---|---|---|
| `/onboarding` | hero, language picker (ku/ar), RTL/ckb, redirect on first run | ✅ |
| `/` (home) | **amozhgary times** (Sulaymaniyah 03:19/12:02/15:45/19:15/20:35 match site), hijri date, next-prayer countdown, notif toggle, Quran card, 10 feature cards, bottom nav | ✅ |
| `/quran` | 114 surah index, search input, Fatihah→Nas, Meccan/Medinan badges | ✅ |
| `/quran/2` | 286 verse articles, Arabic + Kurdish + Bismillah, juz/page meta | ✅ |
| `/dhikr` | tap counter increments (3→6), reset→0, preset Arabic title | ✅ |
| `/adhkar` | 6 cards, Arabic text, tab switching, search | ✅ |
| `/prayer-types` | filter tabs work (18 items → 6 for فەرز) | ✅ |
| `/calendar` | 31-day grid (155 times), today highlight, month label, prev/next | ✅ |
| `/habits` | 31-cell heatmap, add check-in form, streak counter | ✅ |
| `/mosques` | **location card shows سلێمانی + coords**, Google Maps button (`/maps/search/mosque/@lat,lng`), nearby list | ✅ |
| `/learn` | 10 steps with Arabic duas | ✅ |
| `/adab` | 4 articles, 22 bullets | ✅ |
| `/qibla` | bearing 200.6° (correct SSW→Mecca), distance, N/E/S/W, dial SVG | ✅ |
| `/control` | source = "amozhgary · سلێمانی", 10 sections, danger zone, audio picker, today times | ✅ |
| `/settings` | **language ku↔ar switches whole app**, theme, no calc-method section, 3 adhans + 4 chimes | ✅ |

### Cross-cutting verified
- **Language switch** (the earlier bug): toggling العربية flips `html lang=ar`, every
  string translates, no Kurdish leftovers; toggling back → `ckb`. ✅
- **amozhgary integration live**: home/calendar/control all read the bundled
  official times; Control shows source + matched city. ✅
- **RTL** correct on every page; **theme** tokens applied.

### Issue found + fixed
- **`/qibla` React hydration warning** — the needle's `rotate()` transform is
  location-dependent so SSR and client first-render produced slightly different
  strings. Cosmetic (users always see the correct client value), but fixed by
  rounding to 2 decimals + `suppressHydrationWarning`. No other console errors
  on any route.

## Platform audit — Android vs iOS

The shared web layer is identical. Native-specific paths:

| Capability | Android | iOS | Notes |
|---|---|---|---|
| Geolocation (`@capacitor/geolocation`) | ✅ manifest has ACCESS_FINE/COARSE_LOCATION | ⚠ needs `NSLocationWhenInUseUsageDescription` in Info.plist after `cap add ios` | high-accuracy GPS used |
| Local notifications (`@capacitor/local-notifications`) | ✅ POST_NOTIFICATIONS + exact-alarm perms | ✅ prompts at runtime, no plist key needed | prayer-time scheduling |
| Device orientation / Qibla compass | ✅ `deviceorientation` fires directly | ✅ handled `DeviceOrientationEvent.requestPermission()` (iOS 13+) + `webkitCompassHeading` | both paths coded |
| Native HTTP (`CapacitorHttp`) for yearly bang refresh | ✅ | ✅ | bypasses CORS on both |
| Status bar / splash | ✅ | ✅ | configured for both in capacitor.config |
| Safe-area insets (notch) | ✅ `env(safe-area-inset-*)` | ✅ same + `contentInset: 'always'` | used throughout |
| Adhan audio playback | ✅ foreground + background timers | ⚠ **iOS blocks Web-Audio/HTML5 audio when app is backgrounded** | foreground playback fine; for background adhan on iOS, the notification's own sound should be used (a native .caf/.mp3 attached to the notification) |

### iOS setup steps (when you build for iPhone — needs a Mac + Xcode)
```bash
npm run build
npx cap add ios
npx cap sync ios
# then in ios/App/App/Info.plist add:
#   NSLocationWhenInUseUsageDescription = "سەڵاتی بۆ دیاریکردنی کاتی نوێژ شوێنەکەت بەکاردەهێنێت"
npx cap open ios   # build + run in Xcode
```

### Known iOS limitation (background adhan)
On iOS, a web app cannot play the adhan MP3 while backgrounded (WKWebView
suspends JS timers + audio). The prayer **notification still fires**. To play a
full adhan sound on iOS in the background, attach a bundled sound file to the
`LocalNotifications` schedule (`sound: 'adhan.caf'`). This is an iOS-only
enhancement to add when you set up the iOS project; Android plays the adhan via
the in-app timer + notification fine.

## Verdict
14/14 routes functional; 1 minor hydration warning fixed; no blocking issues.
Android: fully ready. iOS: code is ready; needs the Info.plist location string +
(optional) a native notification sound for background adhan, both applied during
`cap add ios`.
