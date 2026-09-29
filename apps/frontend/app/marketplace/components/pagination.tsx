import Form from 'next/form';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { pageWindow, toQueryString, type MarketplaceFilters } from '../search-params';

interface PaginationProps {
  filters: MarketplaceFilters;
  page: number;
  totalPages: number;
}

export function Pagination({ filters, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;
  const href = (p: number) =>
    `/marketplace${toQueryString({ ...filters, page: p > 1 ? String(p) : undefined })}`;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-x-1 gap-y-3"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn-secondary" rel="prev">
          ← Previous
        </Link>
      ) : (
        <span className="btn-secondary pointer-events-none opacity-50" aria-disabled="true">
          ← Previous
        </span>
      )}
      {pageWindow(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-2 text-muted" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
            className={cn(
              'btn min-w-11',
              p === page ? 'bg-primary text-white dark:text-slate-950' : 'hover:bg-surface'
            )}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages ? (
        <Link href={href(page + 1)} className="btn-secondary" rel="next">
          Next →
        </Link>
      ) : (
        <span className="btn-secondary pointer-events-none opacity-50" aria-disabled="true">
          Next →
        </span>
      )}
      <JumpToPage filters={filters} page={page} totalPages={totalPages} />
    </nav>
  );
}

/** A plain GET form: works without JS, and the browser enforces the 1..totalPages range. */
function JumpToPage({ filters, page, totalPages }: PaginationProps) {
  return (
    <Form action="/marketplace" className="flex items-center gap-2 text-sm sm:ml-4">
      {Object.entries(filters).map(
        ([key, value]) =>
          key !== 'page' && value && <input key={key} type="hidden" name={key} value={value} />
      )}
      <label htmlFor="jump-to-page" className="text-muted">
        Go to page
      </label>
      <input
        id="jump-to-page"
        name="page"
        type="number"
        inputMode="numeric"
        min={1}
        max={totalPages}
        required
        defaultValue={page}
        className="input w-20"
      />
      <button type="submit" className="btn-secondary">
        Go
      </button>
    </Form>
  );
}
