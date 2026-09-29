import { AdSlotTypeBadge } from '@/app/components/ad-slot-type-badge';
import { TrackedLink } from '@/app/components/track-event';
import { VerifiedBadge } from '@/app/components/verified-badge';
import { effectiveCpm } from '@/lib/pricing';
import type { AdSlot } from '@/lib/types';
import { cn, formatCompact, formatPrice, formatPriceWithCents } from '@/lib/utils';

// Answers the three questions a sponsor scans for: who's the audience, how big, what does it cost.
export function ListingCard({ adSlot, position }: { adSlot: AdSlot; position: number }) {
  const { publisher } = adSlot;
  const cpm = effectiveCpm(adSlot);

  return (
    <TrackedLink
      href={`/marketplace/${adSlot.id}`}
      event="select_item"
      params={{
        item_id: adSlot.id,
        item_name: adSlot.name,
        item_category: adSlot.type,
        index: position,
      }}
      className={cn(
        'card group animate-fade-in flex h-full flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
        !adSlot.isAvailable && 'opacity-70'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold group-hover:text-primary">{adSlot.name}</h3>
          {publisher && (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
              {publisher.name}
              {publisher.isVerified && <VerifiedBadge />}
            </p>
          )}
        </div>
        <AdSlotTypeBadge type={adSlot.type} />
      </div>

      {adSlot.description && (
        <p className="line-clamp-2 text-sm text-muted">{adSlot.description}</p>
      )}

      {publisher && publisher.monthlyViews > 0 && (
        <dl className="grid grid-cols-2 gap-2 rounded-lg bg-surface p-3 text-sm">
          <div>
            <dt className="text-xs text-muted">Monthly reach</dt>
            <dd className="font-semibold tabular-nums">{formatCompact(publisher.monthlyViews)}</dd>
          </div>
          {cpm !== null && (
            <div>
              <dt className="text-xs text-muted">Effective CPM</dt>
              <dd className="font-semibold tabular-nums">{formatPriceWithCents(cpm)}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-auto flex items-end justify-between pt-1">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-medium',
            adSlot.isAvailable ? 'text-success' : 'text-muted'
          )}
        >
          <span
            aria-hidden
            className={cn('size-2 rounded-full', adSlot.isAvailable ? 'bg-success' : 'bg-muted')}
          />
          {adSlot.isAvailable ? 'Available now' : 'Booked'}
        </span>
        <span className="text-lg font-bold tabular-nums">
          {formatPrice(adSlot.basePrice)}
          <span className="text-sm font-normal text-muted">/mo</span>
        </span>
      </div>
    </TrackedLink>
  );
}
