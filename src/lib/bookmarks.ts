// Qur'an bookmarks + "continue reading" pin. Pure local storage, no account,
// no backend, fully offline — namespaced under "selati." like the rest of the app.

import { storage } from './storage';

export type Bookmark = { s: number; a: number; ts: number }; // surah, ayah, saved-at
export type LastRead = { s: number; a: number; ts: number } | null;

const BM_KEY = 'quran.bookmarks';
const LR_KEY = 'quran.lastread';
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) {
    try { l(); } catch { /* ignore */ }
  }
}

export function subscribeBookmarks(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export function getBookmarks(): Bookmark[] {
  return storage.get<Bookmark[]>(BM_KEY, []);
}

export function isBookmarked(s: number, a: number): boolean {
  return getBookmarks().some((b) => b.s === s && b.a === a);
}

export function toggleBookmark(s: number, a: number): boolean {
  const all = getBookmarks();
  const idx = all.findIndex((b) => b.s === s && b.a === a);
  if (idx >= 0) {
    all.splice(idx, 1);
    storage.set(BM_KEY, all);
    notify();
    return false;
  }
  all.unshift({ s, a, ts: Date.now() });
  storage.set(BM_KEY, all);
  notify();
  return true;
}

export function removeBookmark(s: number, a: number): void {
  storage.set(BM_KEY, getBookmarks().filter((b) => !(b.s === s && b.a === a)));
  notify();
}

// Ayah numbers bookmarked within a given surah (for quick lookup in the reader).
export function bookmarkedAyat(s: number): Set<number> {
  return new Set(getBookmarks().filter((b) => b.s === s).map((b) => b.a));
}

// ─── Last read (continue reading) ──────────────────────────────────────────────

export function getLastRead(): LastRead {
  return storage.get<LastRead>(LR_KEY, null);
}

export function setLastRead(s: number, a: number): void {
  const prev = getLastRead();
  if (prev && prev.s === s && prev.a === a) return; // no-op, avoid churn
  storage.set<LastRead>(LR_KEY, { s, a, ts: Date.now() });
  notify();
}
