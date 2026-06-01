# Sallaty — Recovered Content Data

Static data payloads extracted from the beautified Next.js bundles and pre-rendered HTML pages.

---

## Dhikr presets

**Source:** `recovered/beautified/page-89bd68034e447775.beautified.js` (the `/dhikr` page chunk).
**Categories:** `"morning" | "evening" | "after-prayer" | "anytime" | "sleep"` (the UI filter tabs map to morning / evening / after-prayer / sleep).

```ts
type DhikrPreset = {
  id: string;
  category: 'after-prayer' | 'anytime' | 'morning' | 'evening' | 'sleep';
  arabic: string;
  nameKu: string;
  nameAr: string;
  meaningKu: string;
  meaningAr: string;
  count: number;
  source?: { ku: string; ar: string };
};

export const dhikrPresets: DhikrPreset[] = [
  { id: 'subhan-allah',   category: 'after-prayer', arabic: 'سُبْحَانَ اللّٰه',
    nameKu: 'تەسبیح',     nameAr: 'التَّسبيح',
    meaningKu: 'پاکی و بێگەردی بۆ خوای گەورە، لە هەموو کەموکوڕی و هاوبەشێک',
    meaningAr: 'تنزيه الله سبحانه عن كل نقصٍ وعيبٍ وشريك',
    count: 33 },
  { id: 'alhamd',         category: 'after-prayer', arabic: 'الْحَمْدُ لِلّٰه',
    nameKu: 'تەحمید',     nameAr: 'التَّحميد',
    meaningKu: 'هەموو ستایش و سوپاس شایستەی خوای پەروەردگارە',
    meaningAr: 'الثناء على الله بصفات الكمال والجلال',
    count: 33 },
  { id: 'allahu-akbar',   category: 'after-prayer', arabic: 'اللّٰهُ أَكْبَر',
    nameKu: 'تەکبیر',     nameAr: 'التَّكبير',
    meaningKu: 'خوا گەورەتر و مەزنترە لە هەموو شتێک',
    meaningAr: 'الله أعظمُ وأكبرُ من كل شيء',
    count: 34 },
  { id: 'astaghfirullah', category: 'anytime',      arabic: 'أَسْتَغْفِرُ اللّٰه',
    nameKu: 'ئیستیغفار',  nameAr: 'الاستغفار',
    meaningKu: 'داوای لێخۆشبوون و تۆبە لە خوای پەروەردگار دەکەم',
    meaningAr: 'أطلب المغفرة والتوبة من الله ربِّي',
    count: 100 },
  { id: 'la-ilaha',       category: 'morning',      arabic: 'لَا إِلٰهَ إِلَّا اللّٰه',
    nameKu: 'تەهلیل',     nameAr: 'التَّهليل',
    meaningKu: 'هیچ پەرستراوێکی بەحەق نییە جگە لە خوا، تەنها ئەو',
    meaningAr: 'لا معبودَ بحقٍّ إلا الله وحدَه',
    count: 100 },
  { id: 'hawqala',        category: 'anytime',      arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰه',
    nameKu: 'حەوقەلە',    nameAr: 'الحوقلة',
    meaningKu: 'هیچ گۆڕان و هێزێک نییە تەنها بە یارمەتی خوای گەورە نەبێت',
    meaningAr: 'لا تحوُّلَ من حالٍ إلى حالٍ ولا قوةَ إلا بالله العلي العظيم',
    count: 33 },
  { id: 'salli',          category: 'anytime',      arabic: 'اللّٰهُمَّ صَلِّ عَلٰى مُحَمَّد',
    nameKu: 'سەڵەوات',    nameAr: 'الصَّلاة على النبي',
    meaningKu: 'ئەی خوایە، درود و سەڵامت بێت لە پێغەمبەر محەممەد (د.خ)',
    meaningAr: 'اللهم صلِّ وسلِّم على نبيك محمد ﷺ',
    count: 10,
    source: { ku: 'سورەتی ئەحزاب، ئایەتی ٥٦', ar: 'سورة الأحزاب: ٥٦' } },
  { id: 'rabbi-zidni',    category: 'morning',      arabic: 'رَبِّ زِدْنِي عِلْمًا',
    nameKu: 'دوعای زانیاری', nameAr: 'دعاء طلب العلم',
    meaningKu: 'ئەی پەروەردگارم، زانیاری سوودبەخشم پێبدە و زیادی بکە',
    meaningAr: 'ربِّ زدْني علماً نافعاً وفهماً',
    count: 7,
    source: { ku: 'سورەتی تەها، ئایەتی ١١٤', ar: 'سورة طه: ١١٤' } },
  { id: 'hasbi-allah',    category: 'evening',      arabic: 'حَسْبِيَ اللّٰهُ لَا إِلٰهَ إِلَّا هُو',
    nameKu: 'حەسبەلە',    nameAr: 'الحسبلة',
    meaningKu: 'خوام بەسە و پشتم بەو ئەبەستم، هیچ پەرستراوێکی بەحەق نییە جگە لەو',
    meaningAr: 'كفاني الله وعليه توكَّلت، لا معبودَ بحقٍّ إلا هو',
    count: 7,
    source: { ku: 'سورەتی تەوبە، ئایەتی ١٢٩', ar: 'سورة التوبة: ١٢٩' } },
];
```

