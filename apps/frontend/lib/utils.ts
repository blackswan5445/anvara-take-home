// Frontend formatting helpers

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
// Dates are stored as UTC midnight; format in UTC so they don't shift a day in US timezones
const shortDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

const currencyWithCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** $1,500 — accepts Prisma Decimal strings ("1500.00") as well as numbers. */
export function formatPrice(price: number | string): string {
  return currency.format(Number(price));
}

/** $1.50 — for small per-unit amounts like CPM where whole dollars would mislead. */
export function formatPriceWithCents(price: number | string): string {
  return currencyWithCents.format(Number(price));
}

/** 1.2K, 500K, 3.4M */
export function formatCompact(value: number): string {
  return compact.format(value);
}

/** "Oct 1, 2026", or '' for an invalid date. */
export function formatDate(date: string | Date): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '' : shortDate.format(parsed);
}

/** yyyy-mm-dd for <input type="date"> defaults. */
export function toDateInputValue(date: string | Date): string {
  return new Date(date).toISOString().slice(0, 10);
}

/** Humanize an enum value: "PENDING_REVIEW" -> "Pending review". */
export function humanize(value: string): string {
  const words = value.toLowerCase().replaceAll('_', ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** A form field's default: the value just submitted (after a failed action), else the saved one. */
export function submittedOr(
  values: Record<string, string> | undefined,
  key: string,
  saved?: string | number | null
): string | undefined {
  return values?.[key] ?? (saved == null ? undefined : String(saved));
}
