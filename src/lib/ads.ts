// AdMob banner ads — deliberately narrow in scope.
//
// POLICY (ours, stricter than Google's):
//   • Ads appear ONLY on ordinary pages (home, feature pages, settings).
//   • NEVER on the Qur'an reader/search/bookmarks, NEVER on qibla, and NEVER
//     while the adhan is sounding. Placing ads against scripture is both a
//     policy risk and disrespectful.
//   • Banner only — no interstitials, no rewarded, no app-open ads. A prayer
//     app must never block the user from the times they came for.
//
// Until the real AdMob account exists, this uses Google's OFFICIAL TEST IDs, so
// the build is safe to run (clicking real ads yourself = account ban). Swap the
// two constants below for the real IDs, then flip USE_TEST_ADS to false.

import { Capacitor } from '@capacitor/core';

// Google's official sample/test unit — safe to click, never bills anyone.
const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716';

// Real AdMob ad units (publisher pub-7966248989436758). Each platform has its
// own AdMob app; serving one platform's unit on the other violates AdMob policy.
// Android app id: ca-app-pub-7966248989436758~3302830034 (also in AndroidManifest).
// iOS app id:     ca-app-pub-7966248989436758~3242054624 (also in Info.plist).
const REAL_BANNER_ANDROID = 'ca-app-pub-7966248989436758/4894133369';
const REAL_BANNER_IOS = 'ca-app-pub-7966248989436758/6989727947';

// Keep test ads ON until the app is on the Play Store and you're ready to earn.
// ⚠️ Never click your own live ads — that gets the AdMob account banned.
const USE_TEST_ADS = true;
// ─────────────────────────────────────────────────────────────────────────────

let initialised = false;
let shown = false;

function bannerId(): string {
  const ios = Capacitor.getPlatform() === 'ios';
  if (USE_TEST_ADS) return ios ? TEST_BANNER_IOS : TEST_BANNER_ANDROID;
  const real = ios ? REAL_BANNER_IOS : REAL_BANNER_ANDROID;
  // No real unit for this platform yet → serve the test unit instead of the
  // other platform's unit (which AdMob forbids).
  if (!real) return ios ? TEST_BANNER_IOS : TEST_BANNER_ANDROID;
  return real;
}

function enabled(): boolean {
  if (!Capacitor.isNativePlatform()) return false;
  // No real ID configured yet and test ads switched off → stay silent.
  return USE_TEST_ADS || bannerId().length > 0;
}

async function ensureInit(): Promise<boolean> {
  if (!enabled()) return false;
  if (initialised) return true;
  try {
    const { AdMob, MaxAdContentRating } = await import('@capacitor-community/admob');
    await AdMob.initialize({
      // Only "General audiences" creatives — this is the SDK-level filter that
      // keeps dating/alcohol/gambling/suggestive ads out of an Islamic app.
      // It is enforced together with the Blocking controls set in the AdMob UI.
      maxAdContentRating: MaxAdContentRating.General,
      initializeForTesting: USE_TEST_ADS,
    });
    // Ask for consent where required (EEA/UK). Non-blocking: if anything goes
    // wrong we simply don't show ads rather than showing them unlawfully.
    try {
      const info = await AdMob.requestConsentInfo();
      if (info.isConsentFormAvailable && info.status === 'REQUIRED') {
        await AdMob.showConsentForm();
      }
    } catch { /* consent unavailable — fall through, banner may be skipped */ }
    initialised = true;
    return true;
  } catch {
    return false;
  }
}

/** Show the bottom banner. Safe to call repeatedly. */
export async function showBanner(): Promise<void> {
  if (shown) return;
  if (!(await ensureInit())) return;
  try {
    const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
    await AdMob.showBanner({
      adId: bannerId(),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: USE_TEST_ADS,
    });
    shown = true;
  } catch { /* never let an ad failure break the app */ }
}

/** Remove the banner — call on Qur'an / qibla / adhan screens. */
export async function hideBanner(): Promise<void> {
  if (!shown) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.removeBanner();
  } catch { /* ignore */ }
  shown = false;
}
