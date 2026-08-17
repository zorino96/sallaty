// Overpass-API mosque finder. Mirrors the recovered logic from
// `recovered/beautified/page-81b1301d577ed6ca.beautified.js`.

import { haversineKm } from './geolocation';
import { storage } from './storage';
import type { Coords } from './types';

export type Mosque = {
  id: string;
  name?: string;
  nameAr?: string;
  lat: number;
  lng: number;
  distanceKm?: number;
};

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PER_ENDPOINT_TIMEOUT_MS = 12_000;

function cacheKey(c: Coords, radiusKm: number): string {
  return `mosques.${c.lat.toFixed(2)}.${c.lng.toFixed(2)}.${radiusKm}`;
}

type OverpassElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string | undefined>;
};

function toMosque(el: OverpassElement): Mosque | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) return null;
  const tags = el.tags ?? {};
  return {
    id: `${el.type[0]}${el.id}`,
    name:   tags.name || tags['name:ku'] || tags['name:en'],
    nameAr: tags['name:ar'] || tags.name,
    lat,
    lng,
  };
}

function withDistances(mosques: Mosque[], from: Coords): Mosque[] {
  return mosques
    .map((m) => ({ ...m, distanceKm: haversineKm(from, { lat: m.lat, lng: m.lng }) }))
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
}

export async function findNearbyMosques(
  origin: Coords,
  radiusKm = 10,
  limit = 60,
): Promise<Mosque[]> {
  const key = cacheKey(origin, radiusKm);
  const cached = storage.get<{ fetchedAt: number; mosques: Mosque[] } | null>(key, null);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return withDistances(cached.mosques, origin).slice(0, limit);
  }

  const radiusMeters = Math.round(1000 * radiusKm);
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${origin.lat},${origin.lng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${origin.lat},${origin.lng});
      relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${origin.lat},${origin.lng});
    );
    out center ${limit};
  `.trim();

  let lastError: unknown;
  for (const endpoint of ENDPOINTS) {
    // Overpass mirrors queue rather than refuse when busy, so a request can sit
    // open for the full server-side timeout. Three of those in a row is over a
    // minute of a blank list, which is long enough that people leave the screen
    // before it ever answers. Give up on a slow mirror and try the next.
    const abort = new AbortController();
    const giveUp = setTimeout(() => abort.abort(), PER_ENDPOINT_TIMEOUT_MS);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        signal: abort.signal,
      });
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }
      const json = (await res.json()) as { elements?: OverpassElement[] };
      const mosques = (json.elements ?? []).map(toMosque).filter((m): m is Mosque => m !== null);
      storage.set(key, { fetchedAt: Date.now(), mosques });
      return withDistances(mosques, origin).slice(0, limit);
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(giveUp);
    }
  }
  throw lastError ?? new Error('All Overpass endpoints failed');
}

export function mosqueMapsUrl(m: Mosque): string {
  // `query` must be the coordinates alone. The `lat,lng(Label)` form is a geo:
  // URI convention, not a Maps one — Maps takes the whole string as free text,
  // searches for a place literally named "35.56,45.42(مزگەوتی نالی)", and
  // reports that it cannot find it. Which is exactly what it did.
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${m.lat},${m.lng}`)}`;
}

// Open Google Maps centered on the user with live "mosque" search results.
// This always works (no Overpass dependency) and deep-links to the Maps app on Android.
export function nearbyMosquesMapsUrl(c: Coords): string {
  return `https://www.google.com/maps/search/mosque/@${c.lat},${c.lng},15z`;
}
