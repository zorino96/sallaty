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
 * The alarm screen. Launched by the alarm notification's full-screen intent, it
 * turns the screen on, shows over the lock screen like an alarm clock, plays
 * the full adhan ({@link AdhanSound}) and offers a "silence" button.
 *
 * Playing here — rather than in a foreground service — is what an alarm clock
 * does, and needs no foreground-service permission.
 */
public class AdhanAlarmActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        wakeAndShowOverLockscreen();
        setContentView(buildUi(titleOf(getIntent())));
        sound(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        setContentView(buildUi(titleOf(intent)));
        sound(intent);
    }

    /**
     * Adopt the adhan for this firing. The receiver has normally started it
     * already; the shared key makes this a no-op rather than a second, louder
     * adhan on top of the first.
     */
    private void sound(Intent intent) {
        String s = intent != null ? intent.getStringExtra(AdhanScheduler.EXTRA_SOUND) : "";
        String key = intent != null ? intent.getStringExtra(AdhanScheduler.EXTRA_KEY) : null;
        if (key == null) key = titleOf(intent);
        AdhanSound.start(this, s, key);
    }

    private static String titleOf(Intent intent) {
        String t = intent != null ? intent.getStringExtra(AdhanScheduler.EXTRA_TITLE) : null;
        return t != null ? t : "بانگی نوێژ";
    }

    private View buildUi(String title) {
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
                AdhanSound.stop();
                NotificationManagerCompat.from(AdhanAlarmActivity.this).cancel(AdhanReceiver.NOTIF_ID);
                finish();
            }
        });
        root.addView(stop);

        return root;
    }

    @Override
    protected void onDestroy() {
        // Dismissing the alarm screen silences the adhan, as on any alarm clock.
        AdhanSound.stop();
        super.onDestroy();
    }

    private void wakeAndShowOverLockscreen() {
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 27) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            if (km != null) km.requestDismissKeyguard(this, null);
        } else {
            getWindow().addFlags(
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                    | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                    | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
        }
    }
}
