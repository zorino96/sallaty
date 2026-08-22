# Sallaty — deferred work

Everything knowingly postponed, with why. If it is not here it does not exist.

Last reviewed: 23 August 2026.

---

## Deadline

### targetSdk 36 — done on the branch, not yet shipped
Play requires API 36 for any update from **1 November 2026** (extension granted
22 August; the original date was 31 August).

**The upgrade is done and it builds.** Branch `chore/capacitor-8`, built
23 August: Capacitor 6 → **8.5.0** across all eight `@capacitor/*` packages plus
`@capacitor-community/admob` 8.1.0, AGP 8.2.1 → **8.13.0**, Gradle 8.2.1 →
**8.13**, compileSdk/targetSdk 35 → **36**, minSdk 22 → **24**, Java 21.
`BUILD SUCCESSFUL`, and `tsc --noEmit` passes untouched — the web layer needed
no changes at all.

What made it possible: Capacitor 8's `@capacitor/android` hardcodes AGP
**8.13.0** and defaults compileSdk to 36, where Capacitor 6 hardcoded 8.2.1.
That one line was the entire blocker described in the 22 August entry.

Artefact: `~/Downloads/sallaty-1.0.3-versionCode4-targetSdk36.aab` (17 MB).

**Verified:** targetSdk 36 and minSdk 24 in the packaged manifest; the permission
set is identical to the approved 1.0.2; and there is still no
`foregroundServiceType` anywhere — the alarm-clock pattern survives the upgrade,
so Play will not ask for a demo video.

**Not verified: that the app still runs.** A green build is not a working app.
Ship it through the **internal testing track** so Play's pre-launch report
exercises it on real hardware — that is the substitute for the Android device we
do not have. API 36 enforces edge-to-edge with no opt-out. The web layer is
already inset-aware (`viewportFit: 'cover'`, `env(safe-area-inset-top)` on every
page, `safe-area-inset-bottom` on the nav), so the odds are good — but the bottom
navigation and the advert banner are still the pair to watch.

