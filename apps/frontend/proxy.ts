import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';
import {
  EXPERIMENTS,
  experimentCookie,
  isVariant,
  pickVariant,
  type ExperimentId,
} from './lib/experiments';

const ONE_YEAR = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  // Optimistic auth: no session cookie at all means a real 307 to /login before any rendering.
  // It only checks presence; the backend verifies the session on every data request.
  if (request.nextUrl.pathname.startsWith('/dashboard') && !getSessionCookie(request)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return assignExperiments(request);
}

// Assign A/B variants before rendering so Server Components see them on the very first request.
// Debug: append ?ab_booking-cta=outcome to force a variant (it sticks, like a real assignment).
function assignExperiments(request: NextRequest) {
  const assigned: Array<[string, string]> = [];

  for (const id of Object.keys(EXPERIMENTS) as ExperimentId[]) {
    const name = experimentCookie(id);
    const forced = request.nextUrl.searchParams.get(name);
    if (isVariant(id, forced)) assigned.push([name, forced]);
    else if (!isVariant(id, request.cookies.get(name)?.value))
      assigned.push([name, pickVariant(id)]);
  }
  if (assigned.length === 0) return NextResponse.next();

  for (const [name, value] of assigned) request.cookies.set(name, value);
  const response = NextResponse.next({ request: { headers: request.headers } });
  for (const [name, value] of assigned) {
    response.cookies.set(name, value, { maxAge: ONE_YEAR, sameSite: 'lax', path: '/' });
  }
  return response;
}

export const config = { matcher: ['/marketplace/:path*', '/dashboard/:path*'] };
