import { AD_SLOT_TYPES, type AdSlotType } from '@/lib/types';

export const SORTS = {
  featured: 'Featured',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
  newest: 'Newest',
} as const;
export type Sort = keyof typeof SORTS;

// A type alias (not an interface) so it's assignable to Record<string, string | undefined>
export type MarketplaceFilters = {
  q?: string;
  type?: AdSlotType;
  available?: 'true';
  sort?: Sort;
  page?: string;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Keep only well-formed filters, so a hand-edited URL can't turn into an API 400. */
export function parseFilters(params: RawSearchParams): MarketplaceFilters {
  const q = first(params.q)?.trim().slice(0, 100);
  const type = first(params.type);
  const sort = first(params.sort);
  const page = first(params.page);
  return {
    q: q || undefined,
    type: AD_SLOT_TYPES.find((t) => t === type),
    available: first(params.available) === 'true' ? 'true' : undefined,
    sort: sort && sort in SORTS ? (sort as Sort) : undefined,
    page: page && /^[1-9]\d{0,4}$/.test(page) ? page : undefined,
  };
}

/** Query string for the given params, dropping empty values. */
export function toQueryString(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter((entry): entry is [string, string] =>
    Boolean(entry[1])
  );
  const query = new URLSearchParams(entries).toString();
  return query ? `?${query}` : '';
}

/** Page numbers around the current page, with gaps: 1 … 4 5 [6] 7 8 … 20 */
export function pageWindow(page: number, totalPages: number): Array<number | 'gap'> {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['gap' as const, p] : [p]));
}
