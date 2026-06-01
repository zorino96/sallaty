# Sallaty Prayer App - Page Survey

Comprehensive survey of all 14 server-rendered pages from the recovered Next.js + Capacitor Islamic prayer app.

---

## / (Home / Dashboard)

**Page Title:** "سەڵاتی" | "Sallaty"  
**Kurdish Heading:** Home dashboard with prayer times and feature grid

**Major Sections / Layout Blocks:**
- NextPrayerCard: Hero card with countdown timer ("ماوەتە· 00:22:20")
- Prayer times list: 5 rows showing current day prayer times (بەیانی 03:07, نیوەڕۆ 12:02, عەسر 15:51, مەغریب 19:11, خەوتنان 20:56)
- Hijri date display: "٨ ذو الحجة ١٤٤٧ هـ"
- Location badge: "شوێن: شکرە"
- 10-item feature grid (2×5 layout): کۆنترۆڵ, ڕۆژژمێر, قیبلە, مزگەوتەکان, ڕێبازە, ئەزکار, ذکر, فێرکاری نوێژ, جۆرەکانی نوێژ, ئادابەکان و پەروەردەی منداڵان
- Bottom navigation bar (5 items)

**Lucide Icons Used:**
settings, activity, bell-off, compass, calendar-days, gauge, map-pinned, flame, book-open, sparkles, graduation-cap, book-marked, heart

**Tailwind Custom Theme Tokens:**
sky-dhuhr, gold-*, teal-*, cream-*, ink-*, surface, shadow-glass, tabular, font-rabar, phone-frame, nav-active

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, SwipeNav, NowPlayingBar, ClientPageRoot

**Outbound Links:**
- / (self)
- /qibla
- /calendar
- /mosques
- /habits
- /adhkar
- /dhikr
- /learn
- /prayer-types
- /adab
- /control
- /settings

**Visible Baked-in Data:**
- Prayer times: بەیانی 03:07, نیوەڕۆ 12:02, عەسر 15:51, مەغریب 19:11, خەوتنان 20:56
- Hijri date: ٨ ذو الحجة ١٤٤٧ هـ
- Location: شکرە (36.1911°N, 44.0094°E)
- Next prayer countdown timer format: "ماوەتە· HH:MM:SS"
- Feature card titles in Kurdish and Arabic
- Bottom nav items: Home, Qibla, Mosques, Habits, Settings

---

## /404 (Error Page)

**Page Title:** "404: This page could not be found"  
**Display Text:** Standard Next.js error page

**Major Sections / Layout Blocks:**
- Error heading with status code "404"
- Error message: "This page could not be found"
- Generic error container

**Lucide Icons Used:**
(None visible in standard 404 error page)

**Tailwind Custom Theme Tokens:**
(Standard Next.js default styling, no custom tokens visible)

**Client Components (RSC Payload):**
(Standard error boundary)

**Outbound Links:**
(None)

**Visible Baked-in Data:**
- Error code: 404
- Static error message text

---

## /adab (ئادابەکان و پەروەردەی منداڵان - Etiquette & Child Training)

**Page Title:** "ئادابەکان و پەروەردەی منداڵان"  
**Kurdish Heading:** "خوڕەوشت، فێرکاری ئاینی، ڕێزگرتن"

**Major Sections / Layout Blocks:**
- Back header with page title and subtitle
- 4 article sections with sparkles icons (gold background):
  1. "خوڕەوشت و ڕەفتاری چاک" (Good manners & conduct) - 5 bullet points
  2. "پەروەردەی منداڵ بۆ نوێژ" (Teaching children prayer) - 4 bullet points
  3. "فێرکاری ئاینی بنەڕەتی" (Basic Islamic education) - 4 bullet points
  4. "ڕێزگرتن و کۆمەڵگا" (Respect & community) - 4 bullet points
- Bottom navigation bar

**Lucide Icons Used:**
chevron-left (back), sparkles (article markers)

