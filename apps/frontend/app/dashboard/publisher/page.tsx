import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { requireRole } from '@/lib/session';
import type { AdSlot } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { StatTile } from '../components/stat-tile';
import { AdSlotCard } from './components/ad-slot-card';
import { AdSlotDialog } from './components/ad-slot-dialog';

export const metadata: Metadata = { title: 'My Ad Slots' };

export default async function PublisherDashboard() {
  const user = await requireRole('publisher');
  const adSlots = await api<AdSlot[]>('/api/ad-slots');

  const booked = adSlots.filter((slot) => !slot.isAvailable);
  const bookedRevenue = booked.reduce((sum, slot) => sum + Number(slot.basePrice), 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Welcome back, {user.name}</p>
          <h1 className="text-3xl font-bold tracking-tight">My Ad Slots</h1>
        </div>
        <AdSlotDialog />
      </header>

      <dl className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Ad slots" value={String(adSlots.length)} />
        <StatTile label="Booked" value={`${booked.length} of ${adSlots.length}`} />
        <StatTile label="Booked revenue / mo" value={formatPrice(bookedRevenue)} />
      </dl>

      {adSlots.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 border-dashed px-6 py-16 text-center">
          <span className="text-4xl" aria-hidden>
            🪧
          </span>
          <h2 className="text-lg font-semibold">No ad slots yet</h2>
          <p className="max-w-sm text-sm text-muted">
            List your first ad slot and it shows up in the marketplace for sponsors right away.
          </p>
          <AdSlotDialog />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adSlots.map((adSlot) => (
            <AdSlotCard key={adSlot.id} adSlot={adSlot} />
          ))}
        </div>
      )}
    </div>
  );
}
