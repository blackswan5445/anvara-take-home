'use client';

import { useActionState } from 'react';
import { Field, FormError } from '@/app/components/field';
import { SubmitButton } from '@/app/components/submit-button';
import { toast } from '@/lib/toast';
import { AD_SLOT_TYPES, type AdSlot, type FormState } from '@/lib/types';
import { humanize, submittedOr } from '@/lib/utils';
import { createAdSlot, updateAdSlot } from '../actions';

const initialState: FormState = {};

interface AdSlotFormProps {
  adSlot?: AdSlot;
  onSuccess: () => void;
}

export function AdSlotForm({ adSlot, onSuccess }: AdSlotFormProps) {
  const serverAction = adSlot ? updateAdSlot.bind(null, adSlot.id) : createAdSlot;
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

      <Field label="Name" name="name" error={errors.name}>
        {(props) => (
          <input
            {...props}
            className="input"
            required
            maxLength={200}
            defaultValue={v('name', adSlot?.name)}
            placeholder="Homepage leaderboard"
          />
        )}
      </Field>

      <Field
        label="Description"
        name="description"
        error={errors.description}
        hint="What sponsors get: audience, placement, format"
      >
        {(props) => (
          <textarea
            {...props}
            className="input"
            rows={3}
            maxLength={2000}
            defaultValue={v('description', adSlot?.description)}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" name="type" error={errors.type}>
          {(props) => (
            <select
              {...props}
              className="input"
              required
              defaultValue={v('type', adSlot?.type ?? 'DISPLAY')}
              // React doesn't restore a <select>'s defaultValue on form reset; remount it instead
              key={v('type', adSlot?.type)}
            >
              {AD_SLOT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {humanize(type)}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Price per month (USD)" name="basePrice" error={errors.basePrice}>
          {(props) => (
            <input
              {...props}
              className="input"
              type="number"
              inputMode="decimal"
              required
              min="0.01"
              step="0.01"
              defaultValue={v('basePrice', adSlot && Number(adSlot.basePrice))}
              placeholder="500"
            />
          )}
        </Field>
        <Field label="Position" name="position" error={errors.position} hint="Optional">
          {(props) => (
            <input
              {...props}
              className="input"
              maxLength={100}
              defaultValue={v('position', adSlot?.position)}
              placeholder="header, mid-roll…"
            />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Width (px)" name="width" error={errors.width}>
            {(props) => (
              <input
                {...props}
                className="input"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                defaultValue={v('width', adSlot?.width)}
              />
            )}
          </Field>
          <Field label="Height (px)" name="height" error={errors.height}>
            {(props) => (
              <input
                {...props}
                className="input"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                defaultValue={v('height', adSlot?.height)}
              />
            )}
          </Field>
        </div>
      </div>

      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="isAvailable"
          defaultChecked={
            state.values ? state.values.isAvailable === 'on' : (adSlot?.isAvailable ?? true)
          }
          className="size-5 accent-primary"
        />
        Available for booking
      </label>

      <div className="flex justify-end pt-2">
        <SubmitButton pendingLabel="Saving…">
          {adSlot ? 'Save changes' : 'Create ad slot'}
        </SubmitButton>
      </div>
    </form>
  );
}
