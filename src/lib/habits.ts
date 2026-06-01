// Congregation check-in store. Recovered from module 9135 in the APK.
import { storage } from './storage';

export type Prayer = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type CheckIn = {
  id: string;
  timestamp: number;
  date: string;          // YYYY-MM-DD in local time
  prayer: Prayer;
  mosqueName?: string;
  lat?: number;
  lng?: number;
};

const KEY = 'checkins';
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) {
    try {
      l();
    } catch {
      /* ignore */
    }
  }
}

export function getCheckins(): CheckIn[] {
  return storage.get<CheckIn[]>(KEY, []);
}

export function checkinsForDate(date: string): CheckIn[] {
  return getCheckins().filter((c) => c.date === date);
}

export function addCheckin(input: Partial<CheckIn> & { prayer: Prayer }): CheckIn {
  const now = Date.now();
  const entry: CheckIn = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: input.timestamp ?? now,
    date: input.date ?? todayKey(),
    prayer: input.prayer,
    mosqueName: input.mosqueName,
    lat: input.lat,
    lng: input.lng,
  };
  const all = getCheckins();
  all.unshift(entry);
  storage.set(KEY, all);
  notify();
  return entry;
}

export function removeCheckin(id: string): void {
  const filtered = getCheckins().filter((c) => c.id !== id);
  storage.set(KEY, filtered);
  notify();
}

export function subscribeCheckins(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dateKey(d: Date): string {
  return todayKey(d);
}

// Days with at least one check-in.
export function trackedDays(): string[] {
  const days = new Set<string>();
  for (const c of getCheckins()) days.add(c.date);
  return Array.from(days);
}

// Heatmap density for a given date key — 0..1 based on unique fard-prayer check-ins.
export function densityForDate(dateKey: string): number {
  const fards = new Set<Prayer>();
  for (const c of getCheckins()) {
    if (c.date === dateKey) fards.add(c.prayer);
  }
  return Math.min(1, fards.size / 5);
}

// Current consecutive-day streak ending today.
export function currentStreak(): number {
  const set = new Set(trackedDays());
  let streak = 0;
  const cur = new Date();
  while (set.has(todayKey(cur))) {
    streak += 1;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}
