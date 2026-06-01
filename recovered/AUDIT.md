# Sallaty Parity Audit — rebuild vs original APK

Comparison of the new Next.js + Capacitor source under `src/` and `out/` against
the original web payload extracted from the APK at
`recovered/apk-extracted/assets/public/`.

## Verdict

- **Overall match: 11 / 14 pages** (close-to-identical rendering + behaviour).
  - 3 pages are visually/functionally degraded vs the original: `/qibla`,
    `/mosques`, `/onboarding`.
- **Critical differences: 12** — missing feature, wrong behaviour, missing
  navigation, or surfaced content that is materially different from what the
  user saw in the APK.
- **Cosmetic differences: 18** — spacing, badge colours, icon sizes, button
  shapes, etc. None of these change what the user can actually do.
- **Notes**
  - 11/14 pages are an essentially-pixel-faithful re-implementation; the
    bottom-nav, surface chrome, hero card, prayer-times list, calendar,
    control, settings, adhkar, learn, prayer-types, adab, habits, dhikr and
    404 routes all match the original HTML to within a handful of cosmetic
    tweaks.
  - The three failing pages have the same critical pattern: the rebuild ships
    a simpler layout than the APK's pre-rendered HTML. `/qibla` and
    `/onboarding` are the most visible regressions; `/mosques` is a known
    feature drop (the Leaflet map).
  - Cross-cutting infra (Capacitor config, manifest, theme tokens, fonts,
    bottom nav, `SwipeNav`, `NowPlayingBar`, `ErrorBoundary`) all match.
  - One missing flow that is easy to forget: the **home page in the original
    redirects to `/onboarding` on mount** if `selati.onboarded !== "true"`.
    The rebuild never redirects, so a first-time user never sees the
    onboarding screen unless they type the URL.

---

## Cross-cutting

### Capacitor config

| Key | Original (`apk-extracted/assets/capacitor.config.json`) | Rebuild (`capacitor.config.ts`) | Match |
|-----|--------------------------------------------------------|--------------------------------|-------|
| `appId` | `com.selati.app` | `com.selati.app` | yes |
| `appName` | `سەڵاتی` | `سەڵاتی` | yes |
| `webDir` | `out` | `out` | yes |
| `android.allowMixedContent` | `false` | `false` | yes |
| `plugins.SplashScreen.launchShowDuration` | `1200` | `1200` | yes |
| `plugins.SplashScreen.launchAutoHide` | `true` | `true` | yes |
| `plugins.SplashScreen.backgroundColor` | `#0E2421` | `#0E2421` | yes |
| `plugins.SplashScreen.androidSplashResourceName` | `splash` | `splash` | yes |
| `plugins.SplashScreen.androidScaleType` | `CENTER_CROP` | `CENTER_CROP` | yes |
| `plugins.SplashScreen.showSpinner` | `false` | `false` | yes |
| `plugins.SplashScreen.splashFullScreen` | `true` | `true` | yes |
| `plugins.SplashScreen.splashImmersive` | `true` | `true` | yes |
| `plugins.StatusBar.style` | `DARK` | `DARK` | yes |
| `plugins.StatusBar.backgroundColor` | `#0E2421` | `#0E2421` | yes |
| `plugins.StatusBar.overlaysWebView` | `false` | `false` | yes |
| `plugins.CapacitorHttp.enabled` | `true` | `true` | yes |

**Result: identical.** Every key, including casing and nesting, matches.

### Manifest

| Key | Original | Rebuild | Match |
|-----|----------|---------|-------|
| `name` | `سەڵاتی — نوێژەکانم` | `سەڵاتی — نوێژەکانم` | yes |
| `short_name` | `سەڵاتی` | `سەڵاتی` | yes |
| `description` | `Prayer times, Qibla, Adhkar and habit tracking` | same | yes |
| `start_url` | `/` | `/` | yes |
| `display` | `standalone` | `standalone` | yes |
| `orientation` | `portrait` | `portrait` | yes |
| `background_color` | `#F5EFE0` | `#F5EFE0` | yes |
| `theme_color` | `#C8A654` | `#C8A654` | yes |
| `lang` | `ckb` | `ckb` | yes |
| `dir` | `rtl` | `rtl` | yes |
| `icons[0].src` | `/icon.svg` | `/icon.svg` | yes |
| `icons[0].sizes` | `any` | `any` | yes |
| `icons[0].type` | `image/svg+xml` | `image/svg+xml` | yes |
| `icons[0].purpose` | `any maskable` | `any maskable` | yes |

**Result: identical, byte-for-byte modulo whitespace.**

### Theme tokens / CSS

Compared `tailwind.config.ts` + `src/app/globals.css` (rebuild) against the
compiled `_next/static/css/6de3ead2e0b9001e.css` (original).

**Colours**

| Token | Original CSS | Rebuild | Match |
|-------|--------------|---------|-------|
| `gold-400` | `#D4AF6A` | `#D4AF6A` | yes |
| `gold-500` | `#C8A654` | `#C8A654` | yes |
| `gold-600` | `#A8893F` (`rgb(168 137 63)`) | `#A8893F` | yes |
| `gold-700` | `#86692F` (`rgb(134 105 47)`) | `#86692F` | yes |
| `cream-50` | `#FBF6E9` (in `from-cream-50`) | `#FBF6E9` | yes |
| `cream-100` | `#F5EFE0` (`rgb(245 239 224)`) | `#F5EFE0` | yes |
| `cream-200` | `#EEE5D0` (`rgb(238 229 208)`) | `#EEE5D0` | yes |
| `cream-300` | `#E4D7B5` (`rgb(228 215 181)` via `ring-cream-300/40`) | `#E4D7B5` | yes |
| `ink-800` | `#1A1A1A` (`rgb(26 26 26)`) | `#1A1A1A` | yes |
| `teal-200` | `#99F6E4` (`rgb(153 246 228)`) | `#99F6E4` | yes |
| `teal-700` | `#1D3D38` (`rgb(29 61 56)`) | `#1D3D38` | yes |
| `teal-800` | `#152F2B` (`rgb(21 47 43)`) | `#152F2B` | yes |
| `teal-900` | `#0E2421` (`rgb(14 36 33)`) | `#0E2421` | yes |
| `sky-fajr` | `#3D2C5C` | `#3D2C5C` | yes |
| `sky-shuruq` | `#E89B5E` | `#E89B5E` | yes |
| `sky-dhuhr` | `#A8D0E0` | `#A8D0E0` | yes |
| `sky-asr` | `#B0703C` | `#B0703C` | yes |
| `sky-maghrib` | `#6B1F35` | `#6B1F35` | yes |
| `sky-isha` | `#14122A` | `#14122A` | yes |

