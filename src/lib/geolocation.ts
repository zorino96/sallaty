import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import type { Coords } from './types';

// Result of a permission request: 'granted' | 'denied'.
export type GeoPermission = 'granted' | 'denied';

export async function requestGeoPermission(): Promise<GeoPermission> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await Geolocation.requestPermissions({ permissions: ['location'] });
      return status.location === 'granted' || status.coarseLocation === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }
  // Web/PWA: the browser prompts on first getCurrentPosition call, so we
  // optimistically report 'granted' and let the actual fetch surface a denial.
  return 'granted';
}

export async function getCurrentCoords(timeoutMs = 10_000): Promise<Coords | null> {
  // Native: use the Capacitor Geolocation plugin (handles the runtime prompt).
  if (Capacitor.isNativePlatform()) {
    try {
      const perm = await requestGeoPermission();
      if (perm !== 'granted') return null;
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0,
      });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      return null;
    }
  }
  // Web fallback.
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null;
  return new Promise<Coords | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 30 * 60 * 1000 },
    );
  });
}

export async function reverseGeocode(coords: Coords, lang: 'ku' | 'ar' = 'ar'): Promise<string | undefined> {
  const url =
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}` +
    `&longitude=${coords.lng}&localityLanguage=${lang === 'ku' ? 'ar' : 'ar'}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6_000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return undefined;
    const json = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    };
    return json.city || json.locality || json.principalSubdivision || json.countryName;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

// Great-circle bearing from `from` to Kaaba (Mecca).
const KAABA = { lat: 21.4225, lng: 39.8262 };

export function qiblaBearing(from: Coords): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(from.lat);
  const φ2 = toRad(KAABA.lat);
  const Δλ = toRad(KAABA.lng - from.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function distanceToMeccaKm(from: Coords): number {
  return haversineKm(from, KAABA);
}
