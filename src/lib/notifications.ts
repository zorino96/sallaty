// Prayer-time adhan scheduling + permissions — platform-aware.
//
// Android: a custom exact-alarm pipeline (AdhanAlarm plugin → AlarmManager
// .setAlarmClock → foreground service that wakes the screen and plays the FULL
// adhan via MediaPlayer). This is the only reliable way to sound the full adhan
// when the screen is off / app is killed.
//
// iOS: the platform forbids waking the screen or playing scheduled background
// audio, and caps notification sounds at 30s. So we schedule LocalNotifications
// with a short (<=30s) bundled adhan sound — the best iOS allows. (Requires the
// ios/ project to be added on a Mac; see docs/ios-setup.md.)
//
// Web: Notification API + in-page audio playback via timers.

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { DailyTimes, NotifPerm, PrayerName } from './types';
import { playAdhan } from './adhanPlayer';
import { trackById } from '@/data/adhanTracks';
import { AdhanAlarm, type AdhanAlarmItem } from './adhanAlarm';

const PRAYERS: Array<Exclude<PrayerName, 'none' | 'sunrise'>> = [
  'fajr', 'dhuhr', 'asr', 'maghrib', 'isha',
];

let pendingTimers: Array<ReturnType<typeof setTimeout>> = [];

function platform(): string {
  return Capacitor.getPlatform(); // 'android' | 'ios' | 'web'
}
function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

// res/raw (Android) / bundle (iOS) base name for the selected adhan, or '' for a
// chime (→ native plays the device default alarm tone; chimes are synthesized
// in-page only).
function soundBase(adhanId: string): string {
  const track = trackById(adhanId);
  return track?.file ? adhanId.replace(/-/g, '_') : '';
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export async function checkNotifPermission(): Promise<NotifPerm> {
  try {
    const res = await LocalNotifications.checkPermissions();
    if (res.display === 'granted') return 'granted';
    if (res.display === 'denied') return 'denied';
    return 'default';
  } catch {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission as NotifPerm;
  }
}

export async function requestNotifPermission(): Promise<NotifPerm> {
  try {
    const res = await LocalNotifications.requestPermissions();
    const perm: NotifPerm = res.display === 'granted' ? 'granted' : res.display === 'denied' ? 'denied' : 'default';
    // Android only: make sure exact alarms are allowed (precise firing) AND the
    // app is exempt from battery optimization (so the OS doesn't kill the alarm
    // when locked). iOS has neither concept.
    if (perm === 'granted' && platform() === 'android') {
      try {
        const exact = await AdhanAlarm.canScheduleExact();
        if (!exact.value) await AdhanAlarm.openExactAlarmSettings();
      } catch { /* ignore */ }
      try {
        const bat = await AdhanAlarm.isIgnoringBatteryOptimizations();
        if (!bat.value) await AdhanAlarm.requestBatteryExemption();
      } catch { /* ignore */ }
    }
    return perm;
  } catch {
    if (typeof Notification === 'undefined') return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    try {
      return (await Notification.requestPermission()) as NotifPerm;
    } catch {
      return 'denied';
    }
  }
}

// ─── Scheduling ──────────────────────────────────────────────────────────────

export type ScheduleInput = {
  // Resolve a calendar day's prayer times. Called for each of the next
  // `daysAhead` days so the adhan keeps firing even if the app isn't reopened.
  timesFor: (date: Date) => DailyTimes;
  daysAhead?: number; // default 5
  title: string;
  bodyFor: (p: PrayerName) => string;
  silenceLabel: string;
  isMuted: (p: PrayerName) => boolean;
  adhanId: string;
};

export async function cancelAllScheduled(): Promise<void> {
  pendingTimers.forEach(clearTimeout);
  pendingTimers = [];
  if (isNative()) {
    if (platform() === 'android') {
      try { await AdhanAlarm.cancelAll(); } catch { /* ignore */ }
    }
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length) {
        await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
      }
    } catch { /* ignore */ }
  }
}