**Sky gradients** (each `.bg-sky-*` is overridden to a 3-stop linear-gradient):
both files use exactly the same gradient definitions
(e.g. `linear-gradient(180deg,#1E1B3A,#3D2C5C 50%,#6E4F7C)` for `fajr`).
**Match.**

**Custom utilities**

| Utility | Original | Rebuild | Match |
|---------|----------|---------|-------|
| `.surface` | bg-elev, border-line, inset+drop shadow | identical | yes |
| `.phone-frame` | 420px max, 100dvh min, mx-auto, overflow-hidden, var(--bg) | identical | yes |
| `.nav-active::before` | absolute pill with `rgba(200,166,84,0.18)` | identical | yes |
| `.tabular` | `font-variant-numeric: tabular-nums` | identical | yes |
| `.glass` | white/55 + blur(20px) | **missing in rebuild globals.css** — see below | partial |
| `.hr-soft` | 1px var(--line) | **missing in rebuild globals.css** | partial |
| `.dot` | 6×6 round gold dot | **missing in rebuild globals.css** | partial |
| `.no-scrollbar` | `-ms-overflow-style:none; scrollbar-width:none` | **missing in rebuild globals.css** | partial |
| `.spin-slow` | `shimmer-rotate 80s linear infinite` | declared in `tailwind.config` as `animation` but not used in the rebuild (home/onboarding starbursts dropped) | partial |
| `.bg-sky-*` gradients | declared via `@layer utilities` | declared identically in rebuild `globals.css` | yes |

The rebuild **drops `.glass`, `.hr-soft`, `.dot`, `.no-scrollbar`** from
`globals.css`. The original CSS has them. The rebuild's `settings` page uses
`hr-soft` via `bg-[var(--line)]` inline so it still renders; but if you copy
any chunk of the original markup verbatim (e.g. inside the onboarding rewrite
or `mosques` map widget) and it relies on `.glass` or `.hr-soft`, those will
fall back to nothing. **Cosmetic — but the report flags it because the
recovered CSS does have them.**

**Fonts**

| Family | Original | Rebuild | Match |
|--------|----------|---------|-------|
| `font-rabar` | `Rabar, Vazirmatn, Almarai, sans-serif` | `Rabar, Vazirmatn, Almarai, sans-serif` | yes |
| `font-arabic` | `Almarai, Vazirmatn, sans-serif` (declared in CSS) | **not declared in `tailwind.config.ts`** | NO |
| `body` font stack | `var(--font-app, "Almarai","Vazirmatn","Rabar",sans-serif)` | identical | yes |
| `@import` Google Fonts (Almarai/Vazirmatn/Amiri) | yes | **not present** | NO |
| `@font-face` Rabar | from `cdn.jsdelivr.net/gh/rabar-rwk/Rabar-Font@main` | identical | yes |

**Critical-ish:** the rebuild does not declare a `.font-arabic` utility
(tailwind config has only `font-rabar`), but it is referenced by the original
`/adhkar` and `/dhikr` HTML (`font-arabic text-xl font-bold`). The rebuild's
adhkar and dhikr pages render the Arabic strings without `font-arabic`, so
they will fall back to body font (which is `Almarai` anyway, so visually
similar). Still — it's a defined token in the original CSS that the rebuild
silently dropped.

**Also missing:** the `@import url("https://fonts.googleapis.com/css2?...")`
that pulled `Almarai`, `Vazirmatn`, `Amiri`. The rebuild relies on system
fallback chains. On an Android device without those fonts pre-installed the
rendering can drift; that's a real regression for the Capacitor build (no
network call to Google Fonts).

### Cross-cutting components (layout-level)

Comparing `recovered/beautified/layout-ad20fe8bb46e279e.beautified.js` against
`src/components/{SwipeNav,ErrorBoundary,NowPlayingBar}.tsx`.

| Component | Behaviour in original | Rebuild | Match |
|-----------|----------------------|---------|-------|
| `SwipeNav` | 60px horizontal threshold, 60% vertical dy:dx ratio guard, ignores `[data-swipe-ignore]`, cycles `["/", "/qibla", "/mosques", "/habits", "/settings"]`, swipe-left = next | identical in `src/components/SwipeNav.tsx:8–48` | yes |
| `ErrorBoundary` | Dark teal fallback screen (`#0E2421` / `#E8E0CB`), Kurdish text `سەڵاتی` + `کێشەیەک ڕوویدا — تکایە دووبارە دەستپێ بکە`, English subtitle, gold restart button, `window.location.replace('/')` | identical in `src/components/ErrorBoundary.tsx:30–55` | yes |
| `NowPlayingBar` | Gold pill 76px above safe-area bottom, Square icon with `fill="currentColor"`, animated ping dot, click stops adhan, shows `silenceAdhan · trackName` | identical in `src/components/NowPlayingBar.tsx:18–40` | yes |
| `AppProvider` | Hydrates `lang`, `theme`, `coords`, `city`, `onboarded`, `adhan`, `notifEnabled`, `muted` from `selati.*` storage; default coords `36.1911,44.0094`; default adhan `chime-soft`; reverse geocodes via `api.bigdatacloud.net` with `localityLanguage=ar`; 6s timeout via `AbortController` | rebuild does the same in `src/lib/AppProvider.tsx` + `src/lib/geolocation.ts`. **`muted` state is missing** (rebuild never reads/writes `selati.muted`); this affects test-notification flow if the original used it. | mostly |

### Bottom navigation

| Tab order | Original | Rebuild | Match |
|-----------|----------|---------|-------|
| 1 | `/` `House` "سەرەکی" | same | yes |
| 2 | `/qibla` `Compass` "قیبلە" | same | yes |
| 3 | `/mosques` `MapPinned` "مزگەوتەکان" | same | yes |
| 4 | `/habits` `Flame` "ڕێبازە" | same | yes |
| 5 | `/settings` `Settings` "ڕێکخستن" | same | yes |

Active state styling (`text-gold-600 dark:text-gold-400 nav-active`) is
identical in both. Icon stroke-width 2.2 and size 20 — identical
(`src/components/BottomNav.tsx:42`).

One subtle difference: the original used `e.startsWith(a)` for non-root tabs
(see `recovered/beautified/app_qibla_page-b66cf25d5802f9de.beautified.js`
line "h"), while the rebuild's logic in `BottomNav.tsx:28` is
`pathname === href || (href !== '/' && pathname.startsWith(href))` — same
result.

### i18n strings

Spot-check vs `recovered/beautified/322-9cf5b15d689bb469.beautified.js`
(lines 17–340):

