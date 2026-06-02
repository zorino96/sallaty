package com.selati.app;

import android.app.AlarmManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONException;

/** JS bridge to the native exact-alarm adhan pipeline. */
@CapacitorPlugin(name = "AdhanAlarm")
public class AdhanAlarmPlugin extends Plugin {

    @PluginMethod
    public void schedule(PluginCall call) {
        JSArray items = call.getArray("items");
        try {
            JSONArray arr = items != null ? new JSONArray(items.toString()) : new JSONArray();
            AdhanScheduler.scheduleAll(getContext(), arr, true);
            call.resolve();
        } catch (JSONException e) {
            call.reject("bad items");
        }
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        AdhanScheduler.cancelAll(getContext(), true);
        call.resolve();
    }

    /** Arm a single alarm N seconds out so the user can lock the screen and verify. */
    @PluginMethod
    public void scheduleTest(PluginCall call) {
        int seconds = call.getInt("seconds", 10);
        String sound = call.getString("sound", "");
        String title = call.getString("title", "بانگی نوێژ");
        String body = call.getString("body", "");
        AdhanScheduler.scheduleSingle(getContext(), 999,
                System.currentTimeMillis() + (long) seconds * 1000L, sound, title, body);
        call.resolve();
    }

    @PluginMethod
    public void canScheduleExact(PluginCall call) {
        boolean ok = true;
        if (Build.VERSION.SDK_INT >= 31) {
            AlarmManager am = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
            ok = am != null && am.canScheduleExactAlarms();
        }
        JSObject ret = new JSObject();
        ret.put("value", ok);
        call.resolve(ret);
    }

    @PluginMethod
    public void openExactAlarmSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 31) {
            try {
                Intent i = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                        .setData(Uri.parse("package:" + getContext().getPackageName()))
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(i);
            } catch (Exception ignored) {}
        }
        call.resolve();
    }
}
