// On-demand Quran surah loader with in-memory caching.
// Per-surah JSON files live at /quran/ar/<n>.json and /quran/ku/<n>.json.

export type AyahAr = {
  n: number;       // numberInSurah
  t: string;       // Arabic text (Uthmani script)
  page: number;
  juz: number;
  sajda: boolean;
};

export type AyahKu = {
  n: number;       // numberInSurah
  t: string;       // Kurdish translation
};

export type SurahArData = {
  number: number;
  name: string;    // surah name in Arabic
  ayahs: AyahAr[];
};

export type SurahKuData = {
  number: number;
  ayahs: AyahKu[];
};

const arCache = new Map<number, SurahArData>();
const kuCache = new Map<number, SurahKuData>();

export async function loadSurahArabic(n: number): Promise<SurahArData> {
  const cached = arCache.get(n);
  if (cached) return cached;
  const res = await fetch(`/quran/ar/${n}.json`);
  if (!res.ok) throw new Error(`Failed to fetch surah ${n} Arabic text`);
  const data = (await res.json()) as SurahArData;
  arCache.set(n, data);
  return data;
}

export async function loadSurahKurdish(n: number): Promise<SurahKuData> {
  const cached = kuCache.get(n);
  if (cached) return cached;
  const res = await fetch(`/quran/ku/${n}.json`);
  if (!res.ok) throw new Error(`Failed to fetch surah ${n} Kurdish translation`);
  const data = (await res.json()) as SurahKuData;
  kuCache.set(n, data);
  return data;
}

// Pretty Arabic-Indic digits used by the Mushaf (e.g. ٠١٢٣...).
export function arabicNumber(n: number): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n).split('').map((c) => digits[Number(c)] ?? c).join('');
}

// Mecca's "Bismillah" appears at the start of every surah except At-Tawbah (9).
// Some apps render it as a header separately from ayah 1.
export const TAWBAH_NUMBER = 9;
