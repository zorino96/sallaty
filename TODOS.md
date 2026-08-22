# Sallaty — deferred work

Everything knowingly postponed, with why. If it is not here it does not exist.

Last reviewed: 22 August 2026.

---

## Deadline

### targetSdk 36 — Play stops accepting updates after 31 August 2026
`android/variables.gradle` targets 35. Play's console warns that this is now
outside the accepted window; after 31 August no update can be uploaded at all,
including one that fixes something urgent.

Not bundled into 1.0.2 on purpose: API 36 enforces edge-to-edge, Play already
raises three edge-to-edge warnings against the current build, and there is no
Android device here to check the result on. Folding an untested layout change
into the release that unblocks revenue trades a certain gain for an uncertain
one.

Ship it as **1.0.3** through the **internal testing track** instead — Play's
pre-launch report runs the build on real hardware in Google's device farm and
returns screenshots and crashes. That is the substitute for a device we do not
have. Watch the bottom navigation and the advert banner: that pair is where
edge-to-edge is most likely to break.

---

## Revenue

### AdMob verification
Store link added and `app-ads.txt` served from `zorino96.github.io`; both apps
still read "Requires review · Limited ad serving" until Google's crawler
catches up. Nothing further to do — see the `sallaty-admob-needs-store-link`
memory. iOS cannot be linked at all until the app is on the App Store.

### Play 1.0.1 is serving test adverts
The live Android build predates the `USE_TEST_ADS = false` change, so every
user sees Google's "Test mode" placeholder and the app earns nothing. 1.0.2
fixes it and is a saved draft in the console waiting only for the AAB upload
(the file is >10 MB, which is over the browser upload cap, so it is a manual
step).

---

## Store presence

### Screenshots show the wrong theme
All seven screenshots on both stores are dark-mode captures. The app now opens
in **light** mode, so the shop window shows a product that does not match what
a new user sees. Re-capture in light mode. On iOS this is also a soft
Guideline 2.3.3 risk ("screenshots should show the app in use").

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

---

## Rights

### The Kurdish translation has no written permission
*Tafsiri Asan* by Burhan Muhammad-Amin ships with attribution and no licence on
file. The owner decided to ship; App Review was told plainly that we will
obtain written permission or remove the text on request. If it is ever worth
closing properly, ask the author or his publisher. Note there is an official
Tafsiri Asan app on the App Store under "© eyetmax 2024", so someone does
assert copyright over the work.
