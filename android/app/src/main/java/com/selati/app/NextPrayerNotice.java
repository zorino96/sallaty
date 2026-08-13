package com.selati.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * The quiet, always-there "next prayer" notification.
 *
 * It is a plain low-importance notification, not a foreground service: it only
 * tells the user the alarms are armed and when the next one is. It is refreshed
 * whenever the schedule changes, when an adhan fires, and on the periodic
 * self-heal — often enough to stay accurate, cheap enough to cost no battery.
 */
final class NextPrayerNotice {
    static final int NOTIF_ID = 7778;
    private static final String CH = "adhan_next_v2";

    private NextPrayerNotice() {}

    /** Post/refresh the notice, or clear it when nothing is scheduled. */
    static void update(Context ctx) {
        String text = nextPrayerText(ctx);
        if (text == null) { clear(ctx); return; }

        ensureChannel(ctx);
        PendingIntent pi = PendingIntent.getActivity(ctx, 0,
                new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                AdhanScheduler.piFlags());

        Notification n = new NotificationCompat.Builder(ctx, CH)
                .setSmallIcon(smallIcon(ctx))
                .setContentTitle("سەڵاتی")
                .setContentText(text)
                .setOngoing(true)
                .setSilent(true)
                .setShowWhen(false)
                .setPriority(NotificationCompat.PRIORITY_MIN)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(pi)
                .build();

        try { NotificationManagerCompat.from(ctx).notify(NOTIF_ID, n); } catch (Exception ignored) {}
    }

    static void clear(Context ctx) {
        try { NotificationManagerCompat.from(ctx).cancel(NOTIF_ID); } catch (Exception ignored) {}
    }

    /** "نوێژی داهاتوو: مەغریب · 19:12", or null when no future alarm is stored. */
    private static String nextPrayerText(Context ctx) {
        try {
            String stored = ctx.getSharedPreferences(AdhanScheduler.PREFS, Context.MODE_PRIVATE)
                    .getString(AdhanScheduler.KEY_ITEMS, null);
            if (stored == null) return null;
            JSONArray arr = new JSONArray(stored);
            long now = System.currentTimeMillis();
            long bestAt = Long.MAX_VALUE;
            String bestName = null;
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.optJSONObject(i);
                if (o == null) continue;
                long at = o.optLong("at", 0L);
                if (at > now && at < bestAt) { bestAt = at; bestName = o.optString("body", ""); }
            }
            if (bestAt == Long.MAX_VALUE) return null;
            String hhmm = new SimpleDateFormat("HH:mm", Locale.US).format(new Date(bestAt));
            return "نوێژی داهاتوو: " + (bestName != null && bestName.length() > 0 ? bestName + " · " : "") + hhmm;
        } catch (Exception e) {
            return null;
        }
    }

    private static void ensureChannel(Context ctx) {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null && nm.getNotificationChannel(CH) == null) {
                NotificationChannel ch = new NotificationChannel(CH, "نوێژی داهاتوو", NotificationManager.IMPORTANCE_MIN);
                ch.setDescription("Shows the next prayer time");
                ch.setShowBadge(false);
                ch.setSound(null, null);
                nm.createNotificationChannel(ch);
            }
        }
    }

    private static int smallIcon(Context ctx) {
        int s = ctx.getResources().getIdentifier("ic_stat_icon", "drawable", ctx.getPackageName());
        return s != 0 ? s : ctx.getApplicationInfo().icon;
    }
}
