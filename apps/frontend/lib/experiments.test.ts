import { describe, expect, it } from 'vitest';
import { EXPERIMENTS, isVariant, pickVariant } from './experiments';

describe('pickVariant', () => {
  it('splits by cumulative weight (50/50)', () => {
    expect(pickVariant('booking-cta', 0)).toBe('control');
    expect(pickVariant('booking-cta', 49.9)).toBe('control');
    expect(pickVariant('booking-cta', 50)).toBe('outcome');
    expect(pickVariant('booking-cta', 99.9)).toBe('outcome');
  });

  it('only accepts known variants from cookies/query strings', () => {
    expect(isVariant('booking-cta', 'outcome')).toBe(true);
    expect(isVariant('booking-cta', 'hacked')).toBe(false);
    expect(isVariant('booking-cta', undefined)).toBe(false);
  });
});

describe('EXPERIMENTS', () => {
  it.each(Object.entries(EXPERIMENTS))(
    '%s has one weight per variant, summing to 100',
    (_, exp) => {
      expect(exp.weights).toHaveLength(exp.variants.length);
      expect(exp.weights.reduce((sum: number, w: number) => sum + w, 0)).toBe(100);
    }
  );
});
