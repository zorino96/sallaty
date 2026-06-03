package com.selati.app;

import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NotificationManagerCompat;

/**
 * Launched via the service's full-screen intent. Turns the screen on and shows
 * over the lock screen (like an alarm clock), displaying the prayer name with a
 * "silence" button that stops the adhan service.
 */
public class AdhanAlarmActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        wakeAndShowOverLockscreen();

        String title = getIntent() != null ? getIntent().getStringExtra(AdhanScheduler.EXTRA_TITLE) : null;
        if (title == null) title = "بانگی نوێژ";

        float d = getResources().getDisplayMetrics().density;
        int pad = (int) (24 * d);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setBackgroundColor(0xFF0A1330);
        root.setPadding(pad, pad, pad, pad);

        TextView t = new TextView(this);
        t.setText("🕌  " + title);
        t.setTextColor(0xFFE7C77B);
        t.setTextSize(30);
        t.setGravity(Gravity.CENTER);
        root.addView(t);

        TextView sub = new TextView(this);
        sub.setText("سەڵاتی");
        sub.setTextColor(0xFFF4ECD8);
        sub.setTextSize(16);
        sub.setGravity(Gravity.CENTER);
        sub.setPadding(0, pad / 2, 0, pad);
        root.addView(sub);

        Button stop = new Button(this);
        stop.setText("بێدەنگکردن");
        stop.setTextColor(Color.parseColor("#0A1330"));
        stop.setBackgroundColor(0xFFE0BC63);
        stop.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                // Stop the playing adhan service (it owns the MediaPlayer)…
                try {
                    startService(new Intent(AdhanAlarmActivity.this, AdhanService.class)
                            .setAction(AdhanService.ACTION_STOP));
                } catch (Exception ignored) {}
                // …and clear any fallback sounding notification.
                NotificationManagerCompat.from(AdhanAlarmActivity.this).cancel(AdhanReceiver.NOTIF_ID);
                finish();
            }
        });
        root.addView(stop);

        setContentView(root);
    }

    private void wakeAndShowOverLockscreen() {
        if (Build.VERSION.SDK_INT >= 27) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            if (km != null) km.requestDismissKeyguard(this, null);
        } else {
            getWindow().addFlags(
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                    | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                    | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                    | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
        }
    }
}
