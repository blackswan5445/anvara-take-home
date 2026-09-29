import { ConfirmDeleteButton } from '@/app/components/confirm-delete-button';
import { AdSlotTypeBadge } from '@/app/components/ad-slot-type-badge';
import type { AdSlot } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { deleteAdSlot } from '../actions';
import { AdSlotDialog } from './ad-slot-dialog';
import { AvailabilityToggle } from './availability-toggle';

export function AdSlotCard({ adSlot }: { adSlot: AdSlot }) {
  return (
    <article className="card animate-fade-in flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{adSlot.name}</h3>
        <AdSlotTypeBadge type={adSlot.type} />
      </div>

      {adSlot.description && (
        <p className="line-clamp-2 text-sm text-muted">{adSlot.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-medium ${adSlot.isAvailable ? 'text-success' : 'text-muted'}`}
        >
          <span
            aria-hidden
            className={`size-2 rounded-full ${adSlot.isAvailable ? 'bg-success' : 'bg-muted'}`}
          />
          {adSlot.isAvailable ? 'Available' : 'Booked'}
        </span>
        <span className="font-semibold tabular-nums">
          {formatPrice(adSlot.basePrice)}
          <span className="text-sm font-normal text-muted">/mo</span>
        </span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-4">
        <AdSlotDialog adSlot={adSlot} />
        <AvailabilityToggle id={adSlot.id} isAvailable={adSlot.isAvailable} />
        <ConfirmDeleteButton action={deleteAdSlot.bind(null, adSlot.id)} itemName={adSlot.name} />
      </div>
    </article>
  );
}
