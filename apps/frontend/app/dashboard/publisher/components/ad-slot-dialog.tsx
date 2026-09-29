'use client';

import { DialogButton } from '@/app/components/dialog-button';
import type { AdSlot } from '@/lib/types';
import { AdSlotForm } from './ad-slot-form';

/** "New ad slot" when no slot is given, otherwise "Edit". */
export function AdSlotDialog({ adSlot }: { adSlot?: AdSlot }) {
  return (
    <DialogButton
      label={adSlot ? 'Edit' : '+ New ad slot'}
      title={adSlot ? 'Edit ad slot' : 'New ad slot'}
      className={adSlot ? 'btn-secondary' : 'btn-primary'}
    >
      {(close) => <AdSlotForm adSlot={adSlot} onSuccess={close} />}
    </DialogButton>
  );
}
