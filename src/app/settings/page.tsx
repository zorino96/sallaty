'use client';

import { Bell, Check, Languages, LoaderCircle, MapPin, Moon, Play, RefreshCw, Sparkles, Sun, Volume2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/lib/AppProvider';
import { adhanTracks } from '@/data/adhanTracks';
import { playAdhan, stopAdhan } from '@/lib/adhanPlayer';
import type { Lang, ThemeMode } from '@/lib/types';

type Option<T extends string> = { v: T; label: string; icon?: React.ReactNode };

export default function SettingsPage() {
  const {
    t, lang, setLang, theme, setTheme, city, coords, geoStatus, refreshLocation,
    adhanId, setAdhanId, notifEnabled, notifPerm, enableNotifications, disableNotifications,
  } = useApp();

  const notifOn = notifEnabled && notifPerm === 'granted';

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <PageHeader title={t('settings')} subtitle={t('appName')} />

      <section className="space-y-2 px-5 pb-6">
        {/* Language + theme group */}
        <div className="surface rounded-2xl p-2">
          <Group icon={<Languages size={16} />} label={t('language')}>
            <Segmented<Lang>
              value={lang}
              options={[
                { v: 'ku', label: 'کوردی' },
                { v: 'ar', label: 'العربية' },
              ]}
              onChange={setLang}
            />
          </Group>
          <Divider />
          <Group icon={<Sparkles size={16} />} label={t('theme')}>
            <Segmented<ThemeMode>
              value={theme}
              options={[
                { v: 'light', label: t('light'), icon: <Sun size={14} /> },
                { v: 'dark',  label: t('dark'),  icon: <Moon size={14} /> },
                { v: 'auto',  label: t('auto') },
              ]}
              onChange={setTheme}
            />
          </Group>
        </div>

        {/* Location */}
        <div className="surface flex items-center gap-3 rounded-2xl px-4 py-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-600">
            <MapPin size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.3em] text-ink-800/55 dark:text-cream-100/55">
              {t('locationAuto')}
            </div>
            <div className="mt-0.5 truncate font-rabar text-[15px] font-bold leading-tight">
              {geoStatus === 'locating' ? t('locating') : city ?? t('locationAuto')}
            </div>
            <div className="mt-0.5 truncate text-[10.5px] tabular text-ink-800/55 dark:text-cream-100/55" dir="ltr">
              {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
            </div>
          </div>
          <button
            onClick={refreshLocation}
            disabled={geoStatus === 'locating'}
            aria-label={t('refreshLocation')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-500 text-white shadow-gold transition active:scale-90 disabled:opacity-60"
          >
            {geoStatus === 'locating' ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </button>
        </div>

        {/* Notifications */}
        <div className="surface rounded-2xl p-2">
          <Row
            icon={<Bell size={16} />}
            label={t('notifications')}
            right={
              notifPerm === 'unsupported' ? (
                <span className="text-[12px] opacity-50">—</span>
              ) : notifPerm === 'denied' ? (
                <span className="text-[12px] opacity-60">{t('notifDenied')}</span>
              ) : (
                <Switch
                  on={notifOn}
                  onChange={(on) => {
                    if (on) void enableNotifications();
                    else disableNotifications();
                    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(6);
                  }}
                />
              )
            }
          />
        </div>

        {/* Adhan / chime picker */}
        <div className="surface rounded-2xl p-3">
          <div className="flex items-center gap-2 px-1 pb-2 text-[13px]">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream-100 text-gold-600 dark:bg-teal-800">
              <Volume2 size={16} />
            </span>
            <span className="truncate font-semibold">{t('chooseAdhan')}</span>
          </div>
          {(['adhan', 'alert'] as const).map((cat) => (
            <div key={cat} className="pt-2">
              <div className="px-1 pb-1.5 text-[10px] uppercase tracking-[0.2em] text-ink-800/55 dark:text-cream-100/55">
                {cat === 'adhan' ? t('realAdhans') : t('alertChimes')}
              </div>
              <div className="flex flex-col gap-1.5">
                {adhanTracks.filter((a) => a.category === cat).map((a) => {
                  const selected = a.id === adhanId;
                  return (
                    <div
                      key={a.id}
                      className={
                        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition ' +
                        (selected
                          ? 'bg-gold-500 text-white shadow-gold'
                          : 'bg-cream-100 text-ink-800 dark:bg-teal-800 dark:text-cream-100')
                      }
                    >
                      {/* checkbox square — taps to select/lock this sound */}
                      <button
                        onClick={() => {
                          setAdhanId(a.id);
                          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(6);
                        }}
                        role="checkbox"
                        aria-checked={selected}
                        aria-label={lang === 'ar' ? a.ar : a.ku}
                        className={
                          'grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border transition active:scale-90 ' +
                          (selected ? 'border-white bg-white/25' : 'border-ink-800/30 dark:border-cream-100/30')
                        }
                      >
                        {selected && <Check size={13} strokeWidth={3} />}
                      </button>
                      {/* name — tapping also selects */}
                      <button
                        onClick={() => {
                          setAdhanId(a.id);
                          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(6);
                        }}
                        className="min-w-0 flex-1 truncate text-start text-[12.5px] font-semibold"
                      >
                        {lang === 'ar' ? a.ar : a.ku}
                      </button>
                      {a.maqam && (
                        <span
                          className={
                            'shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold ' +
                            (selected ? 'bg-white/20' : 'bg-gold-500/15 text-gold-700 dark:text-gold-300')
                          }
                        >
                          {a.maqam}
                        </span>
                      )}
                      {/* preview button */}
                      <button
                        onClick={() => playAdhan(a.id)}
                        aria-label="preview"
                        className={
                          'grid h-7 w-7 shrink-0 place-items-center rounded-full transition active:scale-90 ' +
                          (selected ? 'bg-white/20' : 'bg-white/60 dark:bg-teal-900/60')
                        }
                      >
                        <Play size={12} className="opacity-90" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            onClick={stopAdhan}
            aria-label={t('silenceAdhan')}
            className="mt-3 w-full rounded-xl bg-cream-100 py-1.5 text-[11px] uppercase tracking-widest text-ink-800/60 transition active:scale-95 dark:bg-teal-800 dark:text-cream-100/60"
          >
            ⏹ {t('silenceAdhan')}
          </button>
        </div>
      </section>

      <div className="flex-1" />
      <BottomNav />
    </main>
  );
}

function Group({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-2 text-[14px]">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-cream-100 text-gold-600 dark:bg-teal-800">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function Row({ icon, label, right }: { icon: React.ReactNode; label: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-2 text-[14px]">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-cream-100 text-gold-600 dark:bg-teal-800">{icon}</span>
        <span>{label}</span>
      </div>
      <div>{right}</div>
    </div>
  );
}

function Divider() {
  return <div className="mx-2 my-1 h-px bg-[var(--line)]" />;
}

function Segmented<T extends string>({
  value, options, onChange,
}: {
  value: T;
  options: Array<Option<T>>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex w-full items-stretch gap-1 rounded-full bg-cream-100 p-1 dark:bg-teal-800">
      {options.map((opt) => (
        <button
          key={opt.v}
          onClick={() => {
            onChange(opt.v);
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(6);
          }}
          className={
            'flex flex-1 items-center justify-center gap-1 truncate rounded-full px-2 py-1.5 text-[11.5px] transition active:scale-95 ' +
            (value === opt.v ? 'bg-gold-500 text-white shadow-gold' : 'text-ink-800/65 dark:text-cream-100/70')
          }
        >
          {opt.icon}
          <span className="truncate">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label="toggle"
      onClick={() => onChange(!on)}
      className={
        'relative inline-flex h-7 w-12 items-center rounded-full transition active:scale-95 ' +
        (on ? 'bg-gold-500' : 'bg-cream-200 dark:bg-teal-800')
      }
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all"
        style={{ insetInlineStart: on ? 'calc(100% - 26px)' : '2px' }}
      />
    </button>
  );
}
