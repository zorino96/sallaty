import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.selati.app',
  appName: 'سەڵاتی',
  webDir: 'out',
  android: { allowMixedContent: false },
  // iOS Info.plist usage strings — required or iOS crashes when requesting
  // location. Applied when you run `npx cap add ios` / `npx cap sync ios`.
  ios: {
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0E2421',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0E2421',
      overlaysWebView: false,
    },
    CapacitorHttp: { enabled: true },
  },
};

export default config;
