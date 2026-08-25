# Sallaty — deferred work

Everything knowingly postponed, with why. If it is not here it does not exist.

Last reviewed: 25 August 2026 (CEO review, HOLD SCOPE).

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

### Capacitor 8 compiles on iOS — proven, build 15
Codemagic build 15 (25 August, branch `chore/capacitor-8`, commit `3c53399`)
answered every open question:

| Step | Result |
|---|---|
| `npm ci` | passed on Node 22 |
| `next build` + `npx cap sync ios` | 19s — the step that would have died on Node 20 |
| `pod install` — Capacitor 8, AdMob 8, UMP `~> 3.1` | passed |
| Swift build — no `DeviceMotionPermission.swift`, target 15.0 | passed |
| `xcode-project use-profiles` + `build-ipa` | **produced `App.ipa`** |
| Upload to App Store Connect | **failed** — see below |

The upload failure has nothing to do with Capacitor:

> Invalid Pre-Release Train. The train version '1.0' is closed for new build
> submissions.
> This bundle is invalid. The value for `CFBundleShortVersionString` [1.0] must
> contain a higher version than the previously approved version [1.0].

1.0 was approved and released on 24 August, so Apple will never accept another
build against it. `MARKETING_VERSION` is now **1.0.1** on the branch, which is
all that stands between this and a TestFlight build.

**One real defect was caught before spending that build:** `@capacitor/cli` 8 and
`@capacitor-community/admob` 8 both declare `engines.node >= 22`, and
`codemagic.yaml` pinned Node 20. npm only warns on an engine mismatch, so
`npm ci` would have passed and the build would have died two steps later inside
`npx cap sync ios` with nothing in the log naming Node. Fixed, and `engines` is
declared in `package.json` so it surfaces locally too.

**Run builds against the branch, not `main`.** Codemagic is manual-only
(`triggering: events: []`) and pins no branch. `main` stays on the Capacitor 6
stack that is live on the App Store — the stack a hotfix would have to go out on.

## Revenue

### AdMob — the account was rejected
As of **25 August 2026** every AdMob URL redirects to a single gate: *"Your
account wasn't approved"*, one checkbox confirming the AdMob Program Policies,
and a **Resubmit** button. Nothing else in the console is reachable — no apps
list, no ad units, no reports. It still read "being verified" on 23 August.

The console gives no reason; Google sends it by email. **Read that before
resubmitting.** Two candidates worth ruling out first:

1. **Nothing was serving real ads when they looked.** The live Android build was
   1.0.1, which shipped Google's *test* units, so the account showed
   `Requests: 0` and the iOS app was not on any store yet.
2. **The duplicate account** noted in the `sallaty-admob-account-index` memory —
   duplicate accounts are an explicit AdMob policy violation.

Both of those have moved since: iOS 1.0 went live on 24 August and Android
1.0.2, the first build with the real units, is in review.

The checkbox is an attestation about policy compliance and belongs to the app's
owner. `app-ads.txt` and the Play store link were verified correct on 23 August
and are not the problem.

### Play 1.0.2 — submitted 23 August, in review
The live build was 1.0.1, which predated `USE_TEST_ADS = false`, so every user
saw Google's "Test mode" placeholder and the app earned nothing. **1.0.2 was
uploaded and submitted on 23 August and now reads "Release 3 (1.0.2) in review",
177 countries, 100% rollout.** Submitting it restarted the review that already
held the light screenshots and the privacy-policy URL, so all three land
together.

Verified before submitting, from the bundle rather than from the source tree:
versionCode 3, versionName 1.0.2, targetSdk 35 and minSdk 22 (so the Capacitor 8
build did not go out by mistake), and the minifier had eliminated the
`USE_TEST_ADS` branch entirely — the only ad units the shipped JavaScript can
reach are the real ones. Play raised one warning, about a missing deobfuscation
file; `minifyEnabled` is false, so there is nothing to upload and 1.0.1 carried
the same warning.

