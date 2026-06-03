package com.selati.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

/**
 * Foreground service that plays the FULL adhan (2–3 min) via MediaPlayer on the
 * ALARM stream, so it sounds at full length even when the screen is off / the
 * device is in Doze. Started by {@link AdhanReceiver} when an exact alarm fires
 * — which is permitted from a {@code setAlarmClock} alarm even on Android 14.
 *
 * A notification-channel sound (the old approach) is unreliable because OEMs
 * truncate channel sounds to a few seconds; MediaPlayer guarantees the whole
 * adhan plays. Its foreground notification is silent (the service owns the
 * audio) and carries a full-screen intent that wakes the screen over the lock
 * screen, like an alarm clock.
 */
public class AdhanService extends Service {
    static final String ACTION_STOP = "com.selati.app.ADHAN_STOP";
    static final int NOTIF_ID = 7777;
    private static final String CHANNEL_ID = "adhan_play_v3";

    private MediaPlayer player;
    private PowerManager.WakeLock wakeLock;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopEverything();
            return START_NOT_STICKY;
        }

        String sound = intent != null ? intent.getStringExtra(AdhanScheduler.EXTRA_SOUND) : "";
        String title = intent != null ? intent.getStringExtra(AdhanScheduler.EXTRA_TITLE) : null;
        if (title == null) title = "بانگی نوێژ";
        String body = intent != null ? intent.getStringExtra(AdhanScheduler.EXTRA_BODY) : "";

        // Must become foreground within ~5s of being started.
        Notification n = buildNotification(title, body);
        try {
            if (Build.VERSION.SDK_INT >= 29) {
                startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(NOTIF_ID, n);
            }
        } catch (Exception e) {
            // FGS start was rejected (rare). Fall back to a sounding notification
            // (always allowed) so the adhan still sounds, then bail out.
            AdhanReceiver.postSoundingNotification(this, sound, title, body);
            stopSelf();
            return START_NOT_STICKY;
        }

        acquireWakeLock();
        startPlayback(sound);
        return START_NOT_STICKY;
    }

    private void startPlayback(String sound) {
        try {
            releasePlayer();
            player = new MediaPlayer();
            player.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build());
            player.setDataSource(this, soundUri(sound));
            player.setLooping(false);
            player.setOnCompletionListener(mp -> stopEverything());
            player.setOnErrorListener((mp, what, extra) -> { stopEverything(); return true; });
            player.prepare();
            player.start();
        } catch (Exception e) {
            stopEverything();
        }
    }

    private Uri soundUri(String sound) {
        if (sound != null && sound.length() > 0) {
            int resId = getResources().getIdentifier(sound, "raw", getPackageName());
            if (resId != 0) return Uri.parse("android.resource://" + getPackageName() + "/" + resId);
        }
        return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
    }

    private Notification buildNotification(String title, String body) {
        ensureChannel();

        Intent full = new Intent(this, AdhanAlarmActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra(AdhanScheduler.EXTRA_TITLE, title);
        PendingIntent fullPi = PendingIntent.getActivity(this, 1, full, AdhanScheduler.piFlags());

        Intent stop = new Intent(this, AdhanService.class).setAction(ACTION_STOP);
        PendingIntent stopPi = PendingIntent.getService(this, 2, stop, AdhanScheduler.piFlags());

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(smallIcon())
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(true)
                .setAutoCancel(false)
                .setFullScreenIntent(fullPi, true)
                .setContentIntent(fullPi)
                .addAction(0, "بێدەنگکردن", stopPi)
                .build();
    }

    // Silent channel: the service plays the audio itself, so the notification
    // must not also sound (which would double the adhan).
    private void ensureChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm != null && nm.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel ch = new NotificationChannel(
                        CHANNEL_ID, "بانگی نوێژ", NotificationManager.IMPORTANCE_HIGH);
                ch.setDescription("Prayer-time adhan playback");
                ch.setSound(null, null);
                ch.enableVibration(true);
                ch.setBypassDnd(true);
                ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                nm.createNotificationChannel(ch);
            }
        }
    }

    private int smallIcon() {
        int s = getResources().getIdentifier("ic_stat_icon", "drawable", getPackageName());
        return s != 0 ? s : getApplicationInfo().icon;
    }

    private void acquireWakeLock() {
        try {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "sallaty:adhanplay");
                wakeLock.acquire(5 * 60 * 1000L); // safety cap; released on completion
            }
        } catch (Exception ignored) {}
    }

    private void releasePlayer() {
        if (player != null) {
            try { if (player.isPlaying()) player.stop(); } catch (Exception ignored) {}
            try { player.release(); } catch (Exception ignored) {}
            player = null;
        }
    }

    private void stopEverything() {
        releasePlayer();
        try { if (wakeLock != null && wakeLock.isHeld()) wakeLock.release(); } catch (Exception ignored) {}
        wakeLock = null;
        try {
            if (Build.VERSION.SDK_INT >= 24) stopForeground(Service.STOP_FOREGROUND_REMOVE);
            else stopForeground(true);
        } catch (Exception ignored) {}
        stopSelf();
    }

    @Override
    public void onDestroy() {
        releasePlayer();
        try { if (wakeLock != null && wakeLock.isHeld()) wakeLock.release(); } catch (Exception ignored) {}
        wakeLock = null;
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) { return null; }
}
