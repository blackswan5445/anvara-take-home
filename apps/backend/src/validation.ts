import type { Response } from 'express';
import { z } from 'zod';

// Decimal(10, 2) columns top out just under 100M
export const money = (label: string) =>
  z.coerce
    .number({ error: `${label} must be a number` })
    .positive(`${label} must be greater than 0`)
    .max(99_999_999.99, `${label} is too large`);

// Blank strings clear the field (null); undefined leaves it untouched on updates
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .transform((value) => value || null)
    .nullish();

export const requiredText = (label: string, max = 200) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

export type FieldErrors = Record<string, string>;

/** First message per field, keyed by path ("endDate", "targetRegions.0"). */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

/** Parse input or respond 400 with field errors. Returns undefined when it responded. */
export function parseOr400<T>(schema: z.ZodType<T>, input: unknown, res: Response): T | undefined {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  res.status(400).json({ error: 'Validation failed', fieldErrors: toFieldErrors(result.error) });
  return undefined;
}

export function sendFieldError(res: Response, field: string, message: string): void {
  res.status(400).json({ error: 'Validation failed', fieldErrors: { [field]: message } });
}