**Tailwind Custom Theme Tokens:**
gold-*, surface, shadow-glass, phone-frame, nav-active, cream-*

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, SwipeNav, ClientPageRoot

**Outbound Links:**
- / (home)
- /qibla
- /calendar
- /mosques
- /habits
- /adhkar
- /dhikr
- /learn
- /prayer-types
- /adab (self)
- /control
- /settings

**Visible Baked-in Data:**
- 4 article titles with instructional content
- Bullet-point lists describing Islamic etiquette principles in Kurdish
- Total 17 bullet points across all sections
- Page structure follows curriculum-style educational layout

---

## /adhkar (ئەزکار - Post-Prayer Adhkar/Invocations)

**Page Title:** "ئەزکار"  
**Kurdish Heading:** Post-prayer remembrances and invocations

**Major Sections / Layout Blocks:**
- Back header with page title
- Search bar: placeholder "گەڕان..."
- Tab filter buttons (4 tabs):
  - ئەزکاری بەیانی (Morning Adhkar)
  - ئەزکاری ئێوارە (Evening Adhkar)
  - دوای نوێژ (After Prayer - selected)
  - نوستن (Before Sleep)
- 6 adhkar cards (each with):
  - Type badge: تەسبیح, تەحمید, تەکبیر, ئیستیغفار, حەقەلە, سەڵەوات
  - Arabic text: سُبْحَانَ اللّٰه, الْحَمْدُ لِلّٰه, اللّٰهُ أَكْبَر, أَسْتَغْفِرُ اللّٰه, لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰه, اللّٰهُمَّ صَلِّ عَلٰى مُحَمَّد
  - Repetition count: 33, 33, 34, 100, 33, 10
- Link to /dhikr page ("دەستپێبکە →")
- Bottom navigation bar

**Lucide Icons Used:**
chevron-left (back), search (search bar), arrow-right (card links)

**Tailwind Custom Theme Tokens:**
gold-*, teal-*, surface, shadow-glass, tabular, phone-frame, nav-active

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, SwipeNav, ClientPageRoot

**Outbound Links:**
- / (home)
- /dhikr
- /qibla
- /calendar
- /mosques
- /habits
- /adhkar (self)
- /learn
- /prayer-types
- /adab
- /control
- /settings

**Visible Baked-in Data:**
- 6 adhkar entries with Arabic text and Kurdish names
- Repetition counts: 33, 33, 34, 100, 33, 10
- 4 tab categories for different times of day
- Search functionality placeholder
- Direct links to dhikr counter for tasbih (33x), tahmid (33x), takbir (34x), istighfar (100x), hawqalah (33x), salawat (10x)

---

## /calendar (ڕۆژژمێر - Prayer Times Calendar)

**Page Title:** "خشتەی نوێژەکانی مانگ"  
**Kurdish Heading:** Monthly prayer times calendar grid

**Major Sections / Layout Blocks:**
- Back header with page title
- Month selector with prev/next buttons showing: "أيار ٢٠٢٦" / "١٤ ذو القعدة ١٤٤٧ هـ"
- "ئەمڕۆ" (Today) button
- Data table with 7 columns: ڕۆژ (Day), هیجری (Hijri), بەیانی (Fajr), نیوەڕۆ (Dhuhr), عەسر (Asr), مەغریب (Maghrib), خەوتنان (Isha)
- 31 rows (one per day) with prayer times and day names
- Day 25 (today) highlighted with gold border
- Bottom navigation bar

**Lucide Icons Used:**
chevron-left (back, navigation), chevron-left/right (month navigation)

**Tailwind Custom Theme Tokens:**
gold-*, tabular, ink-*, surface, shadow-glass, phone-frame, nav-active

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, SwipeNav, ClientPageRoot

