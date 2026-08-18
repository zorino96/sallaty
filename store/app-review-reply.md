# Reply to App Review — Guideline 2.1, Information Needed

Apple's 2.1 "Information Needed" is the standard first-submission questionnaire, not a defect
report. Answer all seven points in one reply and paste the same text into **App Review Information
→ Notes** so future versions are not asked again.

Items 1 and 3–7 are settled. Item 2 needs the device details, and item 1 needs the recording
uploaded and its link pasted in.

---

## 1. Screen recording — RECORDED, NEEDS UPLOADING

`sallaty-demo-for-apple.mp4`, 4 min 51 s, recorded on a physical iPhone from a cold launch on the
springboard. It covers: onboarding and language choice, the home screen with today's five prayer
times, choosing a city by hand, the Qur'an with the Kurdish translation, ayah search, the qibla
compass tracking, adhkar, the dhikr counter, nearby mosques with a handoff to Maps, and the adhan
picker. The **notification permission prompt** appears at 0:29.

Upload it as an unlisted YouTube video and put the URL in the reply.

### On the location prompt

Apple asks that prompts for sensitive data appear in the recording. The one that appears is the
notification prompt; the location prompt does not, and it is worth being straight about why rather
than filming it a fourth time.

The app asks for location during onboarding — visible at 0:05 of the raw clip, where the screen
dims behind a system alert that iOS then dismisses without drawing, because that device had
already settled the permission. Short of `Reset Location & Privacy`, which clears every app's
prompts on the phone, it cannot be made to ask again there.

It is also not the crux of the app. Location is **optional**: refuse it, or never grant it, and
Sallaty works in full — you pick a city from the list, which is exactly what the recording shows,
and every prayer time, the qibla bearing and the mosque list follow from that choice. Say so
plainly in the reply:

> Location is optional. The recording shows the app being used with a manually chosen city, which
> is the complete experience — nothing is gated behind the location permission. The prompt shown
> in the recording is the notification permission at 0:29. The location prompt appears on first
> use of the "Automatic (GPS)" option in the city picker.

## 2. Devices and OS tested — NEEDS THE DEVELOPER

State exactly what was tested; do not invent coverage. Format:

> Tested on iPhone <model>, iOS <version>, via TestFlight build 13 (1.0).

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
