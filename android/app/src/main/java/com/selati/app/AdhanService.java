package com.selati.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
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
 * Foreground service that plays the full adhan at prayer time. Holds a wake
 * lock so the CPU stays awake, posts a full-screen-intent notification (which
 * launches {@link AdhanAlarmActivity} to turn the screen on over the lock
 * screen), and plays the selected adhan via MediaPlayer on the ALARM stream.
 */
public class AdhanService extends Service {
    static final String CHANNEL = "adhan_fire_v1";
    static final int NOTIF_ID = 7777;
    static final String ACTION_STOP = "com.selati.app.ADHAN_STOP";

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
        String body = intent != null ? intent.getStringExtra(AdhanScheduler.EXTRA_BODY) : null;
        if (title == null) title = "بانگی نوێژ";
        if (body == null) body = "";

        try {
            startForeground(NOTIF_ID, buildNotification(title, body));
        } catch (Exception e) {
            stopSelf();
            return START_NOT_STICKY;
        }
        acquireWake();
        playAdhan(sound);
        return START_NOT_STICKY;
    }

    private void acquireWake() {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "sallaty:adhan");
                wakeLock.setReferenceCounted(false);
                wakeLock.acquire(5 * 60 * 1000L);
            }
        } catch (Exception ignored) {}
    }

    private Uri soundUri(String sound) {
        if (sound != null && sound.length() > 0) {
            int resId = getResources().getIdentifier(sound, "raw", getPackageName());
            if (resId != 0) {
                return Uri.parse("android.resource://" + getPackageName() + "/" + resId);
            }
        }
        return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
    }

    private void playAdhan(String sound) {
        try {
            player = new MediaPlayer();
            player.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build());
            player.setDataSource(this, soundUri(sound));
            player.setOnCompletionListener(mp -> stopEverything());
            player.setOnErrorListener((mp, what, extra) -> { stopEverything(); return true; });
            player.prepare();
            player.start();
        } catch (Exception e) {
            stopEverything();
        }
    }

    private void stopEverything() {
        try { if (player != null) { player.stop(); player.release(); player = null; } } catch (Exception ignored) {}
        try { if (wakeLock != null && wakeLock.isHeld()) wakeLock.release(); } catch (Exception ignored) {}
        try { stopForeground(true); } catch (Exception ignored) {}
        stopSelf();
    }

    private Notification buildNotification(String title, String body) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm != null) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "بانگی نوێژ", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("Prayer-time adhan");
            ch.setSound(null, null); // the service plays the audio itself
            ch.enableVibration(true);
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(ch);
        }

        Intent full = new Intent(this, AdhanAlarmActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra(AdhanScheduler.EXTRA_TITLE, title)
                .putExtra(AdhanScheduler.EXTRA_BODY, body);
        PendingIntent fullPi = PendingIntent.getActivity(this, 1, full, AdhanScheduler.piFlags());

        Intent stop = new Intent(this, AdhanService.class).setAction(ACTION_STOP);
        PendingIntent stopPi = PendingIntent.getService(this, 2, stop, AdhanScheduler.piFlags());

        int smallIcon = getResources().getIdentifier("ic_stat_icon", "drawable", getPackageName());
        if (smallIcon == 0) smallIcon = getApplicationInfo().icon;

        return new NotificationCompat.Builder(this, CHANNEL)
                .setSmallIcon(smallIcon)
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setOngoing(true)
                .setAutoCancel(false)
                .setFullScreenIntent(fullPi, true)
                .setContentIntent(fullPi)
                .addAction(0, "بێدەنگکردن", stopPi)
                .build();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onDestroy() {
        stopEverything();
        super.onDestroy();
    }
}