**Outbound Links:**
- / (home)
- /qibla
- /calendar (self)
- /mosques
- /habits
- /adhkar
- /dhikr
- /learn
- /prayer-types
- /adab
- /control
- /settings

**Visible Baked-in Data:**
- 31 days of prayer times for May 2026 (أيار)
- Current Hijri month: ١٤ ذو القعدة ١٤٤٧ هـ
- Example times (Day 25): Fajr 03:07, Dhuhr 12:02, Asr 15:51, Maghrib 19:11, Isha 20:56
- Today (25th) marked with gold highlighting
- All prayer times in HH:MM format
- 7-column table layout for prayer times display

---

## /control (کۆنترۆڵ - Control/Info Panel)

**Page Title:** "زانیاری و ڕێکخستنی ئاپ"  
**Kurdish Heading:** App information and configuration panel

**Major Sections / Layout Blocks:**
- Back header with page title
- 7 information/control sections with icons:
  1. "زانیاری ئاپ" (App Info): Version 0.2.0, Data year 2026, 6 available cities, 2196 days
  2. "حاڵەتی شوێن" (Location Status): Current location شکرە (36.1911, 44.0094), Refresh Location button
  3. "کاتەکانی ئەمڕۆ" (Today's Times): Prayer times source ناوەکی (amozhgary.tv)
  4. "حاڵەتی ئاگادارکردنەوە" (Notification Status): Current status toggle, Test Notification button
  5. "ڕێکخستنی دەنگ" (Sound Settings): 9 Quranic recitations + bell tones
  6. "تۆمار" (Statistics): 0 checkmarks, 0 days recorded, 0 streak
  7. "تشخیصی تەکنیکی" (Diagnostics): Internet status, Platform, Screen size, Memory, Language
- Danger zone section: "پاککردنەوەی کاش" (Clear cache), "گەڕاندنەوەی ئاپ" (Reset app)
- Bottom navigation bar

**Lucide Icons Used:**
chevron-left (back), info, map-pin, clock, bell, volume-2, chart-bar, activity, alertCircle, trash-2, power

**Tailwind Custom Theme Tokens:**
gold-*, teal-*, ink-*, surface, shadow-glass, phone-frame, nav-active, cream-*

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, SwipeNav, ClientPageRoot

**Outbound Links:**
- / (home)
- /qibla
- /calendar
- /mosques
- /habits
- /adhkar
- /dhikr
- /learn
- /prayer-types
- /adab
- /control (self)
- /settings

**Visible Baked-in Data:**
- App version: 0.2.0
- Data year: 2026
- Available cities: 6
- Total days in dataset: 2196
- Current location: شکرە at coordinates 36.1911°N, 44.0094°E
- Prayer times source: ناوەکی (amozhgary.tv)
- 9 Quranic recitation options: Haram Ramadan, Haram Fajr, Dowha Fajr, Dowha Dhuhr, Dowha Asr, Dowha Maghrib, Dowha Isha
- 4 bell tone options: زەنگی نازک, زەنگی گەرم, زەنگی زەنگۆڵە, زەنگی بەرزبوونەوە
- Statistics: 0 prayer checkmarks, 0 days recorded, 0 day streak
- Diagnostics: Internet (offline in snapshot), Platform (web), Screen (0×0), Memory (0.0 KB), Language (ku)

---

## /dhikr (ذکر - Dhikr Counter)

**Page Title:** "ذکر"  
**Kurdish Heading:** Interactive tasbih/dhikr counter - "تەسبیح"

**Major Sections / Layout Blocks:**
- Back header with page title and active dhikr type display: "تەسبیح" (Tasbih)
- Arabic text display: "سُبْحَانَ اللّٰه"
- Kurdish translation: "پاکی و بێگەردی بۆ خوای گەورە، لە هەموو کەموکوڕی و هاوبەشێک"
- Large interactive counter card (60px circle):
  - Displays "0 / 33" (current count / target)
  - 5 decorative star icons arranged around counter
- Navigation button row:
  - Prev button: "ڕۆژخوا" (Previous)
  - Reset button: "گەڕانەوە" (Reset)
  - Next button: (unlabeled)
- Instruction text: "tap card · ↑/↓ keys · volume buttons"
- Bottom navigation bar

**Lucide Icons Used:**
chevron-left (back), star (decorative), chevron-left/right (nav buttons)

**Tailwind Custom Theme Tokens:**
gold-*, sky-*, surface, shadow-glass, phone-frame, nav-active, cream-*

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, SwipeNav, ClientPageRoot, DhikrCounter (interactive client component)

**Outbound Links:**
- / (home)
- /qibla
- /calendar
- /mosques
- /habits
- /adhkar
- /dhikr (self)
- /learn
- /prayer-types
- /adab
- /control
- /settings

**Visible Baked-in Data:**
- Current dhikr: تەسبیح (Tasbih) with Arabic "سُبْحَانَ اللّٰه"
- Kurdish translation of tasbih
- Counter display: "0 / 33" (current implementation shows 0, target is 33)
- Interactive features: tap counter, arrow keys, volume button controls
- Accessible navigation to previous/next dhikr types
- Reset functionality to restart count

---

## /habits (ڕێبازە - Prayer Habits/Streaks)

**Page Title:** "خشتەی نوێژەکانم بە جەماعەت"  
**Kurdish Heading:** My prayer habits and community prayer log

**Major Sections / Layout Blocks:**
- Back header with page title
- Streak counter card: "0 ڕۆژ" (0 days) with flame icon
- Month/calendar picker showing: "أيار ٢٠٢٦" / "١٤ ذو القعدة ١٤٤٧ هـ"
- Interactive calendar grid with:
  - Color-coded activity squares (light, medium, dark green intensity scale)
  - Legend showing intensity mapping from dates to activity level
- "تۆماری نوێژەکانی جەماعەت" (Group Prayer Log) section
- "زیاد" (Add) button for creating new prayer entries
- Empty state message: "هیچ چێکئینێک نییە" (No entries yet)
- Closing prayer text: "خودای دلۆڤان نوێژ و پەرستشتان قبووڵ بفەرموێت"
- Bottom navigation bar

**Lucide Icons Used:**
chevron-left (back), flame (streak icon), plus (add button), chevron-left/right (month navigation)

**Tailwind Custom Theme Tokens:**
gold-*, teal-*, cream-*, surface, shadow-glass, phone-frame, nav-active

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, SwipeNav, ClientPageRoot

**Outbound Links:**
- / (home)
- /qibla
- /calendar
- /mosques
- /habits (self)
- /adhkar
- /dhikr
- /learn
- /prayer-types
- /adab
- /control
- /settings

**Visible Baked-in Data:**
- Current streak: 0 ڕۆژ (0 days)
- Display month: أيار ٢٠٢٦ (May 2026)
- Current Hijri: ١٤ ذو القعدة ١٤٤٧ هـ
- Activity intensity scale visualization in calendar grid
- Empty prayer log state (no historical entries in snapshot)
- Motivational closing prayer: "خودای دلۆڤان نوێژ و پەرستشتان قبووڵ بفەرموێت"
- "Add prayer entry" functionality placeholder

---

## /learn (فێرکاری نوێژ - How to Pray Tutorial)

**Page Title:** "چۆن نوێژ بکەین — هەنگاو بە هەنگاو"  
**Kurdish Heading:** Step-by-step prayer instruction tutorial

**Major Sections / Layout Blocks:**
- Back header with page title
- 10 sequential instructional sections numbered 1-10, each with:
  - Gold background circle containing step number
  - Kurdish section title
  - Detailed Kurdish instructions with Arabic transliterations
  
  Steps:
  1. نییەت (Intention) - Setting prayer intention
  2. ڕووکردن بۆ قیبلە (Facing Qibla) - Direction to Kaaba
  3. تەکبیرە ئیحرام (Opening Takbir) - Opening proclamation
  4. هەستان و خوێندنەوەی فاتیحە (Standing & Reading Fatihah)
  5. ڕکوع (Bowing/Ruku) - Bowing position
  6. هەستانەوە لە ڕکوع (Rising from Ruku)
  7. سوجود (Prostration) - Prostration position
  8. دانیشتنی نێوان دوو سوجود (Sitting between prostrations)
  9. تەشەهود (Tashahhud) - Final testimony
  10. سەلام (Greeting/End) - Closing salutation

- Bottom navigation bar

**Lucide Icons Used:**
chevron-left (back)

**Tailwind Custom Theme Tokens:**
gold-*, cream-*, ink-*, surface, shadow-glass, phone-frame, nav-active

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, SwipeNav, ClientPageRoot

**Outbound Links:**
- / (home)
- /qibla
- /calendar
- /mosques
- /habits
- /adhkar
- /dhikr
- /learn (self)
- /prayer-types
- /adab
- /control
- /settings

**Visible Baked-in Data:**
- 10 sequential prayer steps with Kurdish titles and descriptions
- Arabic transliterations for each step
- Numbered visual layout (1-10 in gold circles)
- Step-by-step format suitable for tutorial/educational use
- All instructions in Kurdish (ckb) with Arabic reference text
- Complete prayer cycle from intention to closing salutation

---

## /mosques (مزگەوتەکان - Nearby Mosques)

**Page Title:** "شوێنی ئێستات"  
**Kurdish Heading:** Nearby mosque locator

**Major Sections / Layout Blocks:**
- Back header with page title
- Map placeholder container (40dvh height, swipe-ignore attribute)
- Refresh location button
- Empty state message: "هیچ مزگەوتێک نەدۆزرایەوە لە نزیکەوە" (No mosques found nearby)
- Bottom navigation bar

**Lucide Icons Used:**
chevron-left (back), map-pin (location refresh), location-2 (map marker)

**Tailwind Custom Theme Tokens:**
gold-*, surface, shadow-glass, phone-frame, nav-active

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, SwipeNav, ClientPageRoot, MapComponent (client-side map rendering)

**Outbound Links:**
- / (home)
- /qibla
- /calendar
- /mosques (self)
- /habits
- /adhkar
- /dhikr
- /learn
- /prayer-types
- /adab
- /control
- /settings

**Visible Baked-in Data:**
- Empty mosque list state shown in snapshot
- Message: "هیچ مزگەوتێک نەدۆزرایەوە لە نزیکەوە" (No mosques found nearby)
- Map placeholder for interactive map display
- Location refresh button for manual location lookup
- Expected data structure: mosque name, distance, direction, contact info (not visible in current empty state)

---

## /onboarding (Onboarding/Splash Screen)

**Page Title:** "کاتی نوێژەکانی ئەمڕۆ"  
**Kurdish Heading:** App onboarding and initial setup screen

**Major Sections / Layout Blocks:**
- Full-screen gradient background: sky-maghrib with decorative star SVGs
- Center hero section containing:
  - Logo display
  - App title: "کاتی نوێژەکانی ئەمڕۆ"
  - App subtitle: "سەڵاتی"
  - Tagline: "نوێژەکانم بۆ مۆبایل"
- Language selector buttons (2 options):
  - "کوردی" (Kurdish - selected with gold ring)
  - "العربية" (Arabic)
- Location permission request section:
  - Text: "شوێنەکەم بدۆزەوە"
  - Icon: map-pin
- Continue button: "بەردەوامبە →"

**Lucide Icons Used:**
map-pin (location permission)

**Tailwind Custom Theme Tokens:**
sky-maghrib (gradient background), gold-*, cream-*

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, ClientPageRoot, OnboardingFlow (client-side interaction)

**Outbound Links:**
- / (home - after completion)

**Visible Baked-in Data:**
- App title: کاتی نوێژەکانی ئەمڕۆ
- App subtitle: سەڵاتی
- App tagline: نوێژەکانم بۆ مۆبایل
- Language options: Kurdish (کوردی), Arabic (العربية)
- Location permission request text: شوێنەکەم بدۆزەوە
- Continue button text: بەردەوامبە
- Default selected language: Kurdish
- Onboarding flow: Language selection -> Location permission -> Home

---

## /prayer-types (جۆرەکانی نوێژ - Prayer Types Reference)

**Page Title:** "فەرز، سونەت، نافیلە، ئیستیخارە، ..."  
**Kurdish Heading:** Complete reference guide to prayer types

**Major Sections / Layout Blocks:**
- Back header with page title
- Tab filter buttons (5 tabs):
  - "هەموو" (All - selected)
  - "فەرز" (Fard/Obligatory)
  - "سونەت" (Sunnah/Traditional)
  - "نافیلە" (Nafilah/Supererogatory)
  - "بۆنە" (Occasional/Special occasions)
- 15 detailed article cards (in document order):
  
  **Fard (Obligatory) Prayers:**
  1. Fajr (Dawn) - 2 rak'ahs, specific timing
  2. Dhuhr (Noon) - 4 rak'ahs
  3. Asr (Afternoon) - 4 rak'ahs
  4. Maghrib (Sunset) - 3 rak'ahs
  5. Isha (Night) - 4 rak'ahs
  
  **Sunnah & Community Prayers:**
  6. Jumu'ah (Friday) - Communal obligation
  7. Sunnah Mu'akkadah - 12 rak'ahs daily (Fajr 2, Dhuhr 4+2, Asr 2, Isha 2)
  8. Witr (Odd) - 1, 3, or 5 rak'ahs
  
  **Optional & Special Prayers:**
  9. Qiyam al-Layl / Tahajjud (Night vigil)
  10. Salat ad-Dhuhaa (Morning after sunrise)
  11. Salat al-Istikhara (Guidance prayer)
  12. Salat al-Istisqa (Rain prayer)
  13. Salat al-Janazah (Funeral prayer)
  14. Salat al-Kusuf (Solar eclipse prayer)
  15. Salat al-Khusuf (Lunar eclipse prayer)
  16. Eid prayer
  17. Tahiyyat al-Masjid (Greeting the mosque)

- Each card contains:
  - Title and category badge
  - Details with list-ordered and clock icons
  - Rak'ah counts, timing specifications
  - Descriptive paragraphs explaining significance
- Bottom navigation bar

**Lucide Icons Used:**
chevron-left (back), list-ordered (rak'ah listings), clock (timing info)

**Tailwind Custom Theme Tokens:**
gold-*, teal-*, cream-*, ink-*, surface, shadow-glass, phone-frame, nav-active, tabular

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, SwipeNav, ClientPageRoot

**Outbound Links:**
- / (home)
- /qibla
- /calendar
- /mosques
- /habits
- /adhkar
- /dhikr
- /learn
- /prayer-types (self)
- /adab
- /control
- /settings

**Visible Baked-in Data:**
- 15-17 prayer type cards with detailed information
- Obligatory prayers (Fard): Fajr, Dhuhr, Asr, Maghrib, Isha with rak'ah counts
- Sunnah prayers: Mu'akkadah (12 daily), Witr, Friday prayer
- Optional prayers: Tahajjud, Dhuhaa, Istikhara, rain, funeral, eclipse, Eid, mosque greeting
- Rak'ah counts: Fajr 2, Dhuhr 4, Asr 4, Maghrib 3, Isha 4, Witr 1-5, etc.
- Timing specifications for each prayer type
- Tab categories for filtering by prayer type classification
- Comprehensive Islamic prayer reference documentation

---

## /qibla (قیبلە - Qibla Direction Compass)

**Page Title:** "ڕووت لە قیبلەیە"  
**Kurdish Heading:** Qibla direction indicator with compass

**Major Sections / Layout Blocks:**
- Back header with page title
- Large circular compass component:
  - Outer ring with degree markers (every 6°, major markers every 30°)
  - Cardinal direction labels: N, E, S, W (English)
  - Center star icon in gold circle
  - Animated needle pointing direction (rotated -194.9987364703537 degrees)
- Data display section:
  - Distance to Mecca: "1,691 km"
  - Direction angle: "195.0°"
- Recalibrate button with navigation2 icon
- Instruction text: "ئامێرەکە بسوڕێنە بۆ پێوانە" (Rotate device to calibrate)
- Bottom navigation bar

**Lucide Icons Used:**
chevron-left (back), star (center marker), navigation2 (recalibrate button)

**Tailwind Custom Theme Tokens:**
gold-*, sky-*, surface, shadow-glass, phone-frame, nav-active, cream-*

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, SwipeNav, ClientPageRoot, QiblaCompass (interactive compass client component)

**Outbound Links:**
- / (home)
- /qibla (self)
- /calendar
- /mosques
- /habits
- /adhkar
- /dhikr
- /learn
- /prayer-types
- /adab
- /control
- /settings

**Visible Baked-in Data:**
- Distance to Mecca: 1,691 km (from location شکرە)
- Direction angle: 195.0° (from user's location relative to Mecca)
- Compass needle rotation: -194.9987364703537° (current bearing)
- Degree scale: 360° full circle with major/minor markers
- Cardinal directions: N, E, S, W for reference
- Calibration instruction: "ئامێرەکە بسوڕێنە بۆ پێوانە"
- Real-time compass needle animation
- Device orientation-based calculation

---

## /settings (ڕێکخستن - App Settings)

**Page Title:** "سەڵاتی"  
**Kurdish Heading:** Application settings and preferences

**Major Sections / Layout Blocks:**
- Back header with page title
- Language selector section:
  - Label: (implicit from buttons)
  - Buttons: "کوردی" (Kurdish - selected), "العربية" (Arabic)
- Theme selector section:
  - Label: (implicit from buttons)
  - Buttons: "ڕووناک" (Light), "تاریک" (Dark), "ئۆتۆماتیک" (Auto - selected)
- Location display section:
  - Label: "شوێن" (Location)
  - Current location: "شکرە"
  - Coordinates: 36.191°N, 44.009°E
  - Refresh button
- Notification toggle:
  - Label: (implicit)
  - Current state: Off
- Sound / Azan settings section:
  - "بانگی ڕاستەقینە" (Real Call) subsection:
    - 7 Quranic recitation options:
      1. Haram Ramadan (ڕەست)
      2. Haram Fajr (حجاز)
      3. Dowha Fajr (صبا)
      4. Dowha Dhuhr (بیات)
      5. Dowha Asr (نهاوەند)
      6. Dowha Maghrib (حسینی)
      7. Dowha Isha (سۆکا)
    - Tone descriptions: ڕەست, حجاز, صبا, بیات, نهاوەند, حسینی, سۆکا
  - "ئاگاداری کورت" (Short Alert) subsection:
    - 4 bell tone options:
      1. زەنگی نازک (Gentle bell - selected)
      2. زەنگی گەرم (Warm bell)
      3. زەنگی زەنگۆڵە (Bell tower sound)
      4. زەنگی بەرزبوونەوە (Rising bell)
- Sound test/stop button
- Bottom navigation bar

**Lucide Icons Used:**
chevron-left (back), globe (language), palette (theme), map-pin (location), bell (notifications), volume-2 (sound), play/pause (test sound)

**Tailwind Custom Theme Tokens:**
gold-*, teal-*, cream-*, ink-*, surface, shadow-glass, phone-frame, nav-active

**Client Components (RSC Payload):**
AppProvider, ErrorBoundary, SwipeNav, ClientPageRoot

**Outbound Links:**
- / (home)
- /qibla
- /calendar
- /mosques
- /habits
- /adhkar
- /dhikr
- /learn
- /prayer-types
- /adab
- /control
- /settings (self)

**Visible Baked-in Data:**
- Language options: کوردی (Kurdish - selected), العربية (Arabic)
- Theme options: ڕووناک (Light), تاریک (Dark), ئۆتۆماتیک (Auto - selected)
- Current location: شکرە at coordinates 36.191°N, 44.009°E
- Notification setting: Currently disabled
- 7 Quranic recitation options with tone names:
  - Haram Ramadan (ڕەست)
  - Haram Fajr (حجاز)
  - Dowha Fajr (صبا)
  - Dowha Dhuhr (بیات)
  - Dowha Asr (نهاوەند)
  - Dowha Maghrib (حسینی)
  - Dowha Isha (سۆکا)
- 4 bell tone options: زەنگی نازک (selected), زەنگی گەرم, زەنگی زەنگۆڵە, زەنگی بەرزبوونەوە
- Sound test functionality for preview
- Refreshable location setting

---

## Navigation Architecture

**Bottom Navigation Bar (consistent across all pages):**
1. Home (/) - House icon
2. Qibla (/qibla) - Compass icon
3. Mosques (/mosques) - Map-pin icon
4. Habits (/habits) - Activity/Flame icon
5. Settings (/settings) - Settings icon (or Settings link)

**Route Structure:**
- / -> Home/Dashboard (hub)
- /onboarding -> Initial setup (pre-home flow)
- /404 -> Error handling
- /adab -> Educational content
- /adhkar -> Post-prayer remembrance
- /calendar -> Monthly prayer times
- /control -> App diagnostics
- /dhikr -> Interactive tasbih counter
- /habits -> Streak tracking
- /learn -> Prayer instruction
- /mosques -> Location-based finder
- /prayer-types -> Reference guide
- /qibla -> Direction compass
- /settings -> User preferences

---

## Custom Theme Token Inventory

**Color Palette Tokens:**
- gold-* - Primary accent color (highlights, active states, hero elements)
- teal-* - Secondary accent color (cards, badges)
- cream-* - Light background/text variant
- ink-* - Dark text/headings
- sky-* - Background gradients (sky-dhuhr, sky-maghrib)
- surface - Card/container backgrounds

**Component-Specific Tokens:**
- shadow-glass - Frosted glass effect
- phone-frame - Mobile viewport framing
- nav-active - Navigation item active state styling
- tabular - Table/data grid styling
- font-rabar - Custom typography (Kurdish font family, likely)

**Recurring Pattern:**
Theme tokens follow semantic naming (color purpose + intensity level) and apply consistently across all 14 pages via Tailwind utility classes.

---

## Client-Side Component Summary

**Common Components (present on every page):**
- AppProvider - Root context provider
- ErrorBoundary - Error handling wrapper
- SwipeNav - Gesture-based navigation
- ClientPageRoot - Page-level client wrapper
- NowPlayingBar - Audio playback status bar (home page)

**Interactive Components:**
- DhikrCounter - Tasbih counter interaction (/dhikr)
- QiblaCompass - Real-time compass needle (/qibla)
- MapComponent - Interactive map display (/mosques)
- OnboardingFlow - Language/permission setup (/onboarding)
- CalendarGrid - Month picker and prayer times table (/calendar)
- HabitStreakTracker - Habit calendar visualization (/habits)

---

**Document Generated:** Survey of Sallaty Prayer App extracted from APK  
**Total Pages Documented:** 14 routes  
**Language Support:** Kurdish (ckb) primary, Arabic (ar) secondary  
**App Version:** 0.2.0  
**Data Year:** 2026  
**Framework:** Next.js + Capacitor (mobile wrapper)  