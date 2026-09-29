'use client';

import { DialogButton } from '@/app/components/dialog-button';
import type { Campaign } from '@/lib/types';
import { CampaignForm } from './campaign-form';

/** "New campaign" when no campaign is given, otherwise "Edit". */
export function CampaignDialog({ campaign }: { campaign?: Campaign }) {
  return (
    <DialogButton
      label={campaign ? 'Edit' : '+ New campaign'}
      title={campaign ? 'Edit campaign' : 'New campaign'}
      className={campaign ? 'btn-secondary' : 'btn-primary'}
    >
      {(close) => <CampaignForm campaign={campaign} onSuccess={close} />}
    </DialogButton>
  );
}
