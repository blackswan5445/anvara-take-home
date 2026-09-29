import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { api, ApiError } from './api';
import type { CurrentUser, UserRole } from './types';

/** The signed-in user (deduped per request), or null when signed out. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  try {
    return await api<CurrentUser>('/api/auth/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});

export function dashboardPathFor(role: UserRole | null): string {
  return role ? `/dashboard/${role}` : '/';
}

/** Gate a page to one role: signed-out users go to /login, other roles to their own dashboard. */
export async function requireRole(role: UserRole): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== role) redirect(dashboardPathFor(user.role));
  return user;
}
