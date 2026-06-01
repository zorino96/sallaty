'use client';

import { useEffect } from 'react';

type Props = {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open, title, body, confirmLabel, cancelLabel, danger = false, onConfirm, onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter')  onConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-6" role="dialog" aria-modal="true">
      <button onClick={onCancel} aria-label={cancelLabel} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-[340px] animate-scale-pop rounded-3xl bg-[var(--bg)] p-5 shadow-glass">
        <div className="font-rabar text-[16px] font-bold leading-tight">{title}</div>
        {body && (
          <div className="mt-2 text-[13px] leading-6 text-ink-800/65 dark:text-cream-100/65">{body}</div>
        )}
        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full bg-cream-100 px-4 py-2.5 text-[13px] font-semibold transition active:scale-95 dark:bg-teal-800"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={
              'flex-1 rounded-full px-4 py-2.5 text-[13px] font-semibold text-white transition active:scale-95 ' +
              (danger ? 'bg-red-500 shadow-md shadow-red-500/30' : 'bg-gold-500 shadow-gold')
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
