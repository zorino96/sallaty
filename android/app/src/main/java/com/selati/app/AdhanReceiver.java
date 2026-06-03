package com.selati.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

/**
 * Fired by AlarmManager at prayer time. Wakes the CPU briefly, then starts
 * {@link AdhanService} as a foreground service to play the FULL adhan via
 * MediaPlayer and wake the screen over the lock screen (full-screen intent).
 *
 * Starting a foreground service from a receiver is permitted here because the
 * alarm was armed with {@code setAlarmClock} — Android grants a temporary
 * exemption when such an exact alarm fires, even on Android 14.
 *
 * If, on some device, the service start is rejected, we fall back to posting a
 * max-priority notification whose channel sound is the adhan on the ALARM
 * stream (posting a notification from a receiver is always allowed).
 */
public class AdhanReceiver extends BroadcastReceiver {
    static final int NOTIF_ID = 7777;

    @Override
    public void onReceive(Context context, Intent intent) {
        PowerManager.WakeLock wl = null;
        try {
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "sallaty:adhanfire");
                wl.acquire(60 * 1000L);
            }
        } catch (Exception ignored) {}

        String sound = intent != null ? intent.getStringExtra(AdhanScheduler.EXTRA_SOUND) : "";
        String title = intent != null ? intent.getStringExtra(AdhanScheduler.EXTRA_TITLE) : null;
        String body = intent != null ? intent.getStringExtra(AdhanScheduler.EXTRA_BODY) : null;
        if (title == null) title = "بانگی نوێژ";
        if (body == null) body = "";

        // Primary path: foreground service plays the full adhan.
        boolean started = false;
        try {
            Intent svc = new Intent(context, AdhanService.class)
                    .putExtra(AdhanScheduler.EXTRA_SOUND, sound)
                    .putExtra(AdhanScheduler.EXTRA_TITLE, title)
                    .putExtra(AdhanScheduler.EXTRA_BODY, body);
            ContextCompat.startForegroundService(context, svc);
            started = true;
        } catch (Exception ignored) {
            started = false;
        }

        // Fallback: sounding notification if the service couldn't be started.
        if (!started) {
            postSoundingNotification(context, sound, title, body);
        }

        try { if (wl != null && wl.isHeld()) wl.release(); } catch (Exception ignored) {}
    }

    /**
     * Fallback alarm: a max-priority notification whose channel sound is the
     * adhan on the ALARM stream (so it uses alarm volume, sounds in Doze, and
     * bypasses Do Not Disturb), with a full-screen intent to wake the screen.
     * Also called by {@link AdhanService} if it fails to enter foreground.
     */
    static void postSoundingNotification(Context context, String sound, String title, String body) {
        if (title == null) title = "بانگی نوێژ";
        if (body == null) body = "";

        String channelId = ensureSoundingChannel(context, sound);

        Intent full = new Intent(context, AdhanAlarmActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra(AdhanScheduler.EXTRA_TITLE, title);
        PendingIntent fullPi = PendingIntent.getActivity(context, 1, full, AdhanScheduler.piFlags());

        NotificationCompat.Builder b = new NotificationCompat.Builder(context, channelId)
                .setSmallIcon(smallIcon(context))
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true)
                .setFullScreenIntent(fullPi, true)
                .setContentIntent(fullPi);

        // Pre-O has no channels: attach the sound + alarm stream to the notification.
        if (Build.VERSION.SDK_INT < 26) {
            b.setSound(soundUri(context, sound), AudioManager.STREAM_ALARM);
            b.setDefaults(Notification.DEFAULT_VIBRATE);
        }

        try {
            NotificationManagerCompat.from(context).notify(NOTIF_ID, b.build());
        } catch (Exception ignored) {}
    }

    static Uri soundUri(Context ctx, String sound) {
        if (sound != null && sound.length() > 0) {
            int resId = ctx.getResources().getIdentifier(sound, "raw", ctx.getPackageName());
            if (resId != 0) return Uri.parse("android.resource://" + ctx.getPackageName() + "/" + resId);
        }
        return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
    }

    // One channel per adhan sound (the sound is fixed at channel creation time).
    private static String ensureSoundingChannel(Context ctx, String sound) {
        String id = "adhan_" + (sound == null || sound.isEmpty() ? "default" : sound) + "_v2";
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null && nm.getNotificationChannel(id) == null) {
                NotificationChannel ch = new NotificationChannel(id, "بانگی نوێژ", NotificationManager.IMPORTANCE_HIGH);
                ch.setDescription("Prayer-time adhan");
                AudioAttributes aa = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build();
                ch.setSound(soundUri(ctx, sound), aa);
                ch.enableVibration(true);
                ch.setBypassDnd(true);
                ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                nm.createNotificationChannel(ch);
            }
        }
        return id;
    }

    private static int smallIcon(Context ctx) {
        int s = ctx.getResources().getIdentifier("ic_stat_icon", "drawable", ctx.getPackageName());
        return s != 0 ? s : ctx.getApplicationInfo().icon;
    }
}
