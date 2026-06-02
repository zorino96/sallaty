// Prayer-time adhan scheduling + permissions.
//
// On native Android the adhan is driven by a custom exact-alarm pipeline
// (AdhanAlarm plugin → AlarmManager.setAlarmClock → foreground service that
// wakes the screen and plays the full adhan). This is the only reliable way to
// sound the adhan when the screen is off / app is killed; a plain scheduled
// notification cannot wake the screen or guarantee full playback.
//
// On the web we fall back to the Notification API + in-page audio.

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

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

// res/raw base name for the selected adhan, or '' for a chime (→ native plays
// the device's default alarm tone, since chimes are synthesized in-page only).
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
    // Make sure exact alarms are allowed (so the adhan fires at the precise time).
    if (perm === 'granted' && isNative()) {
      try {
        const exact = await AdhanAlarm.canScheduleExact();
        if (!exact.value) await AdhanAlarm.openExactAlarmSettings();
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
    try { await AdhanAlarm.cancelAll(); } catch { /* ignore */ }
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length) {
        await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
      }
    } catch { /* ignore */ }
  }
}

export async function schedulePrayerNotifications(input: ScheduleInput): Promise<void> {
  await cancelAllScheduled();
  const now = Date.now();
  const days = Math.max(1, input.daysAhead ?? 5);
  const horizon = (days + 1) * 24 * 60 * 60 * 1000;

  if (isNative()) {
    const sound = soundBase(input.adhanId);
    const items: AdhanAlarmItem[] = Array.from({ length: days }).flatMap((_, d) => {
      const day = new Date();
      day.setDate(day.getDate() + d);
      day.setHours(12, 0, 0, 0); // midday anchor → resolves the correct calendar day
      const times = input.timesFor(day);
      return PRAYERS.flatMap((p, i) => {
        if (input.isMuted(p)) return [];
        const at = times[p].getTime();
        if (at - now <= 5_000 || at - now > horizon) return [];
        return [{ id: 100 + d * 10 + i, at, title: input.title, body: input.bodyFor(p), sound }];
      });
    });
    try {
      await AdhanAlarm.schedule({ items });
    } catch { /* ignore */ }
    return;
  }

  // Web fallback — Notification + in-page adhan playback via timers (today only).
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

// Fire a test: on native, arm a real alarm a few seconds out so the user can
// lock the screen and confirm the adhan + screen-wake works. On web, show a
// notification + play the adhan in-page.
export async function fireTestNotification(title: string, body: string, adhanId?: string): Promise<void> {
  if (isNative()) {
    try {
      await AdhanAlarm.scheduleTest({ seconds: 5, sound: adhanId ? soundBase(adhanId) : '', title, body });
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
