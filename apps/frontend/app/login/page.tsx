import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { dashboardPathFor, getCurrentUser } from '@/lib/session';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Log in' };

export default async function LoginPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect(dashboardPathFor(user.role));

  return (
    <div className="flex justify-center py-12 sm:py-20">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Log in to Anvara</h1>
        <p className="mt-1 text-sm text-muted">Manage your campaigns or your ad inventory.</p>
        <LoginForm />
      </div>
    </div>
  );
}