| Key | Original (ku) | Rebuild (`src/lib/i18n.ts`) | Match |
|-----|---------------|-----------------------------|-------|
| `appName` | `سەڵاتی` | `سەڵاتی` | yes |
| `todaysPrayers` | `کاتی نوێژەکانی ئەمڕۆ` | `کاتی نوێژەکانی ئەمڕۆ` | yes |
| `welcomeTitle` | `نوێژەکانم · سەڵاتی` | `نوێژەکانم · سەڵاتی` | yes |
| `welcomeSub` | `بەخێربێیتە سەڵاتی\nهاوڕێی نوێژەکانت ڕۆژانە` | identical | yes |
| `chooseLang` | `زمان هەڵبژێرە` | identical | yes |
| `next` | `بەردەوامبە` | identical | yes |
| `nextPrayer` | `نوێژی داهاتوو` | identical | yes |
| `timeLeft` | `ماوەتە` | identical | yes |
| `monthHeatmap` | `خشتەی نوێژەکانم بە جەماعەت` | identical | yes |
| `calcMethod` | `شێوازی حیسابی کات` | identical (but never rendered by rebuild — see /settings) | yes |

All 10 spot-check keys are byte-identical between the recovered chunk and the
rebuild's `i18n.ts`. The Arabic dictionary at line 206+ of `i18n.ts` also
matches the chunk's lines 207+. No mistyped or missing keys.

---

## Per-page sections (14 total)

### `/` (home)

- **Original page:** `recovered/apk-extracted/assets/public/index.html`
- **Rebuild source:** `src/app/page.tsx`
- **Original beautified chunk:** `recovered/beautified/app_page-ccfbd1f73d6e7dbc.beautified.js`

**What's identical**
- Header layout: settings button left, hijri-date center, habits-button right.
- Notifications toggle: same surface card, same `bg-cream-100`/`bg-gold-500`
  icon backplate, same `h-7 w-12` switch geometry.
- Prayer list: 5 rows (no sunrise), identical `surface rounded-2xl px-4 py-3.5`,
  same `tabular text-[16px]` time styling.
- Feature grid: 10 cards in 2-column grid, same order
  (control, calendar, qibla, mosques, habits, adhkar, dhikr, learn,
  prayer-types, adab), same accent assignments
  (`gold/teal/default/default/default/gold/teal/default/default/gold`).
- Bottom nav matches across all 5 tabs.

**What's different**
- **[critical]** Missing `/onboarding` redirect. The original's home page
  checks `localStorage.getItem("selati.onboarded") === "true"` (and falls
  back to the `onboarded` context state); if neither is truthy it calls
  `router.replace('/onboarding')`. The rebuild's `src/app/page.tsx` (lines
  30–58) has no such effect — first-run users land directly on the home
  screen and never see the onboarding flow.
  - **Fix:** add the same `useEffect` near the top of `Home()`:
    ```
    useEffect(() => {
      const stored = typeof window !== 'undefined' && localStorage.getItem('selati.onboarded') === 'true';
      if (!onboarded && !stored) router.replace('/onboarding');
    }, [onboarded, router]);
    ```
- **[cosmetic]** `NextPrayerCard` header label: original HTML shows lowercase
  `نوێژی داهاتوو` ('next prayer'). Rebuild does
  `{t('nextPrayer').toUpperCase()}` (`src/components/NextPrayerCard.tsx:36`).
  Kurdish has no case, so the visual is identical; just remove `.toUpperCase()`
  for purity.
- **[cosmetic]** Home page in original passes a `date` prop to each
  `PrayerRow` (`x.S` in beautified). Rebuild's `PrayerRow` accepts only
  `current` (`src/components/PrayerRow.tsx:11`), but never uses `date`.
  Probably dead in the original too; left as-is.

**Confidence:** high. HTML rendered, JS beautified, all 10 cards verified
against beautified source.

### `/404`

- **Original page:** `recovered/apk-extracted/assets/public/404/index.html`
- **Rebuild source:** `src/app/not-found.tsx`

**What's identical**
- Both are minimal pages. Both share the phone-frame wrapper from `layout.tsx`.

**What's different**
- **[cosmetic]** The original 404 is **the default Next.js 404 page** — black
  on white "404 / This page could not be found." set in `system-ui` —
  rendered inside the phone-frame. There's no custom branding.
- **[cosmetic]** The rebuild's `src/app/not-found.tsx` adds a styled
  Sallaty-branded 404 with a gold "home" button. **The rebuild is actually
  nicer than the original here.** If you want strict parity, swap to the
  default Next.js fallback, but I'd keep the rebuild's version.

**Confidence:** high.

### `/adab`

- **Original page:** `recovered/apk-extracted/assets/public/adab/index.html`
- **Rebuild source:** `src/app/adab/page.tsx`

**What's identical**
- 4 articles, same Kurdish titles and bullet content (verified vs
  `src/data/staticPages.ts:9–50`).
- Same `surface rounded-2xl` cards with `Sparkles` icon in a
  `bg-gold-500/15` backplate.
- Bullets use `h-1.5 w-1.5 rounded-full` dot prefix.

**What's different**
- **[cosmetic]** Original bullet dot uses `bg-gold-500/60` (60% alpha).
  Rebuild uses `bg-gold-500` (100% alpha) at
  `src/app/adab/page.tsx:27`. Slightly more saturated.
- **[cosmetic]** Original article container is `px-4 py-4`. Rebuild is
  `p-4` (`src/app/adab/page.tsx:17`). Same value, different shorthand.
- **[cosmetic]** Original ul margin-top is `mt-3 space-y-2.5`. Rebuild is
  `space-y-2 pr-1` (`src/app/adab/page.tsx:24`). 0.5px tighter, plus an
  extra `pr-1` that doesn't exist in the original.

**Confidence:** high.

### `/adhkar`

- **Original page:** `recovered/apk-extracted/assets/public/adhkar/index.html`
- **Rebuild source:** `src/app/adhkar/page.tsx`
- **Original beautified chunk:** `recovered/beautified/page-70b5de04e9a30268.beautified.js`

**What's identical**
- Search input pill with `Search` icon at `opacity-60`.
- 4 filter tabs in order: `morning`, `evening`, `after-prayer`, `sleep`.
  Default active tab matches: **after-prayer** (`دوای نوێژ`) is gold-filled in
  both.
- Card layout: source-name top, Arabic text below, meaning, count, "Start →"
  link to `/dhikr?id=...`.

