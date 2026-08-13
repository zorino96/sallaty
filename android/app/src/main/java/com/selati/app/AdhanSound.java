package com.selati.app;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.PowerManager;

/**
 * Owns the single MediaPlayer that sounds the adhan, on the ALARM stream so it
 * uses alarm volume and is heard even in Doze / Do Not Disturb.
 *
 * Playback lives here — not in a service — because {@link AdhanAlarmActivity}
 * is what the alarm brings to the front (the standard alarm-clock pattern), and
 * an activity in the foreground may play audio without any foreground service.
 * Keeping the player static makes a second delivery of the same alarm (e.g. the
 * full-screen intent landing after the activity already started) a no-op
 * instead of a second, overlapping adhan.
 */
final class AdhanSound {
    private static MediaPlayer player;
    private static PowerManager.WakeLock wakeLock;
    private static String currentKey;

    private AdhanSound() {}

    /**
     * Start the adhan for {@code key} — an id unique to one firing, so that the
     * receiver and the alarm screen it launches don't each start their own,
     * overlapping playback. Returns true if the adhan is sounding.
     */
    static synchronized boolean start(Context ctx, String sound, String key) {
        if (player != null) {
            if (key != null && key.equals(currentKey)) return true; // already sounding
            stop();
        }
        acquireWakeLock(ctx);
        try {
            MediaPlayer mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build());
            mp.setDataSource(ctx.getApplicationContext(), uri(ctx, sound));
            mp.setLooping(false);
            mp.setOnCompletionListener(p -> stop());
            mp.setOnErrorListener((p, what, extra) -> { stop(); return true; });
            mp.prepare();
            mp.start();
            player = mp;
            currentKey = key;
            return true;
        } catch (Exception e) {
            stop();
            return false;
        }
    }

    static synchronized boolean isPlaying() {
        return player != null;
    }

    static synchronized void stop() {
        if (player != null) {
            try { if (player.isPlaying()) player.stop(); } catch (Exception ignored) {}
            try { player.release(); } catch (Exception ignored) {}
            player = null;
        }
        currentKey = null;
        try { if (wakeLock != null && wakeLock.isHeld()) wakeLock.release(); } catch (Exception ignored) {}
        wakeLock = null;
    }

    /** Resolve a res/raw name to a URI, falling back to the system alarm tone. */
    static Uri uri(Context ctx, String sound) {
        if (sound != null && sound.length() > 0) {
            int resId = ctx.getResources().getIdentifier(sound, "raw", ctx.getPackageName());
            if (resId != 0) return Uri.parse("android.resource://" + ctx.getPackageName() + "/" + resId);
        }
        return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
    }

    private static void acquireWakeLock(Context ctx) {
        try {
            PowerManager pm = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "sallaty:adhan");
                wakeLock.acquire(6 * 60 * 1000L); // safety cap; released on completion
            }
        } catch (Exception ignored) {}
    }
}
