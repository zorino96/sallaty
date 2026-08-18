# Reply to App Review — Guideline 2.1, Information Needed

Apple's 2.1 "Information Needed" is the standard first-submission questionnaire, not a defect
report. Answer all seven points in one reply and paste the same text into **App Review Information
→ Notes** so future versions are not asked again.

All seven items are answered and ready to send.

---

## 1. Screen recording — READY

**https://youtu.be/AmnSTwqxDfE** (unlisted, verified reachable)

`sallaty-demo-for-apple.mp4`, 5 min 04 s, recorded on a physical iPhone from a cold launch on the
springboard. It covers: onboarding and language choice, the home screen with today's five prayer
times, choosing a city by hand, the Qur'an with the Kurdish translation, ayah search, the qibla
compass tracking, adhkar, the dhikr counter, nearby mosques with a handoff to Maps, and the adhan
picker, and it closes on the GPS location feature being exercised. The **notification permission
prompt** appears at 0:29.

### On location

The recording ends on a deliberate demonstration of it, at **4:52–5:04**: the city is overridden
by hand to Fallujah, then "Automatic (GPS)" is tapped, and the app takes a real Core Location fix
and resolves back to Sulaymaniyah — coordinates and the GPS badge both visible. That is the
feature working, not merely permitted.

The permission *dialog* itself does not appear, and the reason is visible in the footage rather
than worth a fourth take: the app asks during onboarding, the screen dims behind a system alert,
and iOS dismisses it without drawing, because that device had already settled the permission.
Nothing short of Reset Location & Privacy — which clears every app's prompts on the phone — makes
it ask again there. The prompt the recording does contain is the **notification** permission, at
0:29.

Location is in any case **optional**. Refuse it and Sallaty works in full: you pick a city from
the list, which is what most of the recording shows, and the prayer times, the qibla bearing and
the mosque list all follow from that choice. Say so plainly:

> Location is optional — nothing in the app is gated behind it. The recording shows the app used
> with a manually chosen city, which is the complete experience, and at 4:52 it shows the GPS
> option being used: the city is set to Fallujah by hand, then "Automatic (GPS)" resolves back to
> the device's real location. The system prompt visible in the recording is the notification
> permission at 0:29.

## 2. Devices and OS tested — READY

> Tested on iPhone 13 Pro, iOS 26.3, via TestFlight build 13 (1.0).

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
> - **Google AdMob** — one small banner pinned to the bottom of the screen. The navigation bar sits
>   above it, lifted clear, so no tap can land on an advert by accident. It is always a banner —
>   never a full-screen or interstitial format — and it never covers content. No advert is shown
>   while the adhan is sounding. The app does not request App Tracking Transparency, so adverts are
>   non-personalised.
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

## 7. Rights to third-party material

Every licence below was read at source rather than taken from the label we had been repeating.
The Sabah Fakhri recording was **removed from the app** as a result — see the note after the table.

