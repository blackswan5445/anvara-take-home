'use client';

import { useActionState, useState } from 'react';
import { toast } from '@/lib/toast';
import type { FormState } from '@/lib/types';
import { SubmitButton } from './submit-button';

interface ConfirmDeleteButtonProps {
  /** Server action with the resource id already bound. */
  action: () => Promise<FormState>;
  itemName: string;
}

const initialState: FormState = {};

/** Two-step inline delete: no accidental deletes, no modal for a one-word decision. */
export function ConfirmDeleteButton({ action, itemName }: ConfirmDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(async () => {
    const result = await action();
    // Toast before the revalidated list unmounts this card
    if (result.success) toast(result.message ?? `Deleted ${itemName}`);
    return result;
  }, initialState);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn-secondary text-danger"
      >
        Delete
      </button>
    );
  }

  return (
    // data-deleting lets the surrounding card fade out while the delete is in flight
    <form
      action={formAction}
      data-deleting={isPending || undefined}
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-sm text-muted">Delete “{itemName}”?</span>
      <SubmitButton className="btn-danger" pendingLabel="Deleting…">
        Delete
      </SubmitButton>
      <button type="button" onClick={() => setConfirming(false)} className="btn-secondary">
        Cancel
      </button>
      {state.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
