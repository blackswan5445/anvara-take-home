'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { authClient } from '@/auth-client';

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const logout = () =>
    startTransition(async () => {
      await authClient.signOut();
      router.push('/');
      router.refresh(); // re-render the server nav without the session
    });

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="btn-secondary whitespace-nowrap"
    >
      {pending ? 'Logging out…' : 'Log out'}
    </button>
  );
}
