package com.selati.app;

import android.app.AlarmManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
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
            // Self-heal every few hours so OEM power managers can't quietly
            // drop the alarms, and show the next prayer in the shade.
            if (arr.length() > 0) {
                AdhanScheduler.armHeal(getContext());
                NextPrayerNotice.update(getContext());
            } else {
                AdhanScheduler.cancelHeal(getContext());
                NextPrayerNotice.clear(getContext());
            }
            call.resolve();
        } catch (JSONException e) {
            call.reject("bad items");
        }
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        AdhanScheduler.cancelAll(getContext(), true);
        AdhanScheduler.cancelHeal(getContext());
        NextPrayerNotice.clear(getContext());
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

    @PluginMethod
    public void isIgnoringBatteryOptimizations(PluginCall call) {
        boolean ok = true;
        if (Build.VERSION.SDK_INT >= 23) {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            ok = pm != null && pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
        }
        JSObject ret = new JSObject();
        ret.put("value", ok);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestBatteryExemption(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 23) {
            try {
                Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                        .setData(Uri.parse("package:" + getContext().getPackageName()))
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(i);
            } catch (Exception e) {
                try {
                    getContext().startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
                } catch (Exception ignored) {}
            }
        }
        call.resolve();
    }

    /**
     * Open the OEM "auto-start / auto-launch" whitelist screen. Aggressive
     * skins (MIUI/Xiaomi, ColorOS/Oppo, FuntouchOS/Vivo, EMUI/Huawei, etc.)
     * delay or drop exact alarms unless the app is on this list — this is the
     * usual cause of a prayer alarm firing several minutes late. Tries each
     * known component in turn, falling back to the app's details page.
     */
    @PluginMethod
    public void openAutoStartSettings(PluginCall call) {
        String[][] comps = {
                {"com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"},
                {"com.letv.android.letvsafe", "com.letv.android.letvsafe.AutobootManageActivity"},
                {"com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"},
                {"com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity"},
                {"com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"},
                {"com.coloros.safecenter", "com.coloros.safecenter.startupapp.StartupAppListActivity"},
                {"com.oppo.safe", "com.oppo.safe.permission.startup.StartupAppListActivity"},
                {"com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity"},
                {"com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"},
                {"com.samsung.android.lool", "com.samsung.android.sm.ui.battery.BatteryActivity"},
                {"com.oneplus.security", "com.oneplus.security.chainlaunch.view.ChainLaunchAppListActivity"},
        };
        Context ctx = getContext();
        for (String[] c : comps) {
            try {
                Intent i = new Intent();
                i.setComponent(new ComponentName(c[0], c[1]));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (i.resolveActivity(ctx.getPackageManager()) != null) {
                    ctx.startActivity(i);
                    call.resolve();
                    return;
                }
            } catch (Exception ignored) {}
        }
        // Fallback: the app's own details/settings page.
        try {
            Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                    .setData(Uri.parse("package:" + ctx.getPackageName()))
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(i);
        } catch (Exception ignored) {}
        call.resolve();
    }
}