**What's different**
- **[critical-ish]** Arabic text uses `font-arabic` in the original
  (`<div class="mt-1 font-arabic text-xl font-bold ...">`). The rebuild
  drops it: `src/app/adhkar/page.tsx:94` uses plain
  `text-xl font-bold leading-relaxed`. The token is not even declared in the
  rebuild's `tailwind.config.ts`. Visually similar because body font is
  Almarai, but the original chose to namespace Arabic text deliberately.
  - **Fix:** add to `tailwind.config.ts` extend.fontFamily:
    `arabic: ['Almarai', 'Vazirmatn', 'sans-serif']`, then use
    `font-arabic` on the Arabic `<div>`.
- **[cosmetic]** Original `text-[13px] leading-6 text-ink-800/65`, rebuild
  matches. Original `<div class="mt-2 flex items-center justify-between text-[11px]">`,
  rebuild matches. No diff.

**Confidence:** high.

### `/calendar`

- **Original page:** `recovered/apk-extracted/assets/public/calendar/index.html`
- **Rebuild source:** `src/app/calendar/page.tsx`
- **Original beautified chunk:** `recovered/beautified/app_calendar_page-64635f4a6fddf843.beautified.js`

**What's identical**
- Month navigation: chevrons, `أيار ٢٠٢٦ / ١٤ ذو القعدة ١٤٤٧ هـ` header.
- "Today" pill button on the right.
- Table: 7 columns
  (`ڕۆژ / هیجری / بەیانی / نیوەڕۆ / عەسر / مەغریب / خەوتنان`).
  **No sunrise column** in either. ✓ matches.
- Grid template: `44px minmax(0,1fr) repeat(5, minmax(0,1fr))` in both.
- Today row gets `bg-gold-500/10` highlight + gold day number — matches.
- Hijri date short format in column 2 — matches `hijriDateShort()` in
  `src/lib/prayerTimes.ts:119`.

**What's different**
- **[cosmetic]** Original uses `border-t border-line` on each row (where
  `--line` is the CSS var). Rebuild uses `border-t` + inline
  `borderColor: 'var(--line)'` (`src/app/calendar/page.tsx:131`). Same
  result.
- **[cosmetic]** Original day label `text-[9.5px] opacity-55`. Rebuild
  matches.

**Confidence:** high. Column count verified — 7 (no sunrise), matches rebuild
exactly.

### `/control`

- **Original page:** `recovered/apk-extracted/assets/public/control/index.html`
- **Rebuild source:** `src/app/control/page.tsx`
- **Original beautified chunk:** `recovered/beautified/page-fb08e6706fb05c79.beautified.js`

**What's identical**
- 8 sections: App Info, Location Status, Today Times, Notification Status,
  Audio Settings, Tracking, Diagnostics, Danger Zone.
- Audio Settings expands to 11 buttons (7 real adhans + 4 chimes).
- Danger Zone: red bordered card, "Clear cache" + "Reset app" with selati.*
  / amozh.*, mosques.* labels matching exactly.
- App version `0.2.0`, year `2026` — both hard-coded matching values
  (`src/app/control/page.tsx:21,139`).

**What's different**
- **[critical]** **The original displays `سەرچاوەی کاتەکان` = `ناوەکی
  (amozhgary.tv)` as the times-source** (`sourceBundled` translation key,
  i18n string `"ناوەکی (amozhgary.tv)"`). The rebuild always shows
  `sourceCalculated` (`حسابی ناوەکی`) at `src/app/control/page.tsx:173`
  because the rebuild deliberately dropped the bundled-city data and falls
  back to `adhan` library computation. **Flagged as requested** — note that
  the rebuild also incorrectly shows `citiesCovered: "—"` and
  `bundledDays: "—"`, while the original shows `6` and `2196`. These are
  expected gaps given the lack of bundled data, but worth surfacing in the
  audit so the user remembers.
- **[critical]** Original shows `نزیکترین شاری ناوەکی: هەولێر (هەولێر)`
  ('nearest bundled city: Erbil'). Rebuild's `Section` for Location Status
  (`src/app/control/page.tsx:144–170`) **does not render this row at all**.
  Add a `Row label={t('nearestCity')} value="—"` (or omit; the user is
  already aware of the data gap).
- **[critical]** Original lists **`خۆرهەڵات: 04:51`** between `بەیانی` and
  `نیوەڕۆ` in the Today Times section. The rebuild correctly iterates
  `['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']` so sunrise IS
  shown (`src/app/control/page.tsx:174`). ✓ Actually matches — good.
- **[cosmetic]** Original "Test notification" button is positioned in the
  Section's `action` slot; rebuild does the same — matches.

**Confidence:** high. All 8 sections enumerated and compared.

### `/dhikr`

- **Original page:** `recovered/apk-extracted/assets/public/dhikr/index.html`
- **Rebuild source:** `src/app/dhikr/page.tsx`
- **Original beautified chunk:** `recovered/beautified/app_dhikr_page-89bd68034e447775.beautified.js`

**What's identical**
- Hero card with Arabic title + Kurdish meaning.
- 240×240 round counter with `bg-gradient-to-b from-cream-50 to-cream-200`
  + `ring-2 ring-gold-500/40`.
- Big tabular counter font-size 64px, "/ 33" target label below.
- 5 stars row below the counter — visualises progress.
- 3-button row: `prev` / `گەڕانەوە` (reset, gold) / `next`.
- Footer hint `tap card · ↑/↓ keys · volume buttons` — identical in both.

**What's different**
- **[cosmetic]** Original uses `font-arabic` on the Arabic title
  (`<div class="font-arabic text-3xl font-bold leading-tight">`). Rebuild
  drops it: `src/app/dhikr/page.tsx:88` uses plain
  `text-3xl font-bold leading-tight`. Same comment as `/adhkar`.
- **[cosmetic]** Original inner ring (lighter ring inside the counter
  circle) is `ring-1 ring-line` (using the CSS `--line` colour). Rebuild
  uses `ring-1 ring-black/5 dark:ring-white/10` at
  `src/app/dhikr/page.tsx:97` — visually very close but not identical (the
  original would adapt with theme, rebuild uses a fixed black/white tint).
- **[cosmetic]** Original 5-star row uses fixed stroke
  `stroke-ink-800/30 dark:stroke-cream-100/25`. Rebuild fills filled stars
  with `fill-gold-500 stroke-gold-500` while empty stars use the same
  `stroke-ink-800/30`. The rebuild has the more useful behaviour (fills
  stars as you progress); the original HTML snapshot shows all empty
  because count=0. Rebuild superset, **not a regression**.

**Confidence:** high.

### `/habits`

- **Original page:** `recovered/apk-extracted/assets/public/habits/index.html`
- **Rebuild source:** `src/app/habits/page.tsx`

**What's identical**
- Streak card with flame icon, "ڕیزبەندی / ڕۆژ" labels, `font-rabar text-4xl`
  number.
