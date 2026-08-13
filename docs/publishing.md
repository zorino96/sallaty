# Publishing سەڵاتی (Sallaty) — step by step

Package name (permanent, cannot change): **`com.selati.app`**
Current version: **versionCode 1 · versionName 1.0**

---

## هەنگاوی ١ — کلیلی واژووکردن دروست بکە (کلیلە زێڕینەکە)

> ⚠️ **زۆر گرنگ:** ئەم کلیلە تەنها **جارێک** دروست دەکرێت. ئەگەر بیدۆڕێنیت یان
> وشەی نهێنییەکەی لەبیر بکەیت، **هەرگیز** ناتوانیت ئەپەکە لەسەر گووگڵ پلەی
> نوێ بکەیتەوە — ناچار دەبیت ئەپێکی نوێ بە ناوێکی تر دروست بکەیت.
> کۆپییەکی لە شوێنێکی پارێزراو (Google Drive / USB) هەڵبگرە.

لە فۆڵدەری پڕۆژەکەدا ئەم فەرمانە بکە. **وشەی نهێنی خۆت دابنێ** (لانیکەم ١٢ پیت):

```bash
keytool -genkeypair -v -keystore android/sallaty-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias sallaty
```

پرسیارت لێدەکات:
- `Enter keystore password:` → وشەی نهێنی خۆت (٢ جار)
- `What is your first and last name?` → ناوی خۆت یان `Sallaty`
- ئەوانی تر دەتوانیت بەتاڵ بەجێبهێڵیت (Enter)
- `Is CN=... correct?` → `yes`

## هەنگاوی ٢ — فایلی `android/keystore.properties` دروست بکە

فایلێکی نوێ بە ناوی `keystore.properties` لە فۆڵدەری `android/`دا دروست بکە:

```properties
storeFile=sallaty-release.jks
storePassword=وشەی_نهێنیەکەت
keyAlias=sallaty
keyPassword=وشەی_نهێنیەکەت
```

> ✅ ئەم فایلە و `.jks`ـەکە لە `.gitignore`دان — هەرگیز بۆ گیت ناچن.

## هەنگاوی ٣ — AABـی واژووکراو دروست بکە

```bash
npm run aab
```

ئەنجام: `android/app/build/outputs/bundle/release/app-release.aab` ← ئەمە بۆ گووگڵ پلەی بارئەکەیت.

## هەنگاوی ٤ — سیاسەتی تایبەتمەندی بڵاو بکەرەوە

گووگڵ **لینکێکی گشتی** دەخوازێت. `docs/privacy-policy.md` ئامادەیە. ئاسانترین ڕێگا:

1. ڕیپۆیەکی گیتهەب (public) دروست بکە
2. فایلەکە بارکە
3. لە **Settings → Pages** چالاکی بکە
4. لینکەکە کۆپی بکە (نموونە: `https://USERNAME.github.io/sallaty/privacy-policy`)

## هەنگاوی ٥ — گووگڵ پلەی کۆنسۆل

1. **Create app** → ناو: `سەڵاتی — Sallaty` · زمان · **App** · **Free**
2. **App content** بەشەکان پڕبکەرەوە (لای خوارەوە)
3. **Production → Create new release** → AABـەکە بارکە

### پێویستەکانی Store listing
| شت | پێویست |
|---|---|
| ئایکۆن | 512×512 PNG (`public/icon-512.png` ✅ ئامادەیە) |
| Feature graphic | 1024×500 PNG (**پێویستە دروست بکرێت**) |
| وێنەی شاشە | لانیکەم ٢ (باشتر ٤–٨) — لە مۆبایلەکەتەوە بیگرە |
| Short description | ≤ ٨٠ پیت |
| Full description | ≤ ٤٠٠٠ پیت |

### ✍️ دەقی پێشنیارکراو

**Short description:**
> کاتی نوێژ بە بانگی ڕاستەقینە، قورئان بە وەرگێڕانی کوردی، قیبلە و ئەزکار.