> Sallaty carries no material of our own beyond the app itself. Every third-party item is either
> openly licensed or a published factual table, and each is credited in-app on the Sources screen
> with a link to its licence and to where it came from:
>
> - **Uthmani Qur'an text** — the Tanzil Project, under Creative Commons Attribution 3.0
>   (https://tanzil.net/docs/text_license). The app reproduces the copyright notice the licence
>   asks for, links the licence, and links tanzil.net. The text is bundled unmodified.
> - **Adhan recording, "The Adhan"** — Aaqib Azeez, Creative Commons Attribution-ShareAlike 4.0,
>   from Wikimedia Commons. Bundled unmodified, so no adaptation arises.
> - **Adhan recording, "Adhan al-Fajr"** — Fouad Adan, marked Public Domain Mark 1.0 on
>   archive.org, where it was uploaded by the reciter's own account.
> - **Prayer times** — the official municipal timetables published by amozhgary.tv. These are
>   factual schedules rather than an authored work.
> - **Kurdish translation, "Tafsiri Asan"** — Burhan Muhammad-Amin, credited to its author in the
>   app.
>
> The app contains no other third-party text, audio, imagery or fonts.

| Material | Verified basis |
|---|---|
| Uthmani Qur'an text — Tanzil Project | **CC BY 3.0**, <https://tanzil.net/docs/text_license> — notice + both links now shown in-app |
| Adhan: *The Adhan* — Aaqib Azeez | **CC BY-SA 4.0**, [Commons file](https://commons.wikimedia.org/wiki/File:The_Adhan_-_Muslim_Call_to_Prayer_-_Aaqib_Azeez.mp3) — unmodified, so share-alike is not triggered |
| Adhan: *Adhan al-Fajr* — Fouad Adan | **Public Domain Mark 1.0**, [archive.org](https://archive.org/details/fouad-jawda_live_2), uploaded by `fouadadan1` |
| Prayer times | amozhgary.tv — published official municipal tables |
| Kurdish translation — *Tafsiri Asan*, Burhan Muhammad-Amin | Credited to the author in-app; no written licence on file |

### Removed: the Sabah Fakhri recording

Wikimedia Commons marked it Public Domain Mark 1.0 together with a US tag meaning "published
before 1 January 1931" — on a recording the same page dates to **1985** and sources from YouTube.
The claim appears to rest on the adhan *text* being ancient, which says nothing about this
*recording*; Sabah Fakhri died in 2021. Rather than defend a tag that contradicts itself while
App Review is asking about rights, the track was dropped. Two adhans remain, both on licences
that hold up. `RETIRED_IDS` in `src/data/adhanTracks.ts` sends any phone still holding the old
selection back to the default, so nobody is left with a silent alarm.

### Note on the Kurdish translation

*Tafsiri Asan* is a modern work and no written permission is on file; the owner has decided to
ship with attribution. Apple does not routinely ask for documentation per item, but if they ask
about this one specifically, the honest answer is that it is credited to its author and that
permission would be sought on request — not that a licence exists.

---

# THE MESSAGE TO SEND

Paste this verbatim into the App Review reply, and the same text into **App Review Information →
Notes** so a future version is not asked the same seven questions.

---

Thank you for the review. Answers to all seven points:

**1. Demo video.** https://youtu.be/AmnSTwqxDfE (unlisted, 5 minutes). Recorded on a physical
iPhone from a cold launch, covering onboarding, prayer times, the Qur'an with the Kurdish
translation, verse search, the qibla compass, adhkar, the dhikr counter, nearby mosques, and the
adhan settings. The notification permission prompt appears at 0:29.

Location is optional — nothing in the app is gated behind it. Most of the recording shows the app
used with a manually chosen city, which is the complete experience. At 4:52 the GPS feature is
exercised: the city is set to Fallujah by hand, then "Automatic (GPS)" is tapped and the app takes
a real location fix and resolves back to Sulaymaniyah, coordinates visible.

**2. Devices tested.** iPhone 13 Pro, iOS 26.3, via TestFlight build 13 (version 1.0).

**3. What the app is.** Sallaty is a prayer-times, Qur'an and adhkar app for Kurdish- and
Arabic-speaking Muslims, primarily in the Kurdistan Region of Iraq and its diaspora. Prayer times
there are published as official municipal tables per city and differ from what a generic
calculation produces, so Sallaty ships those official tables for more than 50 cities and the times
match what local mosques follow. Alongside that: the Qur'an with a Kurdish translation, a qibla
compass, and the daily adhkar. The whole app works offline, has no account, and no server of ours.

**4. Reaching the features.** No sign-in is required; the app has no accounts and no backend.
On first launch, allow or skip the location permission — if skipped, tap the location bar at the
top of the home screen and choose a city, e.g. Sulaymaniyah. The home screen then shows today's
five prayer times and a countdown. To hear the adhan without waiting, open Settings and use the
adhan test button. The Qur'an, qibla compass, adhkar and dhikr counter are on the bottom tab bar.
The interface is Kurdish (Sorani) and Arabic, switchable in Settings.

**5. External services.** The app runs offline; the Qur'an text, translations, prayer-time tables
and adhan recordings are bundled in the binary.
- Google AdMob — one small banner pinned to the bottom. The navigation bar sits above it, lifted
  clear, so no tap can land on an advert by accident. Always a banner, never full-screen or
  interstitial, never covering content, and never shown while the adhan is sounding. The app does
  not request App Tracking Transparency, so adverts are non-personalised.
- amozhgary.tv — the published source of the official prayer-time tables. Bundled; the app may
  optionally refresh times for a new year. The request carries no personal data.
- Apple Maps / Google Maps — only if the user taps "nearby mosques", which hands off to the maps
  app.
There is no authentication service, no payment processor, no analytics SDK and no AI service.

**6. Regional differences.** None. The same city list, Qur'an text, translation and adhkar ship
everywhere; nothing is gated by territory. The only variable is which city the user selects.

**7. Third-party material.** Every item is openly licensed or a published factual table, and each
is credited in-app on the Sources screen with links to its licence and origin:
- Uthmani Qur'an text — the Tanzil Project, Creative Commons Attribution 3.0
  (https://tanzil.net/docs/text_license). The app reproduces the copyright notice the licence
  requires and links both the licence and tanzil.net. Bundled unmodified.
- Adhan recording "The Adhan" — Aaqib Azeez, CC BY-SA 4.0, from Wikimedia Commons. Bundled
  unmodified, so no adaptation arises.
- Adhan recording "Adhan al-Fajr" — Fouad Adan, Public Domain Mark 1.0 on archive.org, uploaded
  by the reciter's own account.
- Prayer times — the official municipal timetables published by amozhgary.tv; factual schedules
  rather than an authored work.
- Kurdish translation "Tafsiri Asan" — Burhan Muhammad-Amin, credited to its author in the app.

The app contains no other third-party text, audio, imagery or fonts.
