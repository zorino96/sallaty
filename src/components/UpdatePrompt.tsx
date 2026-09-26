'use client';

// Asks, on launch, for the store's newer version when there is one.
//
// Sallaty has no backend and no push service, so this is the only way it can
// tell someone their copy is out of date. It came out of the basmala fix: 112
// surahs showed the basmala twice, the fix shipped, and there was no way to
// reach the phones still carrying the old text except to wait for the stores'
// own auto-update. This does not reach those phones either — a build can only
// ask with code it has — but from the version that ships it onward, every
// correction reaches people the next time they open the app.
//
// It talks to the stores directly — Play's in-app update API on Android, the
// public App Store lookup on iOS — so it needs nothing of ours to run.
//
// It never blocks. This is a prayer-times app: someone offline, on metered data,
// or about to pray must still get the times. So the check fails silently with
// no network, and the prompt can be put off; it asks again on the next launch.

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useApp } from '@/lib/AppProvider';

// The App Store trackId, checked against the live lookup
// (itunes.apple.com/lookup?bundleId=com.selati.app → trackId 6801283208).
const IOS_APP_ID = '6801283208';

// Let the first screen paint before asking the store anything.
const START_DELAY_MS = 2500;
// A lookup that has not answered by now is not going to be useful this launch.
const TIMEOUT_MS = 8000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('timeout')), ms);
    p.then((v) => { clearTimeout(id); resolve(v); }, (e) => { clearTimeout(id); reject(e); });
  });
}

export default function UpdatePrompt() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [immediateAllowed, setImmediateAllowed] = useState(false);

  useEffect(() => {
    // The web build has nothing to update and no store to ask.
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const info = await withTimeout(AppUpdate.getAppUpdateInfo(), TIMEOUT_MS);
        if (cancelled) return;
        if (info.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
          setImmediateAllowed(Boolean(info.immediateUpdateAllowed));
          setOpen(true);
        }
      } catch {
        // Offline, a sideloaded build Play does not know, or a slow lookup.
        // None of these are the user's problem; try again next launch.
      }
    }, START_DELAY_MS);

    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const update = async (): Promise<void> => {
    setOpen(false);
    try {
      if (Capacitor.getPlatform() === 'android' && immediateAllowed) {
        // Play's own full-screen flow: downloads and installs in one step.
        await AppUpdate.performImmediateUpdate();
      } else {
        await AppUpdate.openAppStore(
          Capacitor.getPlatform() === 'ios' ? { appId: IOS_APP_ID } : undefined,
        );
      }
    } catch {
      // Cancelled from the store's own sheet, or the store would not open.
      // The prompt returns on the next launch.
    }
  };

  return (
    <ConfirmDialog
      open={open}
      title={t('updateTitle')}
      body={t('updateBody')}
      confirmLabel={t('updateNow')}
      cancelLabel={t('updateLater')}
      onConfirm={() => { void update(); }}
      onCancel={() => setOpen(false)}
    />
  );
}
