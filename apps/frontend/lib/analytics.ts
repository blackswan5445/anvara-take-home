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
  | 'cta_click' // micro-conversion: a primary call to action was clicked (param: cta)
  | 'experiment_exposure';

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Every event carries the viewer's role so funnels can be split by sponsor/publisher/guest
let userType = 'guest';

export function setUserType(role: string | null): void {
  userType = role ?? 'guest';
  if (GA_ID) sendGAEvent('set', 'user_properties', { user_type: userType });
}

/** Fire-and-forget; never throws or blocks the UI. No-ops without a GA id (logs in dev). */
export function track(event: AnalyticsEvent, eventParams: AnalyticsParams = {}): void {
  if (typeof window === 'undefined') return;
  const params = { user_type: userType, ...eventParams };
  if (!GA_ID) {
    // eslint-disable-next-line no-console -- dev-only visibility into events without a GA property
    if (process.env.NODE_ENV === 'development') console.debug('[analytics]', event, params);
    return;
  }
  sendGAEvent('event', event, params);
}