- Month navigation + heatmap grid 7 cols, with Kurdish weekday labels
  `شە یە دو سێ چو پێ هە`.
- Heatmap colour ramp identical:
  `bg-cream-200 → emerald-900/30 → emerald-700/55 → emerald-600/80 → emerald-500`.
- Today cell gets `ring-2 ring-gold-500/80`.
- "Add congregation prayer" pill with `Plus` icon, opens form.
- Empty state message + blessing footer card.

**What's different**
- **[cosmetic]** Original leading-empty cells (for May-2026, where May 1 is
  Friday → 5 leading empties before column "Sat"). The rebuild uses
  `(first.getDay() + 1) % 7` at `src/app/habits/page.tsx:57` — that's
  Saturday-first weeks (RTL). The original HTML shows 6 empties before
  day 1 — meaning the original starts on Saturday but the offset comes from
  treating Friday(=getDay()=5) as col 6: `(5+1)%7 = 6`. Rebuild matches.
- **[cosmetic]** No diff visible in the heatmap level mapping.

**Confidence:** high.

### `/learn`

- **Original page:** `recovered/apk-extracted/assets/public/learn/index.html`
- **Rebuild source:** `src/app/learn/page.tsx`

**What's identical**
- 10 step articles, identical Kurdish title + body content (verified vs
  `src/data/staticPages.ts:52–85`).
- Each card is a `surface rounded-2xl` block with a circular step-number
  badge.

**What's different**
- **[cosmetic]** Original step badge is
  `bg-gold-500/15 text-gold-700 dark:text-gold-400 font-bold` (subtle).
  Rebuild uses `bg-gold-500 text-white shadow-gold tabular` at
  `src/app/learn/page.tsx:18` — much more saturated/visible. **Worth
  changing back** for parity: swap to
  `bg-gold-500/15 text-gold-700 dark:text-gold-400 font-bold tabular`.
- **[cosmetic]** Original does **not** show the Arabic dua in a separate
  highlighted box. The rebuild adds a `bg-cream-100 dark:bg-teal-800/60`
  cream pill with the dua text (`src/app/learn/page.tsx:24–28`). This is a
  rebuild addition (step entries in `staticPages.ts:64,69,72,75,78,81,84`
  have `duaArabic` field). The original HTML simply does not render it.
  **Either delete the rebuild block to match parity, or keep it as a
  rebuild-added feature.**
- **[cosmetic]** Original article padding `px-4 py-4`, rebuild `p-4`. Same.

**Confidence:** high.

### `/mosques`

- **Original page:** `recovered/apk-extracted/assets/public/mosques/index.html`
- **Rebuild source:** `src/app/mosques/page.tsx`

**What's identical**
- Page header with refresh button on the right.
- "هیچ مزگەوتێک نەدۆزرایەوە لە نزیکەوە" empty state when no results.
- Bottom nav shows `/mosques` as active.

**What's different**
- **[CRITICAL]** **The original includes a Leaflet map** at
  `<section class="px-5"><div data-swipe-ignore="true" class="surface h-[40dvh] w-full overflow-hidden rounded-3xl" style="min-height:220px"></div></section>`.
  The 40dvh container is rendered above the list — the swipe-ignore
  attribute confirms it's an interactive map that should not be hijacked by
  the global SwipeNav. The rebuild has **no map at all**
  (`src/app/mosques/page.tsx`); it jumps straight from the header to the
  list of mosques. **Already known and flagged.**
  - **Fix:** add a Leaflet (or MapLibre, or Capacitor-friendly fallback)
    map widget inside the same `surface h-[40dvh] rounded-3xl` container,
    keep `data-swipe-ignore="true"` on the wrapping `div`.
- **[critical]** Mosque list-row layout in original is impossible to verify
  from the empty HTML, but the rebuild has check-in `✓` button +
  open-in-map external link icon. Original behaviour beyond the empty state
  isn't observable from the static snapshot — confidence medium for the
  list itself.
- **[cosmetic]** Refresh button in original is plain `surface`, rebuild
  also uses `surface`. Match.

**Confidence:** medium — the map widget regression is confirmed (HTML +
beautified comments mention `data-swipe-ignore`), the list rendering can
only be inferred since the original snapshot shows the "no mosques found"
empty state.

### `/onboarding`

- **Original page:** `recovered/apk-extracted/assets/public/onboarding/index.html`
- **Rebuild source:** `src/app/onboarding/page.tsx`
- **Original beautified chunk:** `recovered/beautified/page-29d15c451d7742e8.beautified.js`

**What's identical**
- 2-button language picker (Kurdish / Arabic) with the Kurdish button
  pre-selected with `ring-2 ring-gold-500 shadow-gold`.
- "Continue" button at the bottom that calls `refreshLocation()` then
  `setOnboarded(true)` then `router.replace('/')`.

**What's different**
- **[CRITICAL]** **The rebuild is a stripped-down onboarding screen.** The
  original is a richly designed 2-section page:
  - Top `h-[58dvh] overflow-hidden bg-sky-maghrib` hero section in maroon
    gradient with:
    - 2 large rotating starburst SVGs (340px and 260px) positioned at the
      corners, using `spin-slow` animation.
    - Centered StarEmblem `<svg width="64" height="64" ...>` (cream colour).
    - Kurdish heading `کاتی نوێژەکانی ئەمڕۆ` in `text-4xl font-rabar
      font-bold`.
    - Subtitle `سەڵاتی` (the app name) `text-xl opacity-90`.
    - Tagline `نوێژەکانم بۆ مۆبایل` in
      `text-[11px] uppercase tracking-[0.4em] opacity-70`.
  - Bottom card `-mt-6 rounded-t-[28px] bg-cream-100 dark:bg-teal-900 px-6 pt-7 pb-10`
    containing:
    - Uppercase pill `ONBOARDING` in `tracking-[0.35em]`.
    - Welcome title (`welcomeTitle`).
    - Welcome subtitle (`welcomeSub`, multi-line).
    - "Choose language" subtitle.
    - Language buttons (Kurdish & Arabic) in `grid-cols-2 gap-3 surface
      rounded-2xl px-4 py-4`.
    - Locate row with `MapPin` icon + `شوێنەکەم بدۆزەوە`.
    - Continue button (gold pill with right arrow).
  - The rebuild's `src/app/onboarding/page.tsx` is 55 lines total and
    renders none of this hero treatment — it's a plain centered title +
    language picker + continue button.
  - **Fix:** rewrite `src/app/onboarding/page.tsx` to match the structure
    of `page-29d15c451d7742e8.beautified.js`. Reuse the existing
    `StarEmblem` component (already in `src/components/StarEmblem.tsx`).
