import { ConfirmDeleteButton } from '@/app/components/confirm-delete-button';
import type { Campaign, CampaignStatus } from '@/lib/types';
import { formatDate, formatPrice, humanize } from '@/lib/utils';
import { deleteCampaign } from '../actions';
import { CampaignDialog } from './campaign-dialog';

const statusStyles: Record<CampaignStatus, string> = {
  DRAFT: 'bg-surface text-muted',
  PENDING_REVIEW: 'bg-warning-soft text-warning',
  APPROVED: 'bg-primary-soft text-primary',
  ACTIVE: 'bg-success-soft text-success',
  PAUSED: 'bg-warning-soft text-warning',
  COMPLETED: 'bg-primary-soft text-primary',
  CANCELLED: 'bg-danger-soft text-danger',
};

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const budget = Number(campaign.budget);
  const spent = Number(campaign.spent);
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <article className="card animate-fade-in flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{campaign.name}</h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[campaign.status]}`}
        >
          {humanize(campaign.status)}
        </span>
      </div>

      {campaign.description && (
        <p className="line-clamp-2 text-sm text-muted">{campaign.description}</p>
      )}

      <div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Spent</span>
          <span className="font-medium tabular-nums">
            {formatPrice(spent)} <span className="text-muted">/ {formatPrice(budget)}</span>
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Budget spent"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-2 h-2 rounded-full bg-surface"
        >
          <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <p className="text-xs text-muted">
        {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
      </p>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-4">
        <CampaignDialog campaign={campaign} />
        <ConfirmDeleteButton
          action={deleteCampaign.bind(null, campaign.id)}
          itemName={campaign.name}
        />
      </div>
    </article>
  );
}
