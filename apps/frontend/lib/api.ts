import 'server-only';
import { headers } from 'next/headers';
import type { FieldErrors } from './types';

// Server-only: the browser never talks to the Express API directly, so its URL isn't
// shipped to the client and every call carries the user's session cookie.
const API_URL = process.env.API_URL || 'http://localhost:4291';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: FieldErrors
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/** Call the backend as the current user. Throws ApiError with the API's message on non-2xx. */
export async function api<T>(path: string, { body, ...init }: ApiOptions = {}): Promise<T> {
  const cookie = (await headers()).get('cookie');
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(cookie && { cookie }),
      ...init.headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as {
      error?: string;
      fieldErrors?: FieldErrors;
    } | null;
    throw new ApiError(
      data?.error ?? `Request failed (${res.status})`,
      res.status,
      data?.fieldErrors
    );
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}