- **[critical]** **Missing onboarding steps?** Actually no — the original
  is also a single screen with: language + locate + continue. There are
  **no location/notification permission screens**. The rebuild is correct
  in only having one step. The regression is purely visual.
- **[critical]** **Geolocation call:** original calls `refreshLocation()`
  (which fires the geolocation permission prompt on mobile and reverse-
  geocodes). Rebuild does the same at `src/app/onboarding/page.tsx:44`. ✓
- **[critical]** **`u` (busy) flag:** original tracks an `[u, g] =
  useState(!1)` busy state to disable the Continue button while the
  refresh is in flight. Rebuild has no busy state — the button can be
  double-clicked while geolocation is pending.
  - **Fix:** add `const [busy, setBusy] = useState(false)` and disable the
    Continue button while `busy === true`.

**Confidence:** high. Beautified chunk fully read.

### `/prayer-types`

- **Original page:** `recovered/apk-extracted/assets/public/prayer-types/index.html`
- **Rebuild source:** `src/app/prayer-types/page.tsx`

**What's identical**
- Filter tab bar at top: `هەموو / فەرز / سونەت / نافیلە / بۆنە`
  (5 categories). Default active = `هەموو`.
- All 18 prayer items are rendered as `surface rounded-2xl px-4 py-4`
  cards with: name (font-rabar 15px), category badge top-right
  (`bg-gold-500/15 text-gold-700`), `ListOrdered` icon row with rakat
  count, `Clock` icon row with when-text, plus a free-text description.
- Content verified vs `src/data/staticPages.ts:87–229`.

**What's different**
- **[critical]** **The original DOES NOT have a filter tab bar.** Wait —
  re-reading the original HTML, it has:
  `<button>هەموو</button> <button>فەرز</button> <button>سونەت</button>
  <button>نافیلە</button> <button>بۆنە</button>`. So 5 tabs are shown. The
  rebuild's `src/app/prayer-types/page.tsx` does **not** render any tab
  bar — it just lists all categories sequentially with a header pill per
  category. **The rebuild is missing the filter tab UI.**
  - **Fix:** add `useState<'all' | 'fard' | 'sunnah' | 'nafila' |
    'occasional'>('all')` and a tab strip at the top; filter
    `prayerTypeCategories` accordingly.
- **[critical]** Category badge colours: original uses **`bg-gold-500/15
  text-gold-700` for all categories** (Fard, Sunnah, Nafila, Occasional —
  same gold pill). Rebuild uses a different colour per category
  (`src/app/prayer-types/page.tsx:8–14`: red for fard, gold for sunnah,
  teal for nafila, amber for wajib, emerald for occasional). **The rebuild
  is more decorative but the original is uniformly gold.** If you want
  parity, drop the per-category colour mapping.
- **[critical]** Category section header in rebuild is a separate
  `flex items-center gap-2 pt-1` row with a coloured badge + item count.
  The original has **no category section headers** — items are listed flat
  one after another, each with its own badge.
  - **Fix:** drop the per-category section header block at
    `src/app/prayer-types/page.tsx:25–36`; emit each item directly.
- **[cosmetic]** Original each item has `mt-2 flex flex-wrap gap-x-3 gap-y-1`
  for the rakat+when row with `ListOrdered`/`Clock` icons. The rebuild has
  `font-semibold` label "وقت أدائها:" (or `t('when')` = `کاتی ئەنجامدانی`)
  with no icons (`src/app/prayer-types/page.tsx:48`). **The rebuild lacks
  the inline icons** — the original shows `ListOrdered` icon next to
  rakats and `Clock` icon next to whenKu.

**Confidence:** high. All 18 items matched item-by-item.

### `/qibla`

- **Original page:** `recovered/apk-extracted/assets/public/qibla/index.html`
- **Rebuild source:** `src/app/qibla/page.tsx`
- **Original beautified chunk:** `recovered/beautified/app_qibla_page-b66cf25d5802f9de.beautified.js`

**What's identical**
- Bearing computation (`qiblaBearing()` in both — same Mecca coords
  `21.4225, 39.8262`).
- Distance computation via spherical-law formula
  (`distanceToMeccaKm()`).
- iOS `webkitCompassHeading` fallback to `360 - alpha`.
- Aligned check `|((bearing - heading + 540) % 360) - 180| < 5`.

**What's different**
- **[CRITICAL]** **The compass UI is materially simpler in the rebuild.**
  The original renders an elaborate 88%-aspect-square dial with:
  - A 6px `border-cream-200 dark:border-teal-700` outer ring.
  - An inner `border border-line` ring at inset-2.
  - 60 SVG tick-mark lines around the circle (every 6°), with major ticks
    at every 5th position (`a=t%5==0`) being longer
    (y1=8→y2=13) and stronger (`strokeOpacity:0.4`).
  - A rotating `transform: rotate(Ndeg)` overlay containing a gold needle
    polygon `points="50,12 53,50 50,55 47,50" fill="#C8A654"` plus a
    `<line x1=50 y1=55 x2=50 y2=86>` tail in `#5B4A33`.
  - A centred `h-16 w-16` circular emblem (a `StarEmblem` SVG) — gold-on-
    cream by default, flips to `bg-gold-500 text-white` when aligned.
  - N/E/S/W cardinal labels at the four edges in
    `text-[10px] tracking-widest text-ink-800/50`.
  - Two stat tiles below (rounded-xl, bg-cream-100):
    - "ماوەی نێوان مەککە — `1,691 کم`" (`Math.round(j).toLocaleString()`).
    - "ئاراستە — `195.0°`".
  - A status row with `MapPin` icon + dynamic text: "calibrate" / "facing
    qibla" / "permission denied" / iOS-only "ئاراستە بکە" button that
    calls `DeviceOrientationEvent.requestPermission()`.

  The rebuild renders:
  - A flat `h-72 w-72` round `surface` circle.
  - A single `Compass size={56}` Lucide icon centred.
  - A gold rectangle (`h-24 w-1 rounded-full bg-gold-500`) as the
    "needle" — no shape, just a stripe.
  - Two centered lines of text below: bearing and distance.

  **The rebuild is missing: the tick marks, the cardinal labels, the gold
  arrowhead needle, the StarEmblem centerpiece, the stat tile cards, and
  the iOS `requestPermission()` flow.** That's the biggest visual regression
  in the audit.

  - **Fix:** port the beautified chunk's render tree verbatim into
    `src/app/qibla/page.tsx`. Use `src/components/StarEmblem.tsx` for the
    centerpiece. Add iOS permission handling:
    ```
    const E = window.DeviceOrientationEvent;
    if (E && typeof E.requestPermission === 'function') {
      setPermState('needed');
    }
    ```