**Full description:**
> سەڵاتی هاوڕێی ڕۆژانەی نوێژەکانتە — بە تەواوی ئۆفلاین و بێ هیچ هەژمارێک.
>
> ✦ کاتی نوێژ بۆ زیاتر لە ٥٠ شاری کوردستان و عێراق، لە سەرچاوەی فەرمییەوە
> ✦ بانگی ڕاستەقینە — تەنانەت کاتێک شاشە قفڵە و کوژاوەتەوە
> ✦ قورئانی پیرۆز بە عەرەبی و وەرگێڕانی کوردی + گەڕان و نیشانکردنی ئایەت
> ✦ ئاراستەی قیبلە بە پێچە
> ✦ زیکر و ئەزکاری بۆنە جیاوازەکان
> ✦ تۆمارکردنی نوێژی بە جەماعەت
> ✦ کوردی و عەرەبی · ڕووکاری ڕووناک و تاریک
>
> بێ ئینتەرنێت کار دەکات · بێ هەژمار · بێ کۆکردنەوەی زانیاریی کەسی

## هەنگاوی ٦ — 🔴 ڕوونکردنەوەی مۆڵەتە هەستیارەکان

گووگڵ ئەمانە **بەوردی پێداچوونەوەیان بۆ دەکات**. لە **App content → Sensitive permissions**:

| مۆڵەت | چی بنووسیت |
|---|---|
| `USE_EXACT_ALARM` | "Alarm clock functionality: the app sounds the Islamic call to prayer (adhan) at five precise, astronomically-determined times each day. Users rely on exact timing; a delayed alarm defeats the app's core purpose." |
| `FOREGROUND_SERVICE_SPECIAL_USE` | "Keeps the prayer-alarm schedule intact on devices whose OEM power management delays or cancels exact alarms. Shows an ongoing notification with the next prayer time. No audio, no data collection." |
| `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` | "Requested (never forced) so the exact prayer alarms are not deferred by Doze. The app is an alarm-clock-type app." |

> ⚠️ ئەگەر `FOREGROUND_SERVICE_SPECIAL_USE` ڕەتکرایەوە → سێرڤیسی keep-alive لادەبەین
> (بانگ هەر کاردەکات، چونکە `setAlarmClock` سەربەخۆیە).

## هەنگاوی ٧ — Data safety

- Does your app collect or share user data? → **No**
- Is all data encrypted in transit? → (بەکارنایەت چونکە داتا نانێردرێت)
- Data deletion → بەکارنایەت

> شوێن (location) لەسەر ئامێرەکە بەکاردێت و **نانێردرێت** → بە «collect» ناژمێردرێت.

## هەنگاوی ٨ — Content rating

پرسیارنامەکە پڕبکەرەوە: هیچ توندوتیژی/سێکس/قومار نییە → **Everyone / 3+**
جۆر: **Lifestyle** یان **Books & Reference**

## هەنگاوی ٩ — تاقیکردنەوە پێش بڵاوکردنەوە

⚠️ بۆ هەژماری کەسی (personal account) نوێ، گووگڵ داوای **١٢ تاقیکەر بۆ ١٤ ڕۆژ**
دەکات پێش ئەوەی بتوانیت بۆ Production بڵاوی بکەیتەوە.
→ **Testing → Closed testing** دەستپێبکە و ١٢ کەس (ئیمەیڵی گووگڵیان) زیاد بکە.
(هەژماری کۆمپانیا/organization ئەم مەرجەی نییە.)

---

## داهاتوو: ئاد (AdMob) — v1.1

**AdSense نا — AdMob.** پاش پەسەندکردنی v1.0:
1. هەژماری AdMob دروست بکە → ئەپەکە زیاد بکە → `App ID` وەربگرە
2. پاکێجی `@capacitor-community/admob` دابنێ
3. بانەری خوارەوە تەنها لە: سەرەکی، ئەزکار، زیکر، ڕێکخستن
4. 🚫 **هەرگیز** لە: لاپەڕەی قورئان، لەکاتی بانگ، لاپەڕەی قیبلە
5. Data safety نوێ بکەرەوە (Advertising ID) + سیاسەتی تایبەتمەندی نوێ بکەرەوە
6. بۆ ئەوروپا: UMP consent

---

## iOS (کاتێک Macت هەبوو)

`docs/ios-setup.md` ببینە. کورتی:
Apple Developer ($99/ساڵ) → Xcode → Archive → App Store Connect.
