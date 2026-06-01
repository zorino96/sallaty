// Offline full-text Qur'an search over a single bundled index
// (public/quran/search-index.json). No API, no backend — fetches one local
// asset once, normalizes in memory, and substring-matches Arabic + Kurdish.

export type SearchResult = { s: number; a: number; ar: string; ku: string };

type Entry = [number, number, string, string]; // [surah, ayah, arabic, kurdish]

let rawCache: Entry[] | null = null;
let arNorm: string[] = [];
let kuNorm: string[] = [];
let loadingPromise: Promise<void> | null = null;

// Fold Arabic/Kurdish script so search is forgiving: strip harakat & tatweel,
// unify alef forms, unify Arabic/Kurdish yeh and kaf, ta-marbuta → ha.
export function normalizeArabic(input: string): string {
  return input
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭ]/g, '') // diacritics/marks
    .replace(/ـ/g, '')        // tatweel
    .replace(/[إأآٱا]/g, 'ا')      // alef forms → bare alef
    .replace(/[يى]/g, 'ی')         // arabic yeh/alef-maqsura → kurdish/farsi yeh
    .replace(/ك/g, 'ک')            // arabic kaf → kurdish keheh
    .replace(/ة/g, 'ه')            // ta marbuta → ha
    .replace(/‌/g, '')        // ZWNJ
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function loadSearchIndex(): Promise<void> {
  if (rawCache) return Promise.resolve();
  if (loadingPromise) return loadingPromise;
  loadingPromise = fetch('/quran/search-index.json')
    .then((r) => {
      if (!r.ok) throw new Error('search index unavailable');
      return r.json();
    })
    .then((data: Entry[]) => {
      rawCache = data;
      arNorm = new Array(data.length);
      kuNorm = new Array(data.length);
      for (let i = 0; i < data.length; i += 1) {
        arNorm[i] = normalizeArabic(data[i][2]);
        kuNorm[i] = normalizeArabic(data[i][3]);
      }
    })
    .catch((e) => {
      loadingPromise = null; // allow retry
      throw e;
    });
  return loadingPromise;
}

export function isIndexReady(): boolean {
  return rawCache !== null;
}

// Substring search across Arabic + Kurdish. Requires loadSearchIndex() first.
export function searchAyat(query: string, limit = 80): SearchResult[] {
  if (!rawCache) return [];
  const q = normalizeArabic(query);
  if (q.length < 2) return [];
  const out: SearchResult[] = [];
  for (let i = 0; i < rawCache.length && out.length < limit; i += 1) {
    if (arNorm[i].includes(q) || kuNorm[i].includes(q)) {
      const [s, a, ar, ku] = rawCache[i];
      out.push({ s, a, ar, ku });
    }
  }
  return out;
}

// Count without materializing all results (for the "N results" label).
export function countAyat(query: string): number {
  if (!rawCache) return 0;
  const q = normalizeArabic(query);
  if (q.length < 2) return 0;
  let c = 0;
  for (let i = 0; i < rawCache.length; i += 1) {
    if (arNorm[i].includes(q) || kuNorm[i].includes(q)) c += 1;
  }
  return c;
}

// Look up a single ayah's text by (surah, ayah) — used by the bookmarks page.
export function ayahText(s: number, a: number): { ar: string; ku: string } | null {
  if (!rawCache) return null;
  for (let i = 0; i < rawCache.length; i += 1) {
    if (rawCache[i][0] === s && rawCache[i][1] === a) {
      return { ar: rawCache[i][2], ku: rawCache[i][3] };
    }
  }
  return null;
}

// Split text around case-insensitive literal matches of `query` for highlighting.
// Best-effort: if the raw query isn't present (e.g. Arabic harakat differences),
// returns the whole string unhighlighted.
export function highlightParts(text: string, query: string): Array<{ t: string; hit: boolean }> {
  const q = query.trim();
  if (q.length < 2) return [{ t: text, hit: false }];
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${esc})`, 'gi');
  const ql = q.toLowerCase();
  return text
    .split(re)
    .filter((p) => p !== '')
    .map((p) => ({ t: p, hit: p.toLowerCase() === ql }));
}