Side effects to accept: **minSdk 24 drops Android 5.x**, and iOS moves to a
**15.0** deployment target (Capacitor 8's floor, up from 13.0).

iOS changes on the same branch, unbuildable here (no Mac — Codemagic will tell):

- `ios/App/App/DeviceMotionPermission.swift` **deleted.** Capacitor 8's own
  `WebViewDelegationHandler` now implements
  `requestDeviceOrientationAndMotionPermissionFor` and grants it. Keeping our
  extension would put a duplicate `@objc` selector on the same class and would
  not compile. The qibla compass now gets its permission from Capacitor itself.
  `NSMotionUsageDescription` stays — CoreMotion still needs it.
- Podfile: the `GoogleUserMessagingPlatform '< 3.0'` pin **removed.** AdMob 8.1.0
  has moved to the UMP 3.x API (`ConsentStatus`) and requires `~> 3.1`; the old
  pin would now make CocoaPods unresolvable.

## Revenue

### AdMob — Android needs "Verify app", iOS needs a store
Checked 23 August. Both apps still read **"Limited ad serving"**:

- **Android** — store linked (Google Play, `com.selati.app`), one active unit,
  and the console now offers **"Verify app"** to lift the limit. That is the
  app-ads.txt ownership check against `zorino96.github.io`.
- **iOS** — still "Add store to lift limit", and cannot be linked until the app
  is actually on the App Store.

See the `sallaty-admob-needs-store-link` memory.

### Play 1.0.1 is serving test adverts
The live Android build predates `USE_TEST_ADS = false`, so every user sees
Google's "Test mode" placeholder and the app earns nothing.
`~/Downloads/sallaty-1.0.2-versionCode3.aab` (16 MB, targetSdk 35) fixes it and
the console draft is waiting only on the upload. **The upload is a manual step:**
the file is over the browser upload cap, and the alternative — a Play API service
account — would mean handling a private key.

Ship **1.0.2 first** (same risk profile as what is already live, turns on revenue
today), then **1.0.3** through internal testing. Do not conflate the two: they
are different builds that happen to be one version apart.

---

## Store presence

### Screenshots re-shot in light mode
All 21 store screenshots were dark-mode captures from 13 August; the default
theme changed to light on the 18th, so both listings showed a product that did
not match what a new user installs. Re-captured 22 August for all three sizes
(`store/`, `store/ios/`, `store/ios-65/`) and the script no longer hardcodes the
dark scheme.

- **Play — done.** Seven light phone screenshots uploaded and **submitted for
  review 23 August**, bundled with the privacy-policy URL change. Submitting
  restarted the review that had been running since the 22nd; one review covering
  both changes was judged better than two.
- **iOS — blocked, deliberately.** Screenshots are read-only while a version is
  *Waiting for Review*, so changing them means pulling 1.0 out of the queue it
  entered on 22 August. Not worth it for a theme change. **Do it the day 1.0 is
  approved** — after that it reviews on its own and cannot hold the app up.

### The Apple Developer Program License Agreement is unsigned
Flagged in App Store Connect on 23 August: the agreement was updated and **only
the Account Holder can accept it**. Until they do, no new submission and no
update goes through — including the iOS screenshot fix above. Nothing technical
blocks it; it is one signature.

App Store Connect is also asking new **social-media questions on the age rating**
(App Information). Sallaty has no social features so the answers are all "no",
but an age rating is a legal attestation and belongs to the owner.

### Screenshots carry no captions
Raw screens with no overlaid text. Every competitor annotates. Low effort,
direct effect on install rate.

---

## Competitive gaps

Measured against [کاتەکانی بانگ](https://play.google.com/store/apps/details?id=twanafaqe.katakanibangbokurdistan)
(Kreenex) — 500K+ installs, 4.8★, 23.5K reviews, the incumbent in exactly this
niche. It calculates prayer times from the usual conventions; Sallaty ships the
official amozhgary municipal tables, which is the one real differentiator and
worth protecting. What it has that Sallaty does not:

1. **Home-screen widget** (they ship four sizes). For a prayer app this is
   arguably the primary surface — most users want the next time without opening
   anything.
2. **Automatic silent during prayer.** A signature feature of this category.
3. **Ramadan mode** — Suhoor/Iftar timetable. Ramadan is the year's usage peak;
   missing it means missing the moment people go looking for an app.
4. **Kurdish calendar** alongside Hijri and Gregorian.
5. **Adhan voices** — they offer 270+, Sallaty offers 2 since the Sabah Fakhri
   recording was withdrawn.

Sallaty carries what they do not: the Qur'an with a Kurdish translation and
verse search, adhkar, a dhikr counter, and congregation tracking.

---

## Observability

### There is no crash reporting or analytics
Deliberate, and currently load-bearing: both the privacy policy and the reply
sent to App Review state that the app carries no analytics SDK. Adding Sentry
or Crashlytics would make both statements false, so it cannot happen while the
App Store submission is open.

Use the platforms' own reporting in the meantime — **Android vitals** in Play
Console and **Crashes** in App Store Connect. Neither needs an SDK and neither
contradicts anything already said.

This matters more than it looks. The adhan fires through `AlarmManager`, and
the Android market here is dominated by Xiaomi, Oppo and Huawei, whose
aggressive battery managers are known for killing exactly that. If the adhan
silently fails to sound for a segment of users, nothing currently tells us —
they simply uninstall.

If richer reporting is ever wanted, the privacy policy and the App Review notes
must be updated **first**.

---

## Technical debt

### The adhan MP3s are bundled twice
Identical files in `public/audio/` (WebView preview) and
`android/app/src/main/res/raw/` (native alarm and its notification channel).
Roughly 5.8 MB of the AAB. Deduplication is awkward: the notification channel
needs a `content://`-style resource URI, which `assets/` cannot provide without
a ContentProvider.

### Play flags three edge-to-edge warnings
"Edge-to-edge may not display for all users", "deprecated APIs or parameters
for edge-to-edge", and an R8 optimisation suggestion. Address alongside the
targetSdk 36 work — they are the same problem seen from two directions.

### Nobody is looking for this app
Zero installs against an incumbent with 500K. Everything so far has been about
shipping; nothing has been about anyone finding it. No ASO beyond the default
listing, no launch anywhere, no captions on the screenshots. Worth a plan of
its own once the App Store submission clears.

---

## Rights

### The Kurdish translation has no written permission
*Tafsiri Asan* by Burhan Muhammad-Amin ships with attribution and no licence on
file. The owner decided to ship; App Review was told plainly that we will
obtain written permission or remove the text on request. If it is ever worth
closing properly, ask the author or his publisher. Note there is an official
Tafsiri Asan app on the App Store under "© eyetmax 2024", so someone does
assert copyright over the work.
