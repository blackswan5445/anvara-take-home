import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { requireRole } from '@/lib/session';
import type { Campaign } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { StatTile } from '../components/stat-tile';
import { CampaignCard } from './components/campaign-card';
import { CampaignDialog } from './components/campaign-dialog';

export const metadata: Metadata = { title: 'My Campaigns' };

// Server Component: auth check and data load happen on the server before any HTML is sent,
// so campaigns are in the initial HTML and no client-side fetching code ships.
export default async function SponsorDashboard() {
  const user = await requireRole('sponsor');
  const campaigns = await api<Campaign[]>('/api/campaigns');

  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + Number(c.spent), 0);
  const active = campaigns.filter((c) => c.status === 'ACTIVE').length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Welcome back, {user.name}</p>
          <h1 className="text-3xl font-bold tracking-tight">My Campaigns</h1>
        </div>
        <CampaignDialog />
      </header>

      <dl className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Active campaigns" value={`${active} of ${campaigns.length}`} />
        <StatTile label="Total budget" value={formatPrice(totalBudget)} />
        <StatTile label="Spent to date" value={formatPrice(totalSpent)} />
      </dl>

      {campaigns.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 border-dashed px-6 py-16 text-center">
          <span className="text-4xl" aria-hidden>
            📣
          </span>
          <h2 className="text-lg font-semibold">No campaigns yet</h2>
          <p className="max-w-sm text-sm text-muted">
            Create a campaign to set your budget and dates, then book placements from the
            marketplace.
          </p>
          <CampaignDialog />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
