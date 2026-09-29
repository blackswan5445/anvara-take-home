import { ApiError } from './api';
import type { FormState } from './types';

/**
 * Map a failed API call to form state the UI can render next to each field. Pass the
 * FormData so the submitted values come back too (React resets forms after an action).
 */
export function toFormError(error: unknown, formData?: FormData): FormState {
  const values = formData ? formValues(formData) : undefined;
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return { error: 'Your session has expired. Please log in again.', values };
    }
    if (error.fieldErrors) {
      return {
        error: 'Please fix the highlighted fields.',
        fieldErrors: error.fieldErrors,
        values,
      };
    }
    return { error: error.message, values };
  }
  // eslint-disable-next-line no-console -- server-side log of unexpected action failures
  console.error(error);
  return { error: 'Something went wrong on our end. Please try again.', values };
}

function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    // Skip React's internal $ACTION_ fields and file inputs
    if (typeof value === 'string' && !key.startsWith('$ACTION')) values[key] = value;
  }
  return values;
}

/** Trimmed string value, or null when blank (the API treats null as "clear this field"). */
export function text(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

/** Numeric value, or null when blank. Non-numeric input becomes NaN and fails API validation. */
export function number(formData: FormData, key: string): number | null {
  const value = text(formData, key);
  return value === null ? null : Number(value);
}
