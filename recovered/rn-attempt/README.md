# Sallaty (سەڵاتی) — Prayer Times

React Native + TypeScript (Expo) app showing the five daily prayer times
based on the device's location, plus a live countdown to the next prayer.

## Run

```powershell
npm install
npx expo start
```

Scan the QR code with Expo Go on Android/iOS, or press `w` for the web preview.

## Layout

```
App.tsx                       Entry point (SafeAreaView + StatusBar)
src/
  types/Prayer.ts             PrayerName enum + PrayerEntry type
  services/prayerTimes.ts     adhan-backed daily/current/next-prayer logic
  utils/time.ts               formatTime + formatCountdown helpers
  components/
    NextPrayerCard.tsx        Hero card with the upcoming prayer + live countdown
    PrayerRow.tsx             Single prayer row (Kurdish + English + time)
    PrayerTimes.tsx           Full day's list
  screens/HomeScreen.tsx      Wires location + computation + components
recovered/                    Original recovered files (the .tsx and large .js
                              files are corrupted ciphertext; only Prayer.* are
                              intact)
```

## Calculation method

Currently `CalculationMethod.UmmAlQura()` (Saudi-region standard). Swap to
`MuslimWorldLeague`, `Egyptian`, `Karachi`, etc. in `src/services/prayerTimes.ts`
once the app exposes a settings screen.
