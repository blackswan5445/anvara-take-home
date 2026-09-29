import { describe, expect, it } from 'vitest';
import { effectiveCpm } from './pricing';
import { formatDate, formatPrice, formatPriceWithCents, humanize, submittedOr } from './utils';

describe('formatting', () => {
  it('formats Prisma Decimal strings as currency', () => {
    expect(formatPrice('1500.00')).toBe('$1,500');
    expect(formatPriceWithCents(1.5)).toBe('$1.50');
  });

  it('formats dates in UTC so stored midnights do not shift a day', () => {
    expect(formatDate('2026-11-01T00:00:00.000Z')).toBe('Nov 1, 2026');
    expect(formatDate('not a date')).toBe('');
  });

  it('humanizes enum values', () => {
    expect(humanize('PENDING_REVIEW')).toBe('Pending review');
  });

  it('prefers just-submitted values over saved ones', () => {
    expect(submittedOr({ name: 'typed' }, 'name', 'saved')).toBe('typed');
    expect(submittedOr(undefined, 'budget', 500)).toBe('500');
    expect(submittedOr(undefined, 'description', null)).toBeUndefined();
  });
});

describe('effectiveCpm', () => {
  it('is price per thousand monthly views', () => {
    expect(effectiveCpm({ basePrice: '150', publisher: { monthlyViews: 100_000 } as never })).toBe(
      1.5
    );
  });

  it('is null without reach data', () => {
    expect(effectiveCpm({ basePrice: '150', publisher: { monthlyViews: 0 } as never })).toBeNull();
    expect(effectiveCpm({ basePrice: '150' })).toBeNull();
  });
});
