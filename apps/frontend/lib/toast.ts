export type ToastTone = 'success' | 'error';
export interface ToastDetail {
  message: string;
  tone: ToastTone;
}

export const TOAST_EVENT = 'anvara:toast';

/** Show a toast from any client code; <Toaster /> in the root layout renders it. */
export function toast(message: string, tone: ToastTone = 'success'): void {
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message, tone } }));
}
