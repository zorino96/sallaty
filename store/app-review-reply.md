# Reply to App Review — Guideline 2.1, Information Needed

Apple's 2.1 "Information Needed" is the standard first-submission questionnaire, not a defect
report. Answer all seven points in one reply and paste the same text into **App Review Information
→ Notes** so future versions are not asked again.

Items 3–6 are drafted below and are ready to send. Items 1, 2 and 7 need the developer.

---

## 1. Screen recording — NEEDS A PHYSICAL iPhone

Record on a real device running the current iOS, starting from launch, showing the normal user
flow. Apple explicitly asks that any prompt for sensitive data appears in the recording — for
Sallaty that is the **location permission dialog**, so do not skip or pre-grant it.

Suggested run of ~90 seconds:

1. Launch from the home screen (cold start, so the splash is included).
2. Onboarding → allow, or decline, the **location permission prompt** when it appears.
3. Home screen: today's five prayer times and the countdown to the next one.
4. Tap the location bar → pick a city manually (e.g. Sulaymaniyah) → times update.
5. Settings → the adhan test button → the alarm screen appears and the call to prayer plays.
6. Qur'an → open a surah → show the Kurdish translation.
7. Qibla → the compass needle points to the Kaaba.
8. Adhkar and the dhikr counter.

Upload it somewhere Apple can reach (an unlisted YouTube link is fine) and put the URL in the reply.

## 2. Devices and OS tested — NEEDS THE DEVELOPER

State exactly what was tested; do not invent coverage. Format:

> Tested on iPhone <model>, iOS <version>, via TestFlight build 6 (1.0).

## 3. What the app does and who it is for

> Sallaty is a prayer-times, Qur'an and adhkar app for Kurdish- and Arabic-speaking Muslims,
> primarily in the Kurdistan Region of Iraq and its diaspora.
>
> The problem it solves: prayer times in this region are published as official municipal tables per
> city, and they differ from the values a generic calculation-based app produces. Sallaty ships
> those official tables for more than 50 cities, so the times match what local mosques actually
> follow. Alongside that it provides the Qur'an with a Kurdish translation, a qibla compass, and
> the daily adhkar.
>
> The whole app works offline. There is no account, no server operated by us, and nothing the user
> does leaves the device.

## 4. How to reach the main features

> No sign-in is required — the app has no accounts and no backend of any kind.
>
> 1. On first launch, allow or skip the location permission. If skipped, tap the location bar at
>    the top of the home screen and choose a city manually, e.g. Sulaymaniyah.
> 2. The home screen then shows today's five prayer times and a countdown to the next one.
> 3. To hear the adhan without waiting for a prayer time, go to Settings and use the adhan test
>    button. The alarm screen appears and plays the call to prayer.
> 4. Qur'an, the qibla compass, adhkar and the dhikr counter are reachable from the bottom tab bar.
>
> The interface is in Kurdish (Sorani) and Arabic; both can be switched in Settings.

## 5. External services and tools

> The app is designed to run fully offline; the Qur'an text, translations, prayer-time tables and
> adhan recordings are all bundled in the binary.
>
> - **Google AdMob** — small banner adverts on ordinary screens. They are deliberately not shown on
>   the Qur'an screens, the qibla compass, or while the adhan is sounding. The app does not request
>   App Tracking Transparency, so adverts are non-personalised.
> - **amozhgary.tv** — the published source of the official prayer-time tables. The tables are
>   bundled; the app may optionally contact the site to refresh times for a new year. The request
>   carries no personal data.
> - **Apple Maps / Google Maps** — only if the user taps "nearby mosques", which hands off to the
>   maps app.
>
> There is no authentication service, no payment processor, no analytics SDK and no AI service.

## 6. Regional differences

> The app behaves identically in every region. The same city list, the same Qur'an text and
> translation, and the same adhkar ship to every country; nothing is gated by territory. The only
> thing that varies is which city's prayer times the user has selected, which is the user's own
> choice.

## 7. Rights to third-party material — NEEDS A DECISION

Apple asks for documentation where an app carries protected third-party material. Sallaty contains
four such items. Reply with whatever evidence exists for each; where the licence is public, say so
and link it.

| Material | Basis |
|---|---|
| Uthmani Qur'an text | Tanzil.net — state the licence terms relied on |
| Kurdish translation — *Tafsiri Asan*, Burhan Muhammad-Amin | **Permission or licence needed** |
| Adhan: *The Adhan* — Aaqib Azeez | CC BY-SA 4.0, Wikimedia Commons |
| Adhan: *Call to prayer* — Sabah Fakhri | Creative Commons, Wikimedia Commons |
| Adhan: *Adhan al-Fajr* — Fouad Adan | Public Domain, archive.org |
| Prayer times | amozhgary.tv — published official tables |

The Kurdish translation is the one with real exposure: the other four are covered by public
licences that can simply be cited. If there is no written permission for the translation, decide
before replying whether to obtain one or to ship without it — the app already credits every source
on its Sources screen, but attribution is not the same as a licence.