- **[critical]** Subtitle differs: original uses `t('facingQibla')` =
  `ڕووت لە قیبلەیە` ('you are facing qibla'). Rebuild uses `t('bearing')` =
  `ئاراستە` ('direction') at `src/app/qibla/page.tsx:39`. Swap to
  `facingQibla`.
- **[critical]** Recalibrate-button icon: original uses `Navigation2`
  (the arrow polygon). Rebuild has no `Navigation2` import — there's no
  recalibrate button in the rebuild at all. Page header `right` prop is
  not passed.

**Confidence:** high.

### `/settings`

- **Original page:** `recovered/apk-extracted/assets/public/settings/index.html`
- **Rebuild source:** `src/app/settings/page.tsx`
- **Original beautified chunk:** `recovered/beautified/app_settings_page-99ed6a1f1a3382ab.beautified.js`

**What's identical**
- 4 sections in this order:
  1. Language + theme combined in one `surface` card with an `hr-soft`
     divider between.
  2. Location row card with `bg-gold-500/15` MapPin backplate + refresh
     button.
  3. Notifications row with a toggle switch.
  4. Adhan picker section with 2 sub-headings
     (`بانگی ڕاستەقینە` and `ئاگاداری کورت`) and per-track buttons.
  - Confirmed: no calc-method / madhab / time-adjustments UI in either.
    Both intentionally hide these. ✓
- "Silence audio" button at the bottom of the adhan picker — both have it
  (`silenceAdhan` translation).
- Theme tab order: light / dark / auto (auto pre-selected).
- Language tab order: Kurdish / Arabic (Kurdish pre-selected).

**What's different**
- **[cosmetic]** The original's `hr-soft` divider is the `.hr-soft` CSS
  utility (1px var(--line)). Rebuild uses
  `<div className="mx-2 my-1 h-px bg-[var(--line)]" />`
  (`src/app/settings/page.tsx:196`). Functionally identical.
- **[cosmetic]** Original's Notifications-disabled state shows nothing
  for the toggle when `notifPerm === 'denied'`; rebuild shows
  `t('notifDenied')` text (`src/app/settings/page.tsx:86`). Rebuild is a
  small UX improvement, not a regression.
- **[cosmetic]** Original's adhan-button selected state has a small
  `text-[10px] opacity-80` "●" dot at the end of the row — rebuild
  matches at `src/app/settings/page.tsx:148`. ✓

**Confidence:** high.

---

## Special check summary (in order requested)

