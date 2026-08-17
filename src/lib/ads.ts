// AdMob banner ads — deliberately narrow in scope.
//
// POLICY (ours, stricter than Google's):
//   • One banner, pinned below the navigation bar, which is lifted clear of it
//     so no tap ever lands on an advert by accident (see --ad-h in globals.css).
//   • NEVER while the adhan is sounding, and never on the first-run flow.
//   • Banner only — no interstitials, no rewarded, no app-open ads. A prayer
//     app must never block the user from the times they came for.
//
// ⚠️ USE_TEST_ADS serves Google's sample units, which render a bright "Test
// mode / test ad" placeholder. That is right while developing and wrong in
// anything you ship: reviewers read it as unfinished content, and the app earns
// nothing. It must be false in any build that goes to a store.
//
// ⚠️ With it false the adverts are live. Never tap your own — self-clicks are
// what get an AdMob account banned.

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

const USE_TEST_ADS = false;
// ─────────────────────────────────────────────────────────────────────────────

let initialised = false;
let shown = false;

// Whether a banner is actually on screen right now. Asking for one is not the
// same as getting one: AdMob commonly has no inventory for an app that is not
// yet published, and then `showBanner` resolves having drawn nothing. Reserving
// space for that would leave a blank strip along the bottom of every screen, so
// the layout follows this rather than the request.
let bannerVisible = false;
const visibilityListeners = new Set<(visible: boolean) => void>();

function setBannerVisible(v: boolean): void {
  if (bannerVisible === v) return;
  bannerVisible = v;
  for (const listener of visibilityListeners) listener(v);
}

/** Subscribe to whether a banner is really showing. Fires immediately. */
export function onBannerVisibility(cb: (visible: boolean) => void): () => void {
  visibilityListeners.add(cb);
  cb(bannerVisible);
  return () => { visibilityListeners.delete(cb); };
}

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
    const { AdMob, MaxAdContentRating, BannerAdPluginEvents } = await import('@capacitor-community/admob');
    // Attach before initialising, so the first banner's result is not missed.
    await AdMob.addListener(BannerAdPluginEvents.Loaded, () => setBannerVisible(true));
    await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => setBannerVisible(false));
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

/** Remove the banner — call while the adhan sounds, and on the first-run flow. */
export async function hideBanner(): Promise<void> {
  setBannerVisible(false);
  if (!shown) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.removeBanner();
  } catch { /* ignore */ }
  shown = false;
}
