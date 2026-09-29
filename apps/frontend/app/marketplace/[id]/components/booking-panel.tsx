'use client';

import Link from 'next/link';
import { useActionState, useRef } from 'react';
import { Field, FormError } from '@/app/components/field';
import { SubmitButton } from '@/app/components/submit-button';
import { TrackedLink } from '@/app/components/track-event';
import { track } from '@/lib/analytics';
import type { AdSlot, FormState, UserRole } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { bookAdSlot } from '../../actions';
import { QuoteDialog } from './quote-dialog';

export interface Viewer {
  role: UserRole | null;
  name: string;
  email: string;
}

interface BookingPanelProps {
  adSlot: AdSlot;
  viewer: Viewer | null;
  ctaLabel: string;
  ctaVariant: string;
}

const initialState: FormState = {};

export function BookingPanel({ adSlot, viewer, ctaLabel, ctaVariant }: BookingPanelProps) {
  const item = {
    item_id: adSlot.id,
    item_name: adSlot.name,
    value: Number(adSlot.basePrice),
    currency: 'USD',
  };
  const startedCheckout = useRef(false);

  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await bookAdSlot(adSlot.id, prev, formData);
    // Conversion fires only once the server confirms, tagged with the A/B variant
    if (result.success) track('purchase', { ...item, cta_variant: ctaVariant });
    return result;
  }, initialState);

  const beginCheckout = () => {
    if (startedCheckout.current) return;
    startedCheckout.current = true;
    track('begin_checkout', { ...item, cta_variant: ctaVariant });
  };

  if (state.success) {
    return (
      <div
        className="card animate-fade-in space-y-3 border-success/40 bg-success-soft p-6"
        role="status"
      >
        <p className="text-3xl" aria-hidden>
          🎉
        </p>
        <h2 className="text-lg font-semibold">You’re booked!</h2>
        <p className="text-sm text-muted">
          {adSlot.publisher?.name ?? 'The publisher'} has been notified and will confirm dates and
          creative specs with you. Nothing is charged until then.
        </p>
        <Link href="/marketplace" className="btn-secondary w-full">
          Keep browsing
        </Link>
      </div>
    );
  }

  return (
    <div className="card space-y-5 p-6">
      <div>
        <p className="text-3xl font-bold tabular-nums">
          {formatPrice(adSlot.basePrice)}
          <span className="text-base font-normal text-muted"> / month</span>
        </p>
        <p
          className={`mt-1 inline-flex items-center gap-1.5 text-sm font-medium ${adSlot.isAvailable ? 'text-success' : 'text-muted'}`}
        >
          <span
            aria-hidden
            className={`size-2 rounded-full ${adSlot.isAvailable ? 'bg-success' : 'bg-muted'}`}
          />
          {adSlot.isAvailable ? 'Available now' : 'Currently booked'}
        </p>
      </div>

      {!adSlot.isAvailable ? (
        <p className="text-sm text-muted">
          This slot is taken for now. Request a quote and the publisher will reach out when it opens
          up, or about similar inventory.
        </p>
      ) : viewer?.role === 'sponsor' ? (
        <form action={formAction} onFocus={beginCheckout} className="space-y-4">
          <FormError message={state.error} />
          <Field
            label="Message to the publisher"
            name="message"
            error={state.fieldErrors?.message}
            hint="Optional: campaign goals, dates, audience you want to reach"
          >
            {(props) => (
              <textarea
                {...props}
                rows={3}
                maxLength={1000}
                defaultValue={state.values?.message}
                className="input"
              />
            )}
          </Field>
          <SubmitButton className="btn-primary w-full" pendingLabel="Booking…">
            {ctaLabel}
          </SubmitButton>
        </form>
      ) : viewer ? (
        <p className="rounded-lg bg-surface p-3 text-sm text-muted">
          You’re signed in as a {viewer.role ?? 'user without a role'}. Only sponsor accounts can
          book placements.
        </p>
      ) : (
        <TrackedLink
          href="/login"
          event="cta_click"
          params={{ cta: 'login_to_book', item_id: adSlot.id }}
          className="btn-primary w-full"
        >
          Log in to book
        </TrackedLink>
      )}

      {viewer?.role !== 'publisher' && (
        <div className="border-t border-border pt-4 text-center">
          <p className="mb-2 text-sm text-muted">Need custom dates, bundles or pricing?</p>
          <QuoteDialog adSlot={adSlot} viewer={viewer} />
        </div>
      )}
    </div>
  );
}
