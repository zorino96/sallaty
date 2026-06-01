// Prayer-time notification scheduling + permissions.
// Uses @capacitor/local-notifications on native Android (and its web fallback
// in the browser). This replaces the old web-only `Notification` API path that
// reported "unsupported" inside the Capacitor WebView.

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { DailyTimes, NotifPerm, PrayerName } from './types';
import { playAdhan, stopAdhan } from './adhanPlayer';
import { trackById } from '@/data/adhanTracks';

const PRAYERS: Array<Exclude<PrayerName, 'none' | 'sunrise'>> = [
  'fajr', 'dhuhr', 'asr', 'maghrib', 'isha',
];

let pendingTimers: Array<ReturnType<typeof setTimeout>> = [];
let actionTypesRegistered = false;
let actionListenerAdded = false;
const createdChannels = new Set<string>();

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

// Map the selected adhan to a bundled Android raw sound + its notification
// channel. The MP3s are copied into android/app/src/main/res/raw as
// adhan_<id>.mp3 by scripts/build-apk.mjs. Chimes have no file → default sound.
function adhanSound(adhanId: string): { sound: string; channelId: string } | null {
  const track = trackById(adhanId);
  if (!track?.file) return null; // chime → default notification sound
  const base = adhanId.replace(/-/g, '_'); // adhan-aqib → adhan_aqib
  return { sound: `${base}.mp3`, channelId: `${base}` };
}

// Android O+ ties notification sound to a channel. Create one channel per adhan
// (sound is fixed at channel creation) and schedule on the matching channel.
async function ensureAdhanChannel(adhanId: string): Promise<{ channelId: string; sound: string } | null> {
  if (!isNative()) return null;
  const s = adhanSound(adhanId);
  if (!s) return null;
  if (createdChannels.has(s.channelId)) return s;
  try {
    await LocalNotifications.createChannel({
      id: s.channelId,
      name: 'بانگی نوێژ',
      description: 'Prayer-time adhan',
      sound: s.sound,
      importance: 5,
      visibility: 1,
      vibration: true,
    });
    createdChannels.add(s.channelId);
  } catch {
    /* ignore — falls back to default sound */
  }
  return s;
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export async function checkNotifPermission(): Promise<NotifPerm> {
  try {
    const res = await LocalNotifications.checkPermissions();
    if (res.display === 'granted') return 'granted';
    if (res.display === 'denied') return 'denied';
    return 'default';
  } catch {
    // Plugin genuinely unavailable (rare) — fall back to web API if present.
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission as NotifPerm;
  }
}

export async function requestNotifPermission(): Promise<NotifPerm> {
  try {
    const res = await LocalNotifications.requestPermissions();
    if (res.display === 'granted') return 'granted';
    if (res.display === 'denied') return 'denied';
    return 'default';
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
  times: DailyTimes;
  title: string;
  bodyFor: (p: PrayerName) => string;
  silenceLabel: string;
  isMuted: (p: PrayerName) => boolean;
  adhanId: string;
};

async function ensureActionTypes(silenceLabel: string): Promise<void> {
  if (!isNative() || actionTypesRegistered) return;
  try {
    await LocalNotifications.registerActionTypes({
      types: [{ id: 'PRAYER_ACTIONS', actions: [{ id: 'silence', title: silenceLabel }] }],
    });
    actionTypesRegistered = true;
  } catch {
    /* ignore */
  }
}

async function ensureActionListener(): Promise<void> {
  if (!isNative() || actionListenerAdded) return;
  try {
    await LocalNotifications.addListener('localNotificationActionPerformed', (notif) => {
      if (notif.actionId === 'silence') stopAdhan();
    });
    actionListenerAdded = true;
  } catch {
    /* ignore */
  }
}

export async function cancelAllScheduled(): Promise<void> {
  pendingTimers.forEach(clearTimeout);
  pendingTimers = [];
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }
  } catch {
    /* ignore */
  }
}

export async function schedulePrayerNotifications(input: ScheduleInput): Promise<void> {
  await cancelAllScheduled();
  const now = Date.now();

  if (isNative()) {
    await ensureActionTypes(input.silenceLabel);
    await ensureActionListener();
    const ch = await ensureAdhanChannel(input.adhanId);

    const notifications = PRAYERS.flatMap((p, i) => {
      if (input.isMuted(p)) return [];
      const at = input.times[p];
      const delta = at.getTime() - now;
      if (delta <= 5_000 || delta > 48 * 60 * 60 * 1000) return [];
      return [{
        id: 6100 + i,
        title: input.title,
        body: input.bodyFor(p),
        schedule: { at },
        smallIcon: 'ic_stat_icon',
        largeIcon: 'ic_launcher',
        autoCancel: true,
        actionTypeId: 'PRAYER_ACTIONS',
        ...(ch ? { sound: ch.sound, channelId: ch.channelId } : {}),
      }];
    });

    if (notifications.length) {
      try {
        await LocalNotifications.schedule({ notifications });
      } catch {
        /* ignore */
      }
    }

    // In-app adhan playback timers (fire while app is foregrounded).
    PRAYERS.forEach((p) => {
      if (input.isMuted(p)) return;
      const delta = input.times[p].getTime() - now;
      if (delta <= 1_000 || delta > 24 * 60 * 60 * 1000) return;
      pendingTimers.push(setTimeout(() => playAdhan(input.adhanId), delta));
    });
    return;
  }

  // Web fallback — Notification + adhan playback via timers.
  PRAYERS.forEach((p) => {
    if (input.isMuted(p)) return;
    const delta = input.times[p].getTime() - now;
    if (delta <= 1_000 || delta > 48 * 60 * 60 * 1000) return;
    pendingTimers.push(
      setTimeout(() => {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            new Notification(input.title, { body: input.bodyFor(p), icon: '/icon.svg', tag: `prayer-${p}` });
          } catch {
            /* ignore */
          }
        }
        playAdhan(input.adhanId);
      }, delta),
    );
  });
}

// Fire a test notification ~1.5s from now (used by the Control page).
export async function fireTestNotification(title: string, body: string, adhanId?: string): Promise<void> {
  if (isNative()) {
    try {
      const perm = await checkNotifPermission();
      if (perm !== 'granted') await requestNotifPermission();
      const ch = adhanId ? await ensureAdhanChannel(adhanId) : null;
      await LocalNotifications.schedule({
        notifications: [{
          id: 9999,
          title,
          body,
          schedule: { at: new Date(Date.now() + 1500) },
          smallIcon: 'ic_stat_icon',
          largeIcon: 'ic_launcher',
          autoCancel: true,
          ...(ch ? { sound: ch.sound, channelId: ch.channelId } : {}),
        }],
      });
    } catch {
      /* ignore */
    }
    return;
  }
  setTimeout(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch {
        /* ignore */
      }
    }
  }, 1500);
}