100% rollout was deliberate: with zero installs a staged percentage measures
nothing and protects nothing.

**The AAB upload is a manual step and will stay one.** The file is 15.8 MB and
the browser bridge caps a single upload at 10 MB; an AAB cannot be split. The
alternative, a Play API service account, would mean handling a private key.

## Data

### The bundled tables cover 2026 only
51 cities × 365 days, `year: 2026`. `bangTimesFromData` gates on the year, so
from 1 January 2027 every city falls through to the live amozhgary fetch — and
an offline user falls through again, to the calculation. The renewal path was
built for exactly this (see the header comment in `src/lib/bangTimes.ts`) and it
works, but it is a scrape and it will be exercised in production for the first
time on that date.

`npm run validate:bang` now warns once the tables are within 150 days of
expiring, and it runs as the first step of `npm run aab` and `npm run
cap:sync:ios`, so no release build can be cut without seeing it.

**Import the 2027 tables before January.** That removes the dependency
entirely for another year.

---

## From the CEO review, 23 August 2026

Mode: HOLD SCOPE. Two findings were acted on; the rest are recorded here and
deliberately not acted on.

### Done in this review
- **`scripts/validate-bang-data.mjs`** — checks all 51 files: every day present,
  six times each, each inside a plausible window, and ordered forward through
  the day. 18,615 days pass. Wired into both release scripts.
- **`isPlausibleRow()`** in `bangTimes.ts` — the same rules applied to the live
  scrape, so a page that stopped being a timetable is rejected rather than
  displayed with the authority of the official tables.
- **Live-refresh status on `/control`** — what the last fetch did and when, so a
  broken scrape is visible instead of silent.
- **A real bug the instrumentation immediately caught:** `bangMeta` is set
  before its bundle file is awaited, so the renewal effect read
  `bangData === null` as "today isn't covered" and scraped amozhgary.tv on
  every cold start of an app that is meant to work offline. Fixed with
  `bangLoadedFor`; verified — the request no longer happens.
- **`APP_VERSION`** was `'0.2.0'` on the diagnostics screen of a 1.0.3 app.

### Considered and NOT acted on
- **`armHeal` swallows every exception**, so the three-hourly self-heal could in
  principle die permanently and silently. Not acted on: the adhan is confirmed
  working, there is no field evidence of this ever happening, and the chain
  already has four independent recovery paths (`setAlarmClock` with fallbacks,
  the heal, `BootReceiver`, and a reschedule on every firing). Hardening against
  an unobserved failure was judged speculation, not a defect.
- **`/control` does not show the exact-alarm or battery-exemption state**, though
  `AdhanAlarmPlugin` already exposes both. Would turn a support black hole into
  self-diagnosis, and sends no data anywhere, so it does not touch the
  "no analytics" statement given to App Review. Same reasoning as above — left
  until there is a reason.
- **Double adhan is possible in a sub-second window.** The dedup key is
  `title + "@" + (millis / 60000)`, so a receiver firing at 04:59:59.9 and an
  activity starting at 05:00:00.1 get different keys.
- **No leap day.** Keys are `M-D` and the bundle holds 365 rows, so `2-29` is
  absent. 2027 is not a leap year; 2028 is.
- **A hydration error is logged on every page in dev**, including pages this
  review did not touch — pre-existing, and the production export is a different
  path. Worth a look one day, not now.
- **Still no tests beyond the data validator**, and no CI other than Codemagic's
  iOS build.
- **Capacitor 8 has no rollback plan and no staged rollout.** minSdk 22 → 24 is
  one-way for anyone who takes the update; Play offers a percentage rollout and
  nothing currently uses it.

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
- **iOS — now unblocked.** 1.0 was approved on 25 August and went live on the
  24th, so the screenshots are editable again. Upload the light 6.9" and 6.5"
  sets from `store/ios/` and `store/ios-65/`; a metadata-only change reviews on
  its own and cannot hold the app up.

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
