'use client';

import { useActionState } from 'react';
import { subscribeToNewsletter } from '@/app/actions';
import { track } from '@/lib/analytics';
import type { FormState } from '@/lib/types';
import { SubmitButton } from './submit-button';

const initialState: FormState = {};

export function NewsletterForm({ source }: { source: string }) {
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await subscribeToNewsletter(prev, formData);
    if (result.success) track('sign_up', { method: 'newsletter', source });
    return result;
  }, initialState);

  if (state.success) {
    return (
      <p role="status" className="animate-fade-in flex items-center gap-2 font-medium text-success">
        <span aria-hidden>✓</span> {state.message}
      </p>
    );
  }

  const error = state.fieldErrors?.email ?? state.error;
  return (
    <form
      action={formAction}
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
      noValidate
    >
      <label htmlFor={`newsletter-${source}`} className="sr-only">
        Email address
      </label>
      <input
        id={`newsletter-${source}`}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@company.com"
        defaultValue={state.values?.email}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `newsletter-${source}-error` : undefined}
        className="input flex-1"
      />
      <SubmitButton pendingLabel="Subscribing…">Get new listings</SubmitButton>
      {error && (
        <p id={`newsletter-${source}-error`} className="text-sm text-danger sm:basis-full">
          {error}
        </p>
      )}
    </form>
  );
}