---

## Adhkar items

The `/adhkar` route reuses the dhikr presets above, filtered by category and grouped under the four tabs:

| Tab key (i18n)   | Kurdish               | Filter      |
|---|---|---|
| `morningAdhkar`  | ئەزکاری بەیانی        | `morning`        |
| `eveningAdhkar`  | ئەزکاری ئێوارە        | `evening`        |
| `afterPrayer`    | دوای نوێژ              | `after-prayer`   |
| `sleep`          | نوستن                  | `sleep`          |

Each card surfaces the Arabic text, the Kurdish/Arabic name, the count, and a "دەستپێبکە →" link to `/dhikr/[id]`.

---

## Prayer types (`/prayer-types`)

**Source:** `apk-extracted/assets/public/prayer-types/index.html`.

Categories use the existing i18n keys: `fardLabel`, `sunnahLabel`, `nafilaLabel`, `wajibLabel`, `occasionalLabel`.

| Category | Item | Rak'ahs | When |
|---|---|---|---|
| فەرز (Fard)        | Fajr / بەیانی              | 2  | Dawn |
| فەرز               | Dhuhr / نیوەڕۆ             | 4  | Midday |
| فەرز               | Asr / عەسر                  | 4  | Afternoon |
| فەرز               | Maghrib / مەغریب           | 3  | Sunset |
| فەرز               | Isha / خەوتنان              | 4  | Night |
| فەرز               | Jumu'ah / هەینی             | 2 + khutbah | Friday Dhuhr |
| سونەت (Sunnah)     | Pre-Fajr Sunnah             | 2 | Before Fajr |
| سونەت              | Post-Dhuhr Sunnah           | 4 | After Dhuhr |
| سونەت              | Post-Maghrib Sunnah         | 2 | After Maghrib |
| سونەت              | Post-Isha Sunnah            | 2 | After Isha |
| سونەت              | Witr                        | 1–11 | After Isha, before Fajr |
| سونەت              | Taraweeh                    | 8 or 20 | Ramadan nights |
| سونەت              | Tahajjud                    | 2–11 | Late night |
| نافیلە (Nafl)      | Dhuha / Ishraq              | 2–8 | Mid-morning |
| بۆنە (Occasional)  | Istikhara                   | 2 + dua | Decision-making |
| بۆنە               | Istisqa (rain)              | 2 + sermon | Drought |
| بۆنە               | Janazah (funeral)           | 4 takbirs, no ruku/sujud | Funeral |
| بۆنە               | Solar / Lunar eclipse       | 2 (double ruku) | Eclipse |
| بۆنە               | Eid                         | 2 + extra takbirs | Eid morning |
| بۆنە               | Tahiyyat al-Masjid          | 2 | Upon entering a mosque |

Each entry in the HTML includes `intentNiyyah`, `qiyam`, `ruku`, `sujud`, `tashahhud`, `salaam` as the pillar list.

---

## Adab articles (`/adab`)

**Source:** `apk-extracted/assets/public/adab/index.html`.

1. **خوڕەوشت و ڕەفتاری چاک** — Good conduct
   - ڕاستگۆیی لە قسە و کردار
   - بەخشندەیی و یارمەتیدانی هەژاران
   - ڕێزگرتن لە دایک و باوک
   - بەرامبەرکردن بە منداڵان بە میهرەبانی و بە گەورەکان بە ڕێز
   - دووری لە درۆ، غیبەت، و بوختان

2. **پەروەردەی منداڵ بۆ نوێژ** — Teaching children prayer
   - دەستپێکردن بە نەرمی لە تەمەنی ٧ ساڵانەوە
   - هاندان بەردەوام لە تەمەنی ١٠ ساڵانەوە بەبێ زۆرلێ کردن
   - نوێژکردن لەگەڵیان بۆ خۆشکردنی
   - ستایش و خەڵات کاتێک ئەرکەکانیان ئەنجامدەدەن

3. **فێرکاری ئاینی بنەڕەتی** — Basic religious teaching
   - فێرکردنی شەهادە و ستوونەکانی ئیسلام
   - فێرکردنی شەش ستوونی ئیمان
   - هاندانی خوێندنەوەی قورئان لە تەمەنی منداڵییەوە
   - گێڕانەوەی چیرۆکی پێغەمبەران و هاوەڵان

