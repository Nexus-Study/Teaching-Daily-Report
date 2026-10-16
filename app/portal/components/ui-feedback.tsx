'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, X } from 'lucide-react';

export type UiFeedbackType = 'loading' | 'success' | 'error';

type UiFeedbackProps = {
  type: UiFeedbackType;
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
};

export default function UiFeedback({
  type,
  message,
  onDismiss,
  autoDismissMs,
}: UiFeedbackProps) {
  useEffect(() => {
    if (autoDismissMs === undefined || autoDismissMs <= 0) return;

    const timeoutId = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(timeoutId);
  }, [autoDismissMs, message, onDismiss]);

  const Icon = type === 'loading'
    ? LoaderCircle
    : type === 'success'
      ? CheckCircle2
      : AlertCircle;
  const toneClass = type === 'success'
    ? 'text-emerald-700'
    : type === 'error'
      ? 'text-rose-700'
      : 'text-slate-700';

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-md items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-lg ${toneClass}`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 ${type === 'loading' ? 'animate-spin' : ''}`}
        aria-hidden="true"
      />
      <p className="min-w-0 flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-muted hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
