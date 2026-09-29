import { redirect } from 'next/navigation';
import { dashboardPathFor, getCurrentUser } from '@/lib/session';

// /dashboard sends each user to the dashboard for their role (used after login)
export default async function DashboardRedirect() {
  const user = await getCurrentUser();
  redirect(user ? dashboardPathFor(user.role) : '/login');
}