4. **ڕێزگرتن و کۆمەڵگا** — Respect & community
   - ڕێزگرتن لە مامۆستا و عوڵەماکان
   - سەلام کردن و وەڵامی سەلام دانەوە
   - هاوڕێی چاک هەڵبژاردن
   - پاراستنی پاکی شوێنە گشتی و تایبەتییەکان

---

## Learn-prayer steps (`/learn`)

**Source:** `apk-extracted/assets/public/learn/index.html`. Ten ordered steps:

1. **نییەت** — Make the intention in the heart for the prayer being performed.
2. **ڕووکردن بۆ قیبلە** — Face the Kaaba; feet shoulder-width.
3. **تەکبیرە ئیحرام** — Raise both hands to shoulder level and say "اللّٰهُ أَكْبَر".
4. **هەستان و خوێندنەوەی فاتیحە** — Place right hand over left on chest; recite Al-Fatihah then a short surah.
5. **ڕکوع** — Bow with straight back; "سُبْحَانَ رَبِّيَ ٱلْعَظِيم" ×3.
6. **هەستانەوە لە ڕکوع** — Stand and say "سَمِعَ ٱللّٰهُ لِمَنْ حَمِدَه" then "رَبَّنَا وَلَكَ ٱلْحَمْد".
7. **سوجود** — Prostrate on seven body parts; "سُبْحَانَ رَبِّيَ ٱلْأَعْلَى" ×3.
8. **دانیشتنی نێوان دوو سوجود** — Sit and say "رَبِّ ٱغْفِرْ لِي"; then second prostration.
9. **تەشەهود** — After every two rak'ahs, sit and recite the Tashahhud and Durood.
10. **سەلام** — Turn head right "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ ٱللّٰه", then left.

---

## Calculation methods

**Source:** `recovered/beautified/322-9cf5b15d689bb469.beautified.js` + `recovered/beautified/page-99ed6a1f1a3382ab.beautified.js` (settings).

```ts
type CalcMethodId =
  | 'MuslimWorldLeague' | 'Karachi' | 'Egyptian' | 'UmmAlQura'
  | 'Dubai' | 'Qatar' | 'Kuwait' | 'Singapore'
  | 'MoonsightingCommittee' | 'NorthAmerica' | 'Turkey' | 'Tehran';

const labels: Record<CalcMethodId, { ku: string; ar: string }> = {
  MuslimWorldLeague:     { ku: 'ڕاوێژی جیهانی موسوڵمانان (MWL)', ar: 'رابطة العالم الإسلامي' },
  Karachi:               { ku: 'زانکۆی کەراچی (سونیی عێراق)',     ar: 'جامعة كراتشي (السنة العراق)' },
  Egyptian:              { ku: 'دەستەی شەرعی میسر (Egyptian)',    ar: 'الهيئة المصرية العامة' },
  UmmAlQura:             { ku: 'ئوم القورا (سعودی)',              ar: 'أم القرى (السعودية)' },
  Dubai:                 { ku: 'دبی',                              ar: 'دبي' },
  Qatar:                 { ku: 'قەتار',                            ar: 'قطر' },
  Kuwait:                { ku: 'کوێیت',                            ar: 'الكويت' },
  Singapore:             { ku: 'سنگاپور',                          ar: 'سنغافورة' },
  MoonsightingCommittee: { ku: 'کۆمیتەی بینینی مانگ',              ar: 'لجنة رصد الأهلة' },
  NorthAmerica:          { ku: 'شمالی ئەمریکا',                    ar: 'شمال أمريكا' },
  Turkey:                { ku: 'دیانەتی تورکیا',                   ar: 'الرئاسة التركية' },
  Tehran:                { ku: 'تەهران (شیعی)',                    ar: 'طهران (الشيعة)' },
};

// DEFAULT in the original app = 'Karachi' (not MWL)
// Madhab support: 'shafi' (default) | 'hanafi'
```

---

## Adhan audio tracks

