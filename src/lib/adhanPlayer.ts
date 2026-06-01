// Audio singleton + pub/sub for the global "now playing" state.
// Real adhans play from bundled MP3s; "chime" alerts are synthesized live with
// WebAudio (zero files, zero copyright, zero noise).

import { adhanTracks, type AdhanTrack } from '@/data/adhanTracks';

type Listener = (currentId: string | null) => void;

const state = {
  currentId: null as string | null,
  audio: null as HTMLAudioElement | null,
  ctx: null as AudioContext | null,
  stopTimer: null as ReturnType<typeof setTimeout> | null,
  listeners: new Set<Listener>(),
};

function notify(): void {
  for (const l of state.listeners) l(state.currentId);
}

export function nowPlaying(): string | null {
  return state.currentId;
}

export function subscribePlayback(listener: Listener): () => void {
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (state.ctx) return state.ctx;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    state.ctx = new Ctor();
    return state.ctx;
  } catch {
    return null;
  }
}

// A single soft bell "ping": sine fundamental + quieter octave harmonic,
// fast attack, exponential decay. Pleasant and completely clean.
function ping(ctx: AudioContext, freq: number, startAt: number, duration: number, peak = 0.22): void {
  const fundamental = ctx.createOscillator();
  const harmonic = ctx.createOscillator();
  const gain = ctx.createGain();
  fundamental.type = 'sine';
  harmonic.type = 'sine';
  fundamental.frequency.value = freq;
  harmonic.frequency.value = freq * 2;
  const hGain = ctx.createGain();
  hGain.gain.value = 0.3; // harmonic is quieter

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  fundamental.connect(gain);
  harmonic.connect(hGain).connect(gain);
  gain.connect(ctx.destination);
  fundamental.start(startAt);
  harmonic.start(startAt);
  fundamental.stop(startAt + duration + 0.05);
  harmonic.stop(startAt + duration + 0.05);
}

// Note frequencies (Hz) for a warm pentatonic feel.
const N = { E5: 659.25, A5: 880.0, C6: 1046.5, D6: 1174.7, G5: 783.99, B5: 987.77 };

// Each chime id maps to a short melodic phrase. Returns total duration (s).
function playChime(id: string): number {
  const ctx = getCtx();
  if (!ctx) return 0;
  void ctx.resume?.();
  const t = ctx.currentTime + 0.02;

  switch (id) {
    case 'chime-warm': {
      // Warm rising triad, gentle and rounded.
      ping(ctx, N.E5, t,        1.1, 0.20);
      ping(ctx, N.G5, t + 0.18, 1.1, 0.20);
      ping(ctx, N.B5, t + 0.36, 1.4, 0.22);
      return 1.9;
    }
    case 'chime-bell': {
      // Two clear bell strikes a fifth apart.
      ping(ctx, N.A5, t,        1.6, 0.26);
      ping(ctx, N.E5, t + 0.5,  1.6, 0.22);
      return 2.2;
    }
    case 'chime-rise': {
      // Ascending four-note run.
      ping(ctx, N.E5, t,        0.5, 0.18);
      ping(ctx, N.G5, t + 0.16, 0.5, 0.18);
      ping(ctx, N.A5, t + 0.32, 0.5, 0.18);
      ping(ctx, N.C6, t + 0.48, 1.2, 0.22);
      return 1.8;
    }
    case 'chime-soft':
    default: {
      // Gentle two-note call: E → A.
      ping(ctx, N.E5, t,        0.9, 0.18);
      ping(ctx, N.A5, t + 0.28, 1.3, 0.20);
      return 1.7;
    }
  }
}

export function playAdhan(id: string): void {
  const track = adhanTracks.find((t: AdhanTrack) => t.id === id);
  if (!track || typeof window === 'undefined') return;

  // Tear down any current playback.
  stopAdhan();

  if (track.file) {
    const a = new Audio(track.file);
    a.preload = 'auto';
    a.addEventListener('ended', () => stopAdhan());
    a.addEventListener('error', () => stopAdhan());
    void a.play().catch(() => stopAdhan());
    state.audio = a;
    state.currentId = id;
    notify();
    return;
  }

  // Synthesized chime.
  const dur = playChime(id);
  if (dur <= 0) return;
  state.currentId = id;
  notify();
  state.stopTimer = setTimeout(() => stopAdhan(), dur * 1000 + 200);
}

export function stopAdhan(): void {
  if (state.audio) {
    state.audio.pause();
    state.audio.currentTime = 0;
    state.audio = null;
  }
  if (state.stopTimer) {
    clearTimeout(state.stopTimer);
    state.stopTimer = null;
  }
  state.currentId = null;
  notify();
}
