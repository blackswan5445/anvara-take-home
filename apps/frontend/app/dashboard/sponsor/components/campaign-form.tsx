'use client';

import { useActionState } from 'react';
import { Field, FormError } from '@/app/components/field';
import { SubmitButton } from '@/app/components/submit-button';
import { toast } from '@/lib/toast';
import type { Campaign, FormState } from '@/lib/types';
import { humanize, submittedOr, toDateInputValue } from '@/lib/utils';
import { createCampaign, updateCampaign } from '../actions';

const STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'] as const;
const initialState: FormState = {};

interface CampaignFormProps {
  campaign?: Campaign;
  onSuccess: () => void;
}

export function CampaignForm({ campaign, onSuccess }: CampaignFormProps) {
  const serverAction = campaign ? updateCampaign.bind(null, campaign.id) : createCampaign;
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await serverAction(prev, formData);
    if (result.success) {
      toast(result.message ?? 'Saved');
      onSuccess();
    }
    return result;
  }, initialState);
  const errors = state.fieldErrors ?? {};
  const v = (key: string, saved?: string | number | null) => submittedOr(state.values, key, saved);

  // noValidate: show the API's inline field errors instead of browser bubbles
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormError message={state.error} />

      <Field label="Campaign name" name="name" error={errors.name}>
        {(props) => (
          <input
            {...props}
            className="input"
            required
            maxLength={200}
            defaultValue={v('name', campaign?.name)}
            placeholder="Q4 product launch"
          />
        )}
      </Field>

      <Field label="Description" name="description" error={errors.description} hint="Optional">
        {(props) => (
          <textarea
            {...props}
            className="input"
            rows={3}
            maxLength={2000}
            defaultValue={v('description', campaign?.description)}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Budget (USD)" name="budget" error={errors.budget}>
          {(props) => (
            <input
              {...props}
              className="input"
              type="number"
              inputMode="decimal"
              required
              min="0.01"
              step="0.01"
              defaultValue={v('budget', campaign && Number(campaign.budget))}
              placeholder="5000"
            />
          )}
        </Field>
        <Field label="Status" name="status" error={errors.status}>
          {(props) => (
            <select
              {...props}
              className="input"
              defaultValue={v('status', campaign?.status ?? 'DRAFT')}
              // React doesn't restore a <select>'s defaultValue on form reset; remount it instead
              key={v('status', campaign?.status)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {humanize(status)}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Start date" name="startDate" error={errors.startDate}>
          {(props) => (
            <input
              {...props}
              className="input"
              type="date"
              required
              defaultValue={v('startDate', campaign && toDateInputValue(campaign.startDate))}
            />
          )}
        </Field>
        <Field label="End date" name="endDate" error={errors.endDate}>
          {(props) => (
            <input
              {...props}
              className="input"
              type="date"
              required
              defaultValue={v('endDate', campaign && toDateInputValue(campaign.endDate))}
            />
          )}
        </Field>
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton pendingLabel="Saving…">
          {campaign ? 'Save changes' : 'Create campaign'}
        </SubmitButton>
      </div>
    </form>
  );
}