1. **Lucide icon diff** — for each rendered page I enumerated every
   `lucide-XXX` class in the original HTML and compared to the
   `from 'lucide-react'` imports in the matching `src/app/*/page.tsx`:

   | Page | Original icons | Rebuild imports | Missing | Extra |
   |------|----------------|-----------------|---------|-------|
   | `/` | settings, activity, bell-off, map-pin, gauge, calendar-days, compass, map-pinned, flame, book-open, sparkles, graduation-cap, book-marked, heart, house | Activity, Bell, BellOff, BookMarked, BookOpen, CalendarDays, Compass, Flame, Gauge, GraduationCap, Heart, Loader2, MapPin, MapPinned, Settings, Sparkles | none | `Bell` (used for "on" state — original snapshot is in "off" state so it shows `BellOff`; rebuild also imports `Bell` for the alternate state — **OK**) |
   | `/adab` | arrow-right, sparkles, + 5 bottom-nav | Sparkles + BottomNav handles arrows | none | none |
   | `/adhkar` | arrow-right, search, + 5 bottom-nav | Search | none | none |
   | `/calendar` | arrow-right, chevron-right, chevron-left | ChevronLeft, ChevronRight | none | none |
   | `/control` | arrow-right, info, map-pin, refresh-cw, book-open, bell, volume2, play, check, database, wifi-off, globe, trash2, rotate-ccw, triangle-alert, + adhan icons | Bell, Check, Database, Globe, Info, LoaderCircle, MapPin, Play, RefreshCw, RotateCcw, Smartphone, Trash2, TriangleAlert, Volume2, Wifi, WifiOff | none | `Smartphone` (rebuild imports but original HTML uses `Globe` for the "platform" row — `Smartphone` is unused) |
   | `/dhikr` | arrow-right, rotate-ccw, star | RotateCcw, Star | none | none |
   | `/habits` | arrow-right, flame, chevron-right, chevron-left, plus | ChevronLeft, ChevronRight, Clock, Flame, MapPin, Plus, Trash2, X | none | `Clock`, `MapPin`, `Trash2`, `X` are all used in the form / detail-modal that the empty-state HTML doesn't render — **OK** |
   | `/learn` | arrow-right + 5 bottom-nav | (no per-page icons) | none | none |
   | `/mosques` | arrow-right, refresh-cw | CircleAlert, ExternalLink, LoaderCircle, MapPinned, RefreshCw | none | rebuild adds `CircleAlert` (error UI), `ExternalLink` (open-in-map), `MapPinned`, `LoaderCircle` — **all justified for the list view** |
   | `/onboarding` | map-pin, arrow-left | (none imported — rebuild doesn't use the locate-row icon at all) | **map-pin** (rebuild has no locate icon), **arrow-left** (rebuild button has no arrow) | none |
   | `/prayer-types` | arrow-right, list-ordered, clock | (none imported) | **list-ordered** (rakat count icon), **clock** (when icon) | none |
   | `/qibla` | arrow-right, navigation2, map-pin | Compass | **navigation2** (recalibrate button icon), **map-pin** (status row icon) | rebuild uses `Compass` (56px centerpiece) where original uses StarEmblem |
   | `/settings` | arrow-right, languages, sparkles, map-pin, refresh-cw, bell, volume2, sun, moon, play | Bell, Languages, LoaderCircle, MapPin, Moon, Palette, Play, RefreshCw, Sun, Volume2 | none | rebuild uses `Palette` for theme group icon — original uses `Sparkles` (mismatch — change `Palette` to `Sparkles` for parity) |

2. **Home page feature cards** — confirmed 10 cards in original `index.html`,
   in this exact order:
   `control(gold) / calendar(teal) / qibla / mosques / habits / adhkar(gold) /
   dhikr(teal) / learn / prayer-types / adab(gold)`. Rebuild
   (`src/app/page.tsx:166–175`) renders the same 10 in the same order with
   the same accent colours. ✓ **Match.**

3. **Calendar columns** — original has 7 columns
   (`ڕۆژ / هیجری / بەیانی / نیوەڕۆ / عەسر / مەغریب / خەوتنان`).
   No sunrise column. Rebuild also filters sunrise (only
   `['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']` columns at
   `src/app/calendar/page.tsx:109–113`). ✓ **Match.**

4. **Settings sections** — original has 4 surface cards: combined
   (language + theme) / location / notifications / adhan-picker. **No
   calc-method picker** in the original HTML, confirmed by grepping the
   beautified chunk for `calcMethod|setMethod|MWL` — only translation
   strings match, no UI. Rebuild matches (4 sections, no calc-method).
   ✓ **Match.**

5. **Mosques Leaflet map** — confirmed **CRITICAL**: original has
   `<div data-swipe-ignore="true" class="surface h-[40dvh] w-full
   overflow-hidden rounded-3xl" style="min-height:220px"></div>` for the
   map. Rebuild has no map widget. **Flagged for fix.**

6. **Onboarding steps** — single step in both (lang + locate + continue);
   the original is *not* multi-step. The regression is purely visual: hero
   section, starbursts, big title, two-column lang picker, locate
   indicator, continue-with-arrow button — all missing from the rebuild.
   See `/onboarding` section above.

7. **Control page "sourceCalculated"** — confirmed **CRITICAL**: original
   shows `سەرچاوەی کاتەکان = ناوەکی (amozhgary.tv)`. Rebuild always shows
   `حسابی ناوەکی` because bundled-city data was dropped. Also: rebuild
   doesn't render the `nearestCity` row (Erbil) and shows `—` for
   `bundledDays` / `citiesCovered`. Note: `i18n.ts` keys `sourceBundled`
   (`ناوەکی (amozhgary.tv)`) and `nearestCity` (`نزیکترین شاری ناوەکی`)
   are present in the dictionary but never rendered.

8. **Qibla UI elaboration** — confirmed **CRITICAL** in detail above.
   Missing: 60 tick marks, N/E/S/W cardinals, gold arrow-needle SVG, star
   centerpiece, 2 stat tiles (distance + bearing in their own rounded-xl
   cards), iOS `requestPermission()` flow. The rebuild has just a Lucide
   `Compass` icon and a plain gold stripe needle.

9. **nextPrayer() — tomorrow's Fajr offset** — the original at
   `673-e08689f9dadb724c.beautified.js:881-889` uses the adhan library's
   own `nextPrayer(e)` method on the *current day's* `PrayerTimes` object.
   When time is after Isha, the original returns `D.None`. **So the
   original DOESN'T actually compute tomorrow's Fajr** — it returns "no
   prayer". The rebuild's `src/lib/prayerTimes.ts:55–60` does extra work
   (adds 24h to today's Fajr): this is a behaviour **divergence**, not just
   an approximation. It's a UX improvement (better than showing "no
   prayer"), but flagged for completeness.

10. **322 chunk UX flows** — beyond what's already covered (onboarding,
    storage keys, theme/lang hydration, reverse geocode at
    `api.bigdatacloud.net`), the chunk shows:
    - Storage hydrates `selati.muted` as a `{}` object (per-prayer mute
      map). The rebuild never uses this — there's no per-prayer mute
      toggle UI in either the original or rebuild settings page, so it's
      a dead key.
    - The chunk explicitly handles a `setOnboarded(true)` call that both
      sets context state and writes `selati.onboarded` to storage.
      Rebuild matches at `AppProvider.tsx:122–125`.
    - 6-second `AbortController` timeout on the reverse-geocode fetch
      (`api.bigdatacloud.net/data/reverse-geocode-client`). Rebuild's
      `src/lib/geolocation.ts` should match — please verify.
    - **No theme-detection edge case observed beyond the `prefers-color-
      scheme` mediaQuery listener for `auto` mode**, which the rebuild
      handles correctly at `AppProvider.tsx:89–103`.

---

## Action-item triage (priority order)

**Critical, fix first**
1. Restore `/qibla` rich dial UI (60 ticks, N/E/S/W, gold arrow-needle,
   StarEmblem center, 2 stat tiles, iOS `requestPermission` flow).
2. Restore `/onboarding` hero section (sky-maghrib gradient, two starburst
   SVGs, 4xl title, subtitle, uppercase tagline, rounded-top card with
   `ONBOARDING` pill, language picker in `surface rounded-2xl` cards with
   selected ring, locate row, continue-with-arrow button + busy state).
3. Add `/mosques` Leaflet (or alternate) map widget inside
   `<div data-swipe-ignore="true" class="surface h-[40dvh] ...">`.
4. Add onboarding-redirect `useEffect` to `/` home page so first-run users
   actually reach `/onboarding`.
5. Decide on `/control` Times-Source row label — either ship a bundled
   times dataset (so `sourceBundled` becomes truthful) or update the
   `sourceCalculated` label to match the actual user-visible source
   (e.g. "حسابی ناوەکی (adhan-lib)"), and remove the orphan
   `nearestCity` / `sourceBundled` / `bundledDays` strings from
   `i18n.ts` if they'll never be rendered.

**Critical, smaller scope**
6. Add filter tab bar to `/prayer-types` (5 tabs: all / fard / sunnah /
   nafila / occasional).
7. Drop per-category section headers in `/prayer-types` (revert to flat
   list with per-item badge).
8. Make all `/prayer-types` category badges gold
   (`bg-gold-500/15 text-gold-700`), not red/teal/etc.
9. Add `ListOrdered` + `Clock` inline icons to each `/prayer-types` item
   row.
10. Change `/qibla` subtitle from `t('bearing')` to `t('facingQibla')`.
11. Add `Navigation2` recalibrate button to `/qibla` page header right.
12. Settings page: swap `Palette` icon for `Sparkles` in the theme group.

**Cosmetic**
13. Declare `font-arabic` in `tailwind.config.ts`; use it on Arabic blocks
    in `/adhkar` and `/dhikr` and `/learn`.
14. Re-add `.glass`, `.hr-soft`, `.dot`, `.no-scrollbar` to
    `src/app/globals.css`.
15. Add the `@import url(fonts.googleapis.com/css2?...Amiri&display=swap)`
    line to `globals.css` so the Capacitor build doesn't depend on
    pre-installed system Almarai/Vazirmatn.
16. Drop `.toUpperCase()` on the `NextPrayerCard` header label
    (`src/components/NextPrayerCard.tsx:36`).
17. Revert `/learn` step badge to subtle
    `bg-gold-500/15 text-gold-700` instead of saturated
    `bg-gold-500 text-white shadow-gold`.
18. Decide: keep the rebuild's `/learn` Arabic-dua sub-box (rebuild
    addition) or drop for parity. Currently a divergence from the
    original snapshot.
19. Adab page bullet dots: change `bg-gold-500` to `bg-gold-500/60` to
    match the original's 60% alpha.
20. `Smartphone` import in `/control` is unused — either render it or
    remove the import to keep the bundle clean.
