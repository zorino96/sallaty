# iOS Setup — سەڵاتی (Sallaty)

## کورتە / ملخص

پڕۆژەی **iOS** ئامادە کراوە (فۆڵدەری `ios/`). بەڵام **دەبێت لەسەر Mac دروست بکرێت** — ناتوانرێ لەسەر Windows.

- ئەمانە لەسەر Windows **ناکرێن** و لەسەر Mac دەکرێن: `pod install`، دروستکردن بە Xcode، گۆڕینی دەنگی بانگ.
- **بانگ لەسەر iOS:** Apple ڕێگە نادات شاشە هەڵبکرێت یان دەنگی پشتەوە بە کاتی دیاریکراو لێبدرێت، و دەنگی نۆتیفیکەیشن زۆرترین **٣٠ چرکە**یە. بۆیە لەسەر iOS بانگ = نۆتیفیکەیشنێک لەگەڵ دەنگێکی کورتی بانگ (≤۳۰ چرکە) — نەک ئەو ئەزموونەی ئەندرۆید. ئەمە سنووری سیستەمی iOS ـە، نەک کێشەی ئەپەکە.
- لایەنی وێب (کاتەکانی نوێژ، قورئان، گەڕان، نیشانکردن، قیبلە، زیکر، دیزاین) بە تەواوی لەسەر iOS کار دەکات.

---

## What's already done (committed, cross-platform)

- `ios/` Xcode project scaffolded via `npx cap add ios`.
- `@capacitor/ios` added to `package.json`.
- `src/lib/notifications.ts` is **platform-aware**: on iOS it schedules `LocalNotifications` with a short bundled adhan sound (the Android-only exact-alarm/foreground-service pipeline is skipped — it can't run on iOS).
- `ios/App/App/Info.plist` already has the **location usage strings** (`NSLocationWhenInUseUsageDescription`) — without these iOS crashes the moment the geolocation plugin asks for location.

## Prerequisites (Mac only)

- macOS with **Xcode 15+**
- **CocoaPods**: `sudo gem install cocoapods` (or `brew install cocoapods`)
- Node 18+ and npm
- An Apple Developer account (free is enough to run on your own device)

## First build on the Mac

```bash
# 1. Get the project onto the Mac (clone or copy the repo)
cd Sallaty_Prayer_App

# 2. Install JS deps
npm install

# 3. Build the static web export → out/
npm run build

# 4. Sync into the iOS project (copies web assets + runs `pod install`)
npx cap sync ios
#    (shortcut: npm run cap:sync:ios)

# 5. Open in Xcode
npx cap open ios
```

In Xcode: select the **App** target → **Signing & Capabilities** → choose your Team, then pick a device/simulator and press **Run** (⌘R).

After any change to the web app, re-run `npm run cap:sync:ios` then rebuild in Xcode.

## Adhan sounds on iOS (≤30s `.caf`)

The notification sound must be a file **inside the app bundle**, **≤30 seconds**, in `caf`/`aiff`/`wav`. The JS references them by the same base names as Android `res/raw` with a `.caf` extension: `adhan_aqib.caf`, `adhan_egypt.caf`, `adhan_fakhry.caf`.

Generate them on the Mac from the source MP3s in `public/audio/` (trim to 30s, then convert to IMA4 CAF — the iOS notification format):

```bash
brew install ffmpeg          # for trimming
for f in aqib egypt fakhry; do
  ffmpeg -y -i "public/audio/adhan-$f.mp3" -t 30 -ac 1 -ar 44100 -c:a pcm_s16le "/tmp/adhan_$f.wav"
  afconvert "/tmp/adhan_$f.wav" "ios/App/App/adhan_$f.caf" -d ima4 -f caff
done
```

Then in Xcode: drag the three `.caf` files into the **App** target (check **Copy items if needed** and ensure **Target Membership = App**) so they land in **Build Phases → Copy Bundle Resources**. They must sit at the bundle root so iOS can find them by name.

> If the `.caf` files are absent, iOS simply plays the **default** notification sound — the app still works, just without the custom adhan voice.

## Notifications permission

The app requests notification permission at runtime (`LocalNotifications.requestPermissions()` in `src/lib/notifications.ts`). iOS shows the system prompt automatically; no extra Info.plist key is required for **local** notifications. (Push notifications are **not** used, so no APNs / Push capability is needed.)

## What iOS does NOT support (vs Android)

| Capability | Android | iOS |
|---|---|---|
| Full-length adhan when locked / screen off | ✅ native `AdhanSound` (MediaPlayer, USAGE_ALARM) | ❌ notification sound capped at 30s |
| Wake the screen like an alarm clock | ✅ full-screen intent + `AdhanAlarmActivity` | ❌ not permitted |
| Exact alarm / Doze exemption / battery-optimization opt-out | ✅ | ❌ concept doesn't exist (and isn't needed) |
| Re-arm alarms after reboot | ✅ `BootReceiver` | ❌ local notifications persist in the OS scheduler instead |

These Android behaviours live entirely in `android/.../AdhanSound.java`, `AdhanReceiver.java`, `AdhanAlarmActivity.java`, `AdhanScheduler.java`, and the `AdhanAlarm` plugin — there is **no** iOS equivalent because iOS forbids them. The iOS adhan uses the best the platform allows: a scheduled local notification with a ≤30s sound.

## Repo note

The `ios/` project is committed **without** the `Pods/` directory and Xcode user state — `pod install` regenerates `Pods/` on the Mac during `npx cap sync ios`.
