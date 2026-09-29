'use client';

import Link from 'next/link';
import { useEffect } from 'react';

// Catches render/data errors in any page (e.g. the API is down) while keeping the nav.
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console -- surface the error until a reporting service is wired up
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <span className="text-4xl" aria-hidden>
        🔌
      </span>
      <h1 className="text-2xl font-bold">We couldn’t load this page</h1>
      <p className="text-muted">
        Our servers may be having a moment. Check your connection and try again.
      </p>
      <div className="flex gap-3">
        <button type="button" onClick={() => retry()} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
      </div>
    </div>
  );
}
