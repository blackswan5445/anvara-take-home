'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';
import { authClient } from '@/auth-client';
import { FormError } from '@/app/components/field';
import { track } from '@/lib/analytics';

const DEMO_ACCOUNTS = [
  { role: 'sponsor', label: 'Demo sponsor', email: 'sponsor@example.com' },
  { role: 'publisher', label: 'Demo publisher', email: 'publisher@example.com' },
] as const;
const DEMO_PASSWORD = 'password';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const signIn = (credentials: { email: string; password: string }) =>
    startTransition(async () => {
      setError(undefined);
      const { error: signInError } = await authClient.signIn.email(credentials);
      if (signInError) {
        setError(signInError.message ?? 'Invalid email or password');
        return;
      }
      track('login', { method: 'email' });
      router.push('/dashboard'); // redirects to the right dashboard for the user's role
      router.refresh();
    });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    signIn({ email, password });
  };

  return (
    <div className="mt-6 space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium">Try a demo account</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              disabled={pending}
              onClick={() => {
                setEmail(account.email);
                setPassword(DEMO_PASSWORD);
                signIn({ email: account.email, password: DEMO_PASSWORD });
              }}
              className="btn-secondary"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" /> or use email{' '}
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <FormError message={error} />
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
