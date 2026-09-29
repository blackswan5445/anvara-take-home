'use client';

import { useActionState } from 'react';
import { SubmitButton } from '@/app/components/submit-button';
import { toast } from '@/lib/toast';
import type { FormState } from '@/lib/types';
import { setAdSlotAvailability } from '../actions';

const initialState: FormState = {};

export function AvailabilityToggle({ id, isAvailable }: { id: string; isAvailable: boolean }) {
  const [, formAction] = useActionState(async () => {
    const result = await setAdSlotAvailability(id, !isAvailable);
    if (result.success) toast(result.message ?? 'Updated');
    else toast(result.error ?? 'Update failed', 'error');
    return result;
  }, initialState);

  return (
    <form action={formAction}>
      <SubmitButton className="btn-secondary" pendingLabel="Updating…">
        {isAvailable ? 'Mark booked' : 'Mark available'}
      </SubmitButton>
    </form>
  );
}
