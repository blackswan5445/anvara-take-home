import type { AdSlot } from './types';

/**
 * Effective cost per thousand monthly views: the number sponsors use to compare
 * a $500 newsletter against a $5,000 video. Null when the publisher has no reach data.
 */
export function effectiveCpm(adSlot: Pick<AdSlot, 'basePrice' | 'publisher'>): number | null {
  const views = adSlot.publisher?.monthlyViews;
  if (!views) return null;
  return Number(adSlot.basePrice) / (views / 1000);
}
