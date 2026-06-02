package com.selati.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import androidx.core.content.ContextCompat;

/** Fired by AlarmManager at prayer time → starts the foreground adhan service. */
public class AdhanReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Intent svc = new Intent(context, AdhanService.class);
        if (intent != null) {
            svc.putExtra(AdhanScheduler.EXTRA_SOUND, intent.getStringExtra(AdhanScheduler.EXTRA_SOUND));
            svc.putExtra(AdhanScheduler.EXTRA_TITLE, intent.getStringExtra(AdhanScheduler.EXTRA_TITLE));
            svc.putExtra(AdhanScheduler.EXTRA_BODY, intent.getStringExtra(AdhanScheduler.EXTRA_BODY));
        }
        ContextCompat.startForegroundService(context, svc);
    }
}
