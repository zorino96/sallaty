'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Flame, MapPin, Plus, Trash2, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { hijriDate } from '@/lib/prayerTimes';
import {
  addCheckin, currentStreak, dateKey, densityForDate, getCheckins, removeCheckin,
  subscribeCheckins, todayKey, type CheckIn, type Prayer,
} from '@/lib/habits';
import type { StringKey } from '@/lib/i18n';

const PRAYERS: Prayer[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function vibrate(p: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(p);
}

function levelClass(level: number): string {
  return [
    'bg-cream-200 ring-1 ring-inset ring-cream-300/40 dark:bg-teal-700/50 dark:ring-cream-100/10',
    'bg-emerald-900/30',
    'bg-emerald-700/55',
    'bg-emerald-600/80',
    'bg-emerald-500',
  ][level];
}

export default function HabitsPage() {
  const { t, lang, coords, city } = useApp();
  const [streak, setStreak] = useState(0);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [cursor, setCursor] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    const refresh = () => {
      setStreak(currentStreak());
      setCheckins(getCheckins());
    };
    refresh();
    return subscribeCheckins(refresh);
  }, []);

  const today = todayKey();

  const { cells, leadingEmpty } = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const empty = (first.getDay() + 1) % 7; // Saturday = 0 → align to Saturday-first weeks (RTL)
    const out: Array<{ date: string; v: number }> = [];
    const walker = new Date(first);
    while (walker.getMonth() === cursor.getMonth()) {
      const k = dateKey(walker);
      out.push({ date: k, v: densityForDate(k) });
      walker.setDate(walker.getDate() + 1);
    }
    return { cells: out, leadingEmpty: empty };
  }, [cursor, checkins]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'ar-IQ', {
      month: 'long', year: 'numeric',
    }).format(cursor),
    [cursor, lang],
  );

  const hijri = useMemo(() => hijriDate(cursor, lang), [cursor, lang]);

  const shiftMonth = (delta: number): void => {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + delta);
    setCursor(next);
    vibrate(8);
  };

  const weekdayLabels = lang === 'ar'
    ? ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج']
    : ['شە', 'یە', 'دو', 'سێ', 'چو', 'پێ', 'هە'];

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={t('monthHeatmap')} subtitle={t('habits')} />

      <section className="space-y-3 px-5 pb-4">
        {/* Streak + heatmap */}
        <div className="surface rounded-3xl px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-ink-800/55 dark:text-cream-100/55">
                {t('streak')}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-rabar text-4xl font-bold tabular">{streak}</span>
                <span className="text-sm opacity-65">{t('days')}</span>
              </div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-700/15 text-emerald-700 dark:text-emerald-300">
              <Flame size={20} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <button
              onClick={() => shiftMonth(-1)}
              aria-label="previous month"
              className="grid h-8 w-8 place-items-center rounded-full bg-cream-100 active:scale-90 dark:bg-teal-800"
            >
              <ChevronRight size={14} className="rtl:rotate-180" />
            </button>
            <div className="min-w-0 text-center leading-tight">
              <div className="truncate font-rabar text-[12px] font-semibold">{monthLabel}</div>
              {hijri && (
                <div className="truncate text-[10px] text-gold-700 dark:text-gold-400">{hijri}</div>
              )}
            </div>
            <button
              onClick={() => shiftMonth(1)}
              aria-label="next month"
              className="grid h-8 w-8 place-items-center rounded-full bg-cream-100 active:scale-90 dark:bg-teal-800"
            >
              <ChevronLeft size={14} className="rtl:rotate-180" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-[10px] text-ink-800/45 dark:text-cream-100/40">
            {weekdayLabels.map((wd, i) => <div key={i}>{wd}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1.5">
            {Array.from({ length: leadingEmpty }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {cells.map((cell) => {
              const lvl = Math.min(4, Math.round(4 * cell.v));
              const day = Number(cell.date.slice(-2));
              const isToday = cell.date === today;
              const dark = lvl >= 4;
              return (
                <button
                  key={cell.date}
                  onClick={() => { setOpenDate(cell.date); vibrate(6); }}
                  title={cell.date}
                  aria-label={cell.date}
                  className={
                    'relative aspect-square rounded-md transition active:scale-90 ' +
                    levelClass(lvl) +
                    (isToday ? ' ring-2 ring-gold-500/80' : '')
                  }
                >
                  <span
                    className={
                      'absolute inset-0 grid place-items-center text-[10.5px] font-semibold tabular ' +
                      (dark ? 'text-white' : 'text-ink-800/70 dark:text-cream-100/75')
                    }
                  >
                    {day}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-ink-800/55 dark:text-cream-100/55">
            <span>—</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={`h-3 w-3 rounded ${levelClass(i)}`} />
              ))}
            </div>
            <span>+</span>
          </div>
        </div>

        {/* Congregation log + add form */}
        <div className="surface rounded-3xl px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="font-rabar text-[15px] font-semibold">{t('congregationLog')}</div>
            <button
              onClick={() => setShowAdd((v) => !v)}
              aria-label={t('add')}
              className="grid h-9 w-9 place-items-center rounded-full bg-gold-500 text-white shadow-gold transition active:scale-95"
            >
              {showAdd ? <X size={16} /> : <Plus size={16} />}
            </button>
          </div>
          {showAdd && (
            <AddCheckinForm
              defaultMosque={city}
              defaultLat={coords.lat}
              defaultLng={coords.lng}
              onDone={() => setShowAdd(false)}
            />
          )}
          <div className="mt-3 space-y-2">
            {checkins.length === 0 ? (
              <div className="rounded-2xl bg-cream-100 px-4 py-5 text-center text-[12px] text-ink-800/55 dark:bg-teal-800/50 dark:text-cream-100/55">
                {t('noCheckIns')}
              </div>
            ) : (
              checkins.slice(0, 30).map((c) => (
                <CheckInRow key={c.id} entry={c} lang={lang} onDelete={() => removeCheckin(c.id)} />
              ))
            )}
          </div>
        </div>

        <div className="surface rounded-3xl px-5 py-5 text-center">
          <div className="font-rabar text-[15px] leading-8">{t('blessing')}</div>
        </div>
      </section>

      <div className="flex-1" />
      <BottomNav />

      {openDate && <DayDetail dateKey={openDate} onClose={() => setOpenDate(null)} />}
    </main>
  );
}

function AddCheckinForm({
  defaultMosque, defaultLat, defaultLng, onDone,
}: {
  defaultMosque?: string;
  defaultLat: number;
  defaultLng: number;
  onDone: () => void;
}) {
  const { t } = useApp();
  const [prayer, setPrayer] = useState<Prayer>('fajr');
  const [name, setName] = useState(defaultMosque ?? '');

  return (
    <div className="mt-3 space-y-2 rounded-2xl bg-cream-100 p-3 dark:bg-teal-800/50">
      <div className="text-[11px] uppercase tracking-[0.25em] text-ink-800/55 dark:text-cream-100/55">
        {t('addCongregationPrayer')}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRAYERS.map((p) => (
          <button
            key={p}
            onClick={() => setPrayer(p)}
            className={
              'rounded-full px-3 py-1.5 text-[12px] transition active:scale-95 ' +
              (prayer === p
                ? 'bg-gold-500 text-white shadow-gold'
                : 'bg-white/60 dark:bg-teal-900/60')
            }
          >
            {t(p as StringKey)}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-full bg-white/60 px-3 py-2 text-[13px] dark:bg-teal-900/60">
        <MapPin size={14} className="opacity-60" />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('mosqueName')}
          dir="rtl"
          className="w-full bg-transparent outline-none placeholder:text-ink-800/40 dark:placeholder:text-cream-100/40"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => {
            addCheckin({ prayer, mosqueName: name || undefined, lat: defaultLat, lng: defaultLng });
            vibrate(10);
            setName('');
            onDone();
          }}
          className="flex-1 rounded-full bg-gold-500 py-2.5 text-[12px] font-semibold text-white shadow-gold transition active:scale-95"
        >
          {t('save')}
        </button>
        <button
          onClick={onDone}
          className="rounded-full bg-white/60 px-4 py-2.5 text-[12px] transition active:scale-95 dark:bg-teal-900/60"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}

function CheckInRow({ entry, lang, onDelete }: { entry: CheckIn; lang: 'ku' | 'ar'; onDelete: () => void }) {
  const { t } = useApp();
  const ts = new Date(entry.timestamp);
  const fmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'ar-IQ', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-cream-100 px-3.5 py-3 dark:bg-teal-800/50">
      <div className="min-w-0">
        <div className="text-[13px] font-semibold">
          {t(entry.prayer as StringKey)}{entry.mosqueName ? ` · ${entry.mosqueName}` : ''}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-800/55 dark:text-cream-100/55">
          <Clock size={11} />
          <span className="truncate">{fmt.format(ts)}</span>
        </div>
      </div>
      <button
        onClick={onDelete}
        aria-label={t('delete')}
        className="grid h-8 w-8 place-items-center rounded-full text-ink-800/40 transition active:scale-90 dark:text-cream-100/40"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function DayDetail({ dateKey: dk, onClose }: { dateKey: string; onClose: () => void }) {
  const { t } = useApp();
  const entries = getCheckins().filter((c) => c.date === dk);
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button onClick={onClose} aria-label={t('close')} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-[420px] rounded-t-3xl bg-[var(--bg)] p-5 shadow-glass sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <div className="font-rabar text-[15px] font-semibold">{t('dayDetails')}</div>
          <button onClick={onClose} aria-label={t('close')} className="grid h-8 w-8 place-items-center rounded-full bg-cream-100 dark:bg-teal-800">
            <X size={14} />
          </button>
        </div>
        <div className="mt-1 text-[11px] tabular text-ink-800/55 dark:text-cream-100/55" dir="ltr">{dk}</div>
        <div className="mt-3 space-y-1.5">
          {entries.length === 0 ? (
            <div className="rounded-2xl bg-cream-100 px-4 py-4 text-center text-[12px] text-ink-800/55 dark:bg-teal-800/50 dark:text-cream-100/55">
              {t('noCheckInsForDay')}
            </div>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl bg-cream-100 px-3 py-2 dark:bg-teal-800/50">
                <div className="text-[13px] font-semibold">
                  {t(e.prayer as StringKey)}{e.mosqueName ? ` · ${e.mosqueName}` : ''}
                </div>
                <div className="text-[10.5px] tabular text-ink-800/55 dark:text-cream-100/55">
                  {new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }).format(new Date(e.timestamp))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
