'use client';

import { useEffect, useState } from 'react';
import { TOAST_EVENT, type ToastDetail } from '@/lib/toast';

interface Toast extends ToastDetail {
  id: number;
}

// A window event keeps this decoupled: callers don't need a context provider,
// and a toast survives the component that fired it unmounting (e.g. a deleted card).
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let nextId = 0;
    const onToast = (event: Event) => {
      const toast = { ...(event as CustomEvent<ToastDetail>).detail, id: nextId++ };
      setToasts((current) => [...current, toast]);
      setTimeout(() => setToasts((current) => current.filter((t) => t.id !== toast.id)), 4000);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.tone === 'error' ? 'alert' : 'status'}
          className={`animate-toast-in pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.tone === 'error'
              ? 'bg-danger text-white dark:text-slate-950'
              : 'bg-foreground text-background'
          }`}
        >
          <span aria-hidden>{toast.tone === 'error' ? '⚠' : '✓'}</span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