**Source:** module 2575, referenced from `322-9cf5b15d689bb469.beautified.js`. Files live under `public/audio/*.mp3` (the chime IDs have no file — they're synthesized in-app).

```ts
type AdhanTrack = {
  id: string;
  category: 'adhan' | 'alert';
  ku: string;
  ar: string;
  maqam?: string;
  file?: string;
};

export const adhanTracks: AdhanTrack[] = [
  { id: 'makkah-ramadan', category: 'adhan',  maqam: 'ڕەست',     ku: 'مزگەوتی حەرام · ڕەمەزان', ar: 'المسجد الحرام · رمضان', file: '/audio/makkah-ramadan.mp3' },
  { id: 'makkah-fajr',    category: 'adhan',  maqam: 'حجاز',     ku: 'مزگەوتی حەرام · فەجر',     ar: 'المسجد الحرام · فجر',   file: '/audio/makkah-fajr.mp3' },
  { id: 'doha-fajr',      category: 'adhan',  maqam: 'صبا',      ku: 'دەوحە · بەیانی',           ar: 'الدوحة · الفجر',         file: '/audio/doha-fajr.mp3' },
  { id: 'doha-dhuhr',     category: 'adhan',  maqam: 'بیات',     ku: 'دەوحە · نیوەڕۆ',           ar: 'الدوحة · الظهر',         file: '/audio/doha-dhuhr.mp3' },
  { id: 'doha-asr',       category: 'adhan',  maqam: 'نهاوەند',  ku: 'دەوحە · عەسر',             ar: 'الدوحة · العصر',         file: '/audio/doha-asr.mp3' },
  { id: 'doha-maghrib',   category: 'adhan',  maqam: 'حسینی',    ku: 'دەوحە · مەغریب',           ar: 'الدوحة · المغرب',        file: '/audio/doha-maghrib.mp3' },
  { id: 'doha-isha',      category: 'adhan',  maqam: 'سۆکا',     ku: 'دەوحە · خەوتنان',          ar: 'الدوحة · العشاء',        file: '/audio/doha-isha.mp3' },
  { id: 'chime-soft', category: 'alert', ku: 'زەنگی نازک',          ar: 'نغمة لطيفة' },
  { id: 'chime-warm', category: 'alert', ku: 'زەنگی گەرم',          ar: 'نغمة دافئة' },
  { id: 'chime-bell', category: 'alert', ku: 'زەنگی زەنگۆڵە',       ar: 'نغمة جرس' },
  { id: 'chime-rise', category: 'alert', ku: 'زەنگی بەرزبوونەوە',   ar: 'نغمة تصاعدية' },
];

export const defaultAdhanId = 'chime-soft';
```

The MP3 files themselves were not in the APK extraction (large binaries were stripped) — re-bundle them under `public/audio/` when available.

---

## Default coordinates

```ts
export const DEFAULT_COORDS = { lat: 36.1911, lng: 44.0094 }; // Erbil / Hewlêr
```

---

## localStorage keys

All keys are prefixed with `selati.` and read/written through `storage.get(key, fallback)` / `storage.set(key, value)`.

| Key | Type | Default | Purpose |
|---|---|---|---|
| `selati.lang`         | `'ku' \| 'ar'`             | `'ku'`              | UI language |
| `selati.theme`        | `'light' \| 'dark' \| 'auto'` | `'auto'`         | Theme mode |
| `selati.coords`       | `{ lat, lng }`             | Erbil               | Last known location |
| `selati.city`         | `string \| undefined`      | undefined           | Reverse-geocoded label |
| `selati.onboarded`    | `boolean`                  | `false`             | Onboarding completion flag |
| `selati.method`       | `CalcMethodId`             | `'Karachi'`         | Calc method |
| `selati.madhab`       | `'shafi' \| 'hanafi'`      | `'shafi'`           | Asr madhab |
| `selati.adhan`        | `string`                   | `'chime-soft'`      | Active adhan/alert id |
| `selati.notifEnabled` | `boolean`                  | `false`             | User-level notif toggle |
| `selati.muted`        | `Record<PrayerName, bool>` | `{}`                | Per-prayer mute state |
| `selati.habits`       | `Array<CheckIn>`           | `[]`                | Congregation check-ins |
| `selati.prayerTimes`  | `Record<string, …>`        | `{}`                | Optional time cache |

---

## Bundled prayer-time data

Not present as a hardcoded JS payload. The original app references an external service (`amozhgary.tv`) for "ناوەکی" (bundled) times — the source string `sourceBundled: 'ناوەکی (amozhgary.tv)'` confirms this. The Karachi-method `adhan` library calculation is used as the offline fallback.

If you want to re-bundle a city list, define it as `src/data/cities.ts` mirroring `{ name: { ku, ar }, slug, coords, timezone }`.

---

## Summary

| Dataset | Items | Status |
|---|---|---|
| Dhikr presets         | 9                | ✅ Full text in both languages |
| Adhkar tabs           | 4 categories     | ✅ Filter reuses dhikr items |
| Prayer types          | 20 across 4 cats | ✅ From HTML |
| Adab articles         | 4                | ✅ Bullet lists in Kurdish |
| Learn-prayer steps    | 10               | ✅ With dua text |
| Calculation methods   | 12               | ✅ Both labels; default `Karachi` |
| Adhan tracks          | 11 (7 + 4)       | ✅ Metadata only — MP3s missing |
| Default coords        | Erbil            | ✅ |
| localStorage keys     | 12               | ✅ |
| Bundled city DB       | external API     | ⚠ amozhgary.tv (not in bundle) |
