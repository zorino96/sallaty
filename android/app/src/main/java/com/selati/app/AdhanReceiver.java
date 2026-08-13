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
import android.os.Build;
import android.os.PowerManager;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

/**
 * Fired by AlarmManager at prayer time (and periodically for the self-heal).
 *
 * The adhan starts here, immediately, through {@link AdhanSound}; then we bring
 * up {@link AdhanAlarmActivity}, which shows over the lock screen and keeps the
 * process alive for the two or three minutes the adhan lasts. Both use the same
 * playback key, so whichever arrives second adopts what is already sounding
 * rather than starting a second, overlapping adhan.
 *
 * Sounding it here instead of leaving it to the activity's full-screen intent
 * matters: a full-screen intent that arrives while the phone is unlocked and in
 * use is shown as an ordinary heads-up notification and does NOT launch the
 * activity — the adhan would stay silent exactly when the user is holding the
 * phone. No foreground service is involved either way.
 *
 * If MediaPlayer itself fails, we fall back to a notification whose channel
 * sound is the adhan on the ALARM stream — always allowed from a receiver.
 */
public class AdhanReceiver extends BroadcastReceiver {
    static final int NOTIF_ID = 7777;

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent != null ? intent.getAction() : null;

        // Periodic self-heal: re-arm the stored schedule in case the OS dropped
        // it, refresh the notice, and set the next heal.
        if (AdhanScheduler.ACTION_HEAL.equals(action)) {
            AdhanScheduler.rescheduleFromStore(context);
            NextPrayerNotice.update(context);
            AdhanScheduler.armHeal(context);
            return;
        }

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

        // One id for this firing, shared with the alarm screen.
        String key = title + "@" + (System.currentTimeMillis() / 60000L);

        if (AdhanSound.start(context, sound, key)) {
            PendingIntent pi = alarmActivityIntent(context, sound, title, key);
            // Best effort: bring the alarm screen up ourselves (works while the
            // device is in use). When it's locked, the full-screen intent below
            // is what launches it.
            try {
                context.startActivity(alarmActivityBase(context, sound, title, key));
            } catch (Exception ignored) {}
            postSilentAlarmNotification(context, title, body, pi);
        } else {
            postSoundingNotification(context, sound, title, body);
        }

        // Each firing is also a free chance to re-arm the rest of the schedule.
        AdhanScheduler.rescheduleFromStore(context);
        NextPrayerNotice.update(context);

        try { if (wl != null && wl.isHeld()) wl.release(); } catch (Exception ignored) {}
    }

    /**
     * The alarm notification. Silent — {@link AdhanSound} already owns the
     * audio — and carrying the full-screen intent that shows the alarm screen
     * over the lock screen.
     */
    private static void postSilentAlarmNotification(Context context, String title, String body, PendingIntent pi) {
        NotificationCompat.Builder b = new NotificationCompat.Builder(context, ensureSilentChannel(context))
                .setSmallIcon(smallIcon(context))
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true)
                .setSilent(true)
                .setContentIntent(pi);

        if (canUseFullScreenIntent(context)) b.setFullScreenIntent(pi, true);

        try {
            NotificationManagerCompat.from(context).notify(NOTIF_ID, b.build());
        } catch (Exception ignored) {}
    }

    /**
     * Fallback alarm: a max-priority notification whose channel sound is the
     * adhan on the ALARM stream (alarm volume, sounds in Doze, bypasses Do Not
     * Disturb). Used only if MediaPlayer could not start.
     */
    static void postSoundingNotification(Context context, String sound, String title, String body) {
        if (title == null) title = "بانگی نوێژ";
        if (body == null) body = "";

        String channelId = ensureSoundingChannel(context, sound);
        PendingIntent pi = alarmActivityIntent(context, sound, title, title + "@fallback");

        NotificationCompat.Builder b = new NotificationCompat.Builder(context, channelId)
                .setSmallIcon(smallIcon(context))
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true)
                .setContentIntent(pi);

        // Pre-O has no channels: attach the sound + alarm stream to the notification.
        if (Build.VERSION.SDK_INT < 26) {
            b.setSound(AdhanSound.uri(context, sound), AudioManager.STREAM_ALARM);
            b.setDefaults(Notification.DEFAULT_VIBRATE);
        }

        try {
            NotificationManagerCompat.from(context).notify(NOTIF_ID, b.build());
        } catch (Exception ignored) {}
    }

    private static Intent alarmActivityBase(Context ctx, String sound, String title, String key) {
        return new Intent(ctx, AdhanAlarmActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra(AdhanScheduler.EXTRA_TITLE, title)
                .putExtra(AdhanScheduler.EXTRA_SOUND, sound)
                .putExtra(AdhanScheduler.EXTRA_KEY, key);
    }

    private static PendingIntent alarmActivityIntent(Context ctx, String sound, String title, String key) {
        return PendingIntent.getActivity(ctx, 1, alarmActivityBase(ctx, sound, title, key),
                AdhanScheduler.piFlags());
    }

    /** Android 14+ may withhold USE_FULL_SCREEN_INTENT; below that it is implicit. */
    private static boolean canUseFullScreenIntent(Context ctx) {
        if (Build.VERSION.SDK_INT < 34) return true;
        try {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            return nm == null || nm.canUseFullScreenIntent();
        } catch (Exception e) {
            return false;
        }
    }

    // Silent, max-importance channel: AdhanSound owns the audio.
    private static String ensureSilentChannel(Context ctx) {
        String id = "adhan_alarm_v3";
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null && nm.getNotificationChannel(id) == null) {
                NotificationChannel ch = new NotificationChannel(id, "بانگی نوێژ", NotificationManager.IMPORTANCE_HIGH);
                ch.setDescription("Prayer-time adhan");
                ch.setSound(null, null);
                ch.enableVibration(true);
                ch.setBypassDnd(true);
                ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                nm.createNotificationChannel(ch);
            }
        }
        return id;
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
                ch.setSound(AdhanSound.uri(ctx, sound), aa);
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
