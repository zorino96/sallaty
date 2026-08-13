package com.selati.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Schedules exact, Doze-exempt prayer alarms via AlarmManager.setAlarmClock.
 * Each alarm broadcasts to {@link AdhanReceiver}, which wakes the screen with
 * {@link AdhanAlarmActivity} and plays the adhan. The schedule is persisted so
 * {@link BootReceiver} can re-arm it after a reboot.
 *
 * A low-frequency "heal" alarm re-arms the whole schedule every few hours, so
 * that devices whose power manager quietly drops alarms recover on their own.
 */
public final class AdhanScheduler {
    static final String PREFS = "SallatyAdhan";
    static final String KEY_ITEMS = "items";
    static final String ACTION_FIRE = "com.selati.app.ADHAN_FIRE";
    static final String ACTION_HEAL = "com.selati.app.ADHAN_HEAL";
    static final String EXTRA_SOUND = "sound";
    static final String EXTRA_TITLE = "title";
    static final String EXTRA_BODY = "body";
    static final String EXTRA_ID = "id";
    /** Identifies one firing, so the receiver and the alarm screen share a playback. */
    static final String EXTRA_KEY = "key";

    /** How often the schedule re-arms itself. Cheap: one wake-up, no CPU. */
    private static final long HEAL_INTERVAL_MS = 3 * 60 * 60 * 1000L;

    private AdhanScheduler() {}

    static int piFlags() {
        int f = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) f |= PendingIntent.FLAG_IMMUTABLE;
        return f;
    }

    private static PendingIntent operation(Context ctx, int id, String sound, String title, String body) {
        Intent i = new Intent(ctx, AdhanReceiver.class).setAction(ACTION_FIRE);
        i.putExtra(EXTRA_ID, id);
        i.putExtra(EXTRA_SOUND, sound);
        i.putExtra(EXTRA_TITLE, title);
        i.putExtra(EXTRA_BODY, body);
        return PendingIntent.getBroadcast(ctx, 7000 + id, i, piFlags());
    }

    /** Arm a single exact alarm without touching any others. */
    public static void scheduleSingle(Context ctx, int id, long at, String sound, String title, String body) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        PendingIntent op = operation(ctx, id, sound, title, body);
        PendingIntent show = PendingIntent.getActivity(ctx, 8000 + id,
                new Intent(ctx, MainActivity.class), piFlags());
        try {
            am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, show), op);
        } catch (SecurityException | IllegalStateException e) {
            try { am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, op); }
            catch (Exception ignored) { am.set(AlarmManager.RTC_WAKEUP, at, op); }
        }
    }

    public static void scheduleAll(Context ctx, JSONArray items, boolean persist) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        cancelAll(ctx, false); // clear any previously-armed alarms first
        long now = System.currentTimeMillis();
        for (int k = 0; k < items.length(); k++) {
            JSONObject o = items.optJSONObject(k);
            if (o == null) continue;
            long at = o.optLong("at", 0L);
            if (at <= now + 1000L) continue;
            int id = o.optInt("id", k);
            String sound = o.optString("sound", "");
            String title = o.optString("title", "بانگی نوێژ");
            String body = o.optString("body", "");
            scheduleSingle(ctx, id, at, sound, title, body);
        }
        if (persist) {
            ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
               .edit().putString(KEY_ITEMS, items.toString()).apply();
        }
    }

    public static void cancelAll(Context ctx, boolean clearStore) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        SharedPreferences sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        try {
            JSONArray arr = new JSONArray(sp.getString(KEY_ITEMS, "[]"));
            for (int k = 0; k < arr.length(); k++) {
                JSONObject o = arr.optJSONObject(k);
                if (o == null) continue;
                int id = o.optInt("id", k);
                if (am != null) am.cancel(operation(ctx, id, "", "", ""));
            }
        } catch (JSONException ignored) {}
        if (clearStore) sp.edit().remove(KEY_ITEMS).apply();
    }

    public static void rescheduleFromStore(Context ctx) {
        String stored = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_ITEMS, null);
        if (stored == null) return;
        try { scheduleAll(ctx, new JSONArray(stored), false); } catch (JSONException ignored) {}
    }

    /** Whether a non-empty schedule is currently persisted. */
    public static boolean hasStoredSchedule(Context ctx) {
        try {
            String stored = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_ITEMS, null);
            return stored != null && new JSONArray(stored).length() > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private static PendingIntent healOperation(Context ctx) {
        Intent i = new Intent(ctx, AdhanReceiver.class).setAction(ACTION_HEAL);
        return PendingIntent.getBroadcast(ctx, 6999, i, piFlags());
    }

    /**
     * Arm the next self-heal. Uses {@code setAndAllowWhileIdle} so it still
     * fires in Doze, which is exactly when an OEM would have dropped alarms.
     */
    public static void armHeal(Context ctx) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        long at = System.currentTimeMillis() + HEAL_INTERVAL_MS;
        try {
            if (Build.VERSION.SDK_INT >= 23) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, healOperation(ctx));
            } else {
                am.set(AlarmManager.RTC_WAKEUP, at, healOperation(ctx));
            }
        } catch (Exception ignored) {}
    }

    public static void cancelHeal(Context ctx) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am != null) {
            try { am.cancel(healOperation(ctx)); } catch (Exception ignored) {}
        }
    }
}