// Build a flat list of upcoming prayer fire-times over the next `days` days.
function upcoming(
  input: ScheduleInput,
  days: number,
  now: number,
  horizon: number,
): Array<{ id: number; at: number; prayer: PrayerName }> {
  return Array.from({ length: days }).flatMap((_, d) => {
    const day = new Date();
    day.setDate(day.getDate() + d);
    day.setHours(12, 0, 0, 0); // midday anchor → resolves the correct calendar day
    const times = input.timesFor(day);
    return PRAYERS.flatMap((p, i) => {
      if (input.isMuted(p)) return [];
      const at = times[p].getTime();
      if (at - now <= 5_000 || at - now > horizon) return [];
      return [{ id: 100 + d * 10 + i, at, prayer: p as PrayerName }];
    });
  });
}

export async function schedulePrayerNotifications(input: ScheduleInput): Promise<void> {
  await cancelAllScheduled();
  const now = Date.now();
  const days = Math.max(1, input.daysAhead ?? 5);
  const horizon = (days + 1) * 24 * 60 * 60 * 1000;

  // ── Android: exact-alarm pipeline plays the full adhan ──────────────────────
  if (platform() === 'android') {
    const sound = soundBase(input.adhanId);
    const items: AdhanAlarmItem[] = upcoming(input, days, now, horizon).map((u) => ({
      id: u.id, at: u.at, title: input.title, body: input.bodyFor(u.prayer), sound,
    }));
    try {
      await AdhanAlarm.schedule({ items });
    } catch { /* ignore */ }
    return;
  }

  // ── iOS: local notifications with a short (<=30s) bundled adhan sound ────────
  if (platform() === 'ios') {
    const base = soundBase(input.adhanId);
    // iOS expects a bundled audio file name (aiff/wav/caf, <=30s). We use the
    // same base names as Android res/raw (e.g. adhan_aqib) with a .caf extension.
    const sound = base ? `${base}.caf` : undefined;
    const notifications = upcoming(input, days, now, horizon).map((u) => ({
      id: u.id,
      title: input.title,
      body: input.bodyFor(u.prayer),
      schedule: { at: new Date(u.at), allowWhileIdle: true },
      sound,
    }));
    try {
      if (notifications.length) await LocalNotifications.schedule({ notifications });
    } catch { /* ignore */ }
    return;
  }

  // ── Web: Notification + in-page adhan playback via timers (today only) ───────
  const today = input.timesFor(new Date());
  PRAYERS.forEach((p) => {
    if (input.isMuted(p)) return;
    const delta = today[p].getTime() - now;
    if (delta <= 1_000 || delta > 48 * 60 * 60 * 1000) return;
    pendingTimers.push(
      setTimeout(() => {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            new Notification(input.title, { body: input.bodyFor(p), icon: '/icon.svg', tag: `prayer-${p}` });
          } catch { /* ignore */ }
        }
        playAdhan(input.adhanId);
      }, delta),
    );
  });
}

// Fire a test. Android: arm a real exact alarm a few seconds out so the user can
// lock the screen and confirm the full adhan + screen-wake works. iOS: schedule
// a local notification a few seconds out with the bundled sound. Web: show a
// notification + play the adhan in-page.
export async function fireTestNotification(title: string, body: string, adhanId?: string): Promise<void> {
  if (platform() === 'android') {
    try {
      await AdhanAlarm.scheduleTest({ seconds: 5, sound: adhanId ? soundBase(adhanId) : '', title, body });
    } catch { /* ignore */ }
    return;
  }
  if (platform() === 'ios') {
    const base = adhanId ? soundBase(adhanId) : '';
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: 999,
          title,
          body,
          schedule: { at: new Date(Date.now() + 5_000), allowWhileIdle: true },
          sound: base ? `${base}.caf` : undefined,
        }],
      });
    } catch { /* ignore */ }
    return;
  }
  setTimeout(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try { new Notification(title, { body }); } catch { /* ignore */ }
    }
    if (adhanId) playAdhan(adhanId);
  }, 1200);
}
