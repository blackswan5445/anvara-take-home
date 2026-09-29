'use client';

import Form from 'next/form';
import { AD_SLOT_TYPES } from '@/lib/types';
import { humanize } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { SORTS, type MarketplaceFilters } from '../search-params';

// next/form: a plain GET form that navigates client-side. Search submits on Enter;
// selects and the checkbox submit on change. Changing filters resets to page 1.
export function MarketplaceFiltersForm({ filters }: { filters: MarketplaceFilters }) {
  const submitOnChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    event.currentTarget.form?.requestSubmit();

  return (
    <Form
      action="/marketplace"
      onSubmit={(event) => {
        const q = new FormData(event.currentTarget).get('q');
        if (q) track('search', { search_term: String(q) });
      }}
      className="card grid grid-cols-2 gap-3 p-4 lg:grid-cols-[1fr_auto_auto_auto]"
      role="search"
    >
      <div className="col-span-2 lg:col-span-1">
        <label htmlFor="q" className="sr-only">
          Search ad slots
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Search by name, publisher or audience…"
          className="input"
        />
      </div>
      <div>
        <label htmlFor="type" className="sr-only">
          Format
        </label>
        <select
          id="type"
          name="type"
          defaultValue={filters.type ?? ''}
          onChange={submitOnChange}
          className="input"
        >
          <option value="">All formats</option>
          {AD_SLOT_TYPES.map((type) => (
            <option key={type} value={type}>
              {humanize(type)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="sort" className="sr-only">
          Sort by
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={filters.sort ?? 'featured'}
          onChange={submitOnChange}
          className="input"
        >
          {Object.entries(SORTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <label className="col-span-2 flex min-h-11 items-center gap-2 px-1 text-sm whitespace-nowrap lg:col-span-1">
        <input
          type="checkbox"
          name="available"
          value="true"
          defaultChecked={filters.available === 'true'}
          onChange={submitOnChange}
          className="size-5 accent-primary"
        />
        Available only
      </label>
    </Form>
  );
}
