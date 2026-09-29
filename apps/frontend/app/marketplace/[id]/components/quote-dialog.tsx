'use client';

import { useActionState } from 'react';
import { DialogButton } from '@/app/components/dialog-button';
import { Field, FormError } from '@/app/components/field';
import { SubmitButton } from '@/app/components/submit-button';
import { track } from '@/lib/analytics';
import type { AdSlot, FormState } from '@/lib/types';
import { submittedOr } from '@/lib/utils';
import { requestQuote } from '../../actions';
import type { Viewer } from './booking-panel';

const TIMELINES = ['As soon as possible', 'Within a month', 'Next quarter', 'Flexible'];
const initialState: FormState = {};

export function QuoteDialog({ adSlot, viewer }: { adSlot: AdSlot; viewer: Viewer | null }) {
  return (
    <DialogButton
      label="Request a quote"
      title={`Request a quote: ${adSlot.name}`}
      className="btn-secondary w-full"
    >
      {(close) => <QuoteForm adSlot={adSlot} viewer={viewer} onDone={close} />}
    </DialogButton>
  );
}

function QuoteForm({
  adSlot,
  viewer,
  onDone,
}: {
  adSlot: AdSlot;
  viewer: Viewer | null;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await requestQuote(adSlot.id, prev, formData);
    if (result.success)
      track('generate_lead', { item_id: adSlot.id, lead_source: 'quote_request' });
    return result;
  }, initialState);
  const errors = state.fieldErrors ?? {};
  const v = (key: string, saved?: string | null) => submittedOr(state.values, key, saved);

  if (state.success) {
    return (
      <div className="space-y-3 text-center" role="status">
        <p className="text-3xl" aria-hidden>
          📬
        </p>
        <h3 className="text-lg font-semibold">Quote request sent</h3>
        <p className="text-sm text-muted">
          {adSlot.publisher?.name ?? 'The publisher'} usually replies within one business day.{' '}
          {state.message}
        </p>
        <button type="button" onClick={onDone} className="btn-primary w-full">
          Done
        </button>
      </div>
    );
  }

  // noValidate: show the API's inline field errors instead of browser bubbles
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <p className="text-sm text-muted">
        Tell {adSlot.publisher?.name ?? 'the publisher'} what you have in mind. No commitment.
      </p>
      <FormError message={state.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" name="companyName" error={errors.companyName}>
          {(props) => (
            <input
              {...props}
              required
              autoComplete="organization"
              defaultValue={v('companyName')}
              className="input"
            />
          )}
        </Field>
        <Field label="Work email" name="email" error={errors.email}>
          {(props) => (
            <input
              {...props}
              type="email"
              required
              autoComplete="email"
              defaultValue={v('email', viewer?.email)}
              className="input"
            />
          )}
        </Field>
        <Field label="Phone" name="phone" error={errors.phone} hint="Optional">
          {(props) => (
            <input
              {...props}
              type="tel"
              autoComplete="tel"
              defaultValue={v('phone')}
              className="input"
            />
          )}
        </Field>
        <Field label="Budget (USD)" name="budget" error={errors.budget} hint="Optional">
          {(props) => (
            <input
              {...props}
              type="number"
              inputMode="decimal"
              min="1"
              defaultValue={v('budget')}
              className="input"
            />
          )}
        </Field>
      </div>
      <Field label="Timeline" name="timeline" error={errors.timeline}>
        {(props) => (
          <select
            {...props}
            className="input"
            defaultValue={v('timeline', 'Flexible')}
            // React doesn't restore a <select>'s defaultValue on form reset; remount it instead
            key={v('timeline')}
          >
            {TIMELINES.map((timeline) => (
              <option key={timeline}>{timeline}</option>
            ))}
          </select>
        )}
      </Field>
      <Field label="What are you looking for?" name="message" error={errors.message}>
        {(props) => (
          <textarea
            {...props}
            required
            rows={4}
            maxLength={2000}
            defaultValue={v('message')}
            placeholder="Goals, preferred dates, bundles, questions about the audience…"
            className="input"
          />
        )}
      </Field>
      <SubmitButton className="btn-primary w-full" pendingLabel="Sending…">
        Send quote request
      </SubmitButton>
    </form>
  );
}
