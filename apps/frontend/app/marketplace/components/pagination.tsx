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
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1">
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
    </nav>
  );
}
