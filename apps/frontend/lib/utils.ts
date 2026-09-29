// Frontend utility functions

// Format a price for display
export function formatPrice(price: number | string, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(
    Number(price)
  );
}

// Debounce function for search inputs
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Parse query string parameters
export function parseQueryString(queryString: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(queryString));
}

// Check if we're running on the client side
export const isClient = typeof window !== 'undefined';

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Class name helper (simple cn alternative)
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

// Sleep utility for testing/debugging
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Deep clone an object (handles dates, maps, sets, and circular references)
export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

// Logger that only logs in development
export const logger = {
  log: (...args: unknown[]): void => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[App]', ...args);
    }
  },
  error: (...args: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.error('[App Error]', ...args);
  },
  warn: (...args: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.warn('[App Warning]', ...args);
  },
};

// Relative day label ("Today", "3 days ago"); returns '' for invalid input
export function formatRelativeTime(date: Date | string | number, now = new Date()): string {
  const then = new Date(date);
  if (Number.isNaN(then.getTime())) return '';
  const days = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days > 1 && days < 7) return `${days} days ago`;
  return then.toLocaleDateString('en-US');
}
