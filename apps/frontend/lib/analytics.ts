import { sendGAEvent } from '@next/third-parties/google';

// Funnel: view_item_list -> select_item -> view_item -> begin_checkout -> purchase / generate_lead.
// GA4 recommended event names where one fits, so standard reports work without custom config.
export type AnalyticsEvent =
  | 'view_item_list'
  | 'select_item'
  | 'view_item'
  | 'search'
  | 'begin_checkout'
  | 'purchase' // placement booked (macro-conversion)
  | 'generate_lead' // quote requested (macro-conversion)
  | 'sign_up' // newsletter
  | 'login'
  | 'experiment_exposure';

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** Fire-and-forget; never throws or blocks the UI. No-ops without a GA id (logs in dev). */
export function track(event: AnalyticsEvent, params: AnalyticsParams = {}): void {
  if (typeof window === 'undefined') return;
  if (!GA_ID) {
    // eslint-disable-next-line no-console -- dev-only visibility into events without a GA property
    if (process.env.NODE_ENV === 'development') console.debug('[analytics]', event, params);
    return;
  }
  sendGAEvent('event', event, params);
}
