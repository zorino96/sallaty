// Bridge to the native exact-alarm adhan pipeline (Android). On web these are
// no-ops (the registerPlugin web shim simply rejects/does nothing).

import { registerPlugin } from '@capacitor/core';

export type AdhanAlarmItem = {
  id: number;
  at: number;       // epoch ms
  title: string;
  body: string;
  sound: string;    // res/raw base name e.g. "adhan_aqib" ("" → default alarm)
};

export interface AdhanAlarmPlugin {
  schedule(options: { items: AdhanAlarmItem[] }): Promise<void>;
  cancelAll(): Promise<void>;
  scheduleTest(options: { seconds?: number; sound?: string; title?: string; body?: string }): Promise<void>;
  canScheduleExact(): Promise<{ value: boolean }>;
  openExactAlarmSettings(): Promise<void>;
}

export const AdhanAlarm = registerPlugin<AdhanAlarmPlugin>('AdhanAlarm');
