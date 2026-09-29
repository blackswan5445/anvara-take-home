import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackEvent } from '@/app/components/track-event';
import { api } from '@/lib/api';
import type { AdSlot, Paginated } from '@/lib/types';
import { ListingCard } from './components/listing-card';
import { MarketplaceFiltersForm } from './components/filters';
import { Pagination } from './components/pagination';
import { parseFilters, toQueryString } from './search-params';

export const metadata: Metadata = {
  title: 'Marketplace',
  description:
    'Browse newsletter, podcast, video and display sponsorships from vetted publishers. Transparent pricing, book in minutes.',
};

const PAGE_SIZE = 12;

interface MarketplacePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Filtering and pagination live in the URL: shareable, back-button friendly, server-rendered.
export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const filters = parseFilters(await searchParams);
  const { data: adSlots, meta } = await api<Paginated<AdSlot>>(
    `/api/marketplace/ad-slots${toQueryString({ ...filters, pageSize: String(PAGE_SIZE) })}`
  );
  const hasFilters = Boolean(filters.q || filters.type || filters.available);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="max-w-2xl text-muted">
          Sponsorships from vetted publishers, with audience size and pricing up front. Book
          directly, or ask for a custom quote.
        </p>
      </header>

      <MarketplaceFiltersForm filters={filters} />

      <p className="text-sm text-muted" aria-live="polite">
        {meta.total === 0
          ? 'No ad slots match'
          : `Showing ${(meta.page - 1) * meta.pageSize + 1}–${Math.min(meta.page * meta.pageSize, meta.total)} of ${meta.total} ad slots`}
      </p>

      {adSlots.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 border-dashed px-6 py-16 text-center">
          <span className="text-4xl" aria-hidden>
            🔍
          </span>
          <h2 className="text-lg font-semibold">
            {hasFilters ? 'Nothing matches those filters' : 'No ad slots listed yet'}
          </h2>
          <p className="max-w-sm text-sm text-muted">
            {hasFilters
              ? 'Try a different search or clear the filters to see everything.'
              : 'New inventory is added every week. Subscribe below to hear about it first.'}
          </p>
          {hasFilters && (
            <Link href="/marketplace" className="btn-secondary">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adSlots.map((adSlot, index) => (
            <li key={adSlot.id}>
              <ListingCard adSlot={adSlot} position={(meta.page - 1) * meta.pageSize + index + 1} />
            </li>
          ))}
        </ul>
      )}

      <Pagination filters={filters} page={meta.page} totalPages={meta.totalPages} />

      <TrackEvent
        event="view_item_list"
        params={{ page: meta.page, results: meta.total, type: filters.type, query: filters.q }}
      />
    </div>
  );
}
