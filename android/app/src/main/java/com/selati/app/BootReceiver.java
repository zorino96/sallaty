package com.selati.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Re-arms the persisted prayer alarms after a reboot / time change / app update. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        AdhanScheduler.rescheduleFromStore(context);
        if (AdhanScheduler.hasStoredSchedule(context)) {
            AdhanScheduler.armHeal(context);
            NextPrayerNotice.update(context);
        }
    }
}
