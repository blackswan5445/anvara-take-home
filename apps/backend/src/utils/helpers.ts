// Utility helpers for the API

// Extract a single string from a route/query param (Express types these as string | string[] | ParsedQs).
// Returns undefined for a missing value instead of silently collapsing it to ''.
export function getParam(param: unknown): string | undefined {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0];
  return undefined;
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

export function parsePagination(query: Record<string, unknown>): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, Number.parseInt(getParam(query.page) ?? '', 10) || 1);
  const limit = clampValue(Number.parseInt(getParam(query.limit) ?? '', 10) || 10, 1, 100);
  return { page, limit, skip: (page - 1) * limit };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function buildFilters<K extends string>(
  query: Record<string, unknown>,
  allowedFields: readonly K[]
): Partial<Record<K, unknown>> {
  const filters: Partial<Record<K, unknown>> = {};
  for (const field of allowedFields) {
    if (query[field] !== undefined) filters[field] = query[field];
  }
  return filters;
}

// The original comment claimed this mishandled negatives; it didn't. Same logic, one line.
export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatDate(date: Date | string | number): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Invalid date' : parsed.toLocaleDateString('en-US');
}
