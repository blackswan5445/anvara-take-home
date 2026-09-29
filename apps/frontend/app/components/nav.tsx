import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { LogoutButton } from './logout-button';
import { NavLinks, type NavLink } from './nav-links';

export async function Nav() {
  // If the API is down, render the signed-out nav rather than taking every page down with it
  const user = await getCurrentUser().catch(() => null);

  const links: NavLink[] = [{ href: '/marketplace', label: 'Marketplace' }];
  if (user?.role === 'sponsor') links.push({ href: '/dashboard/sponsor', label: 'My Campaigns' });
  if (user?.role === 'publisher')
    links.push({ href: '/dashboard/publisher', label: 'My Ad Slots' });

  const account = user ? (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted">
        {user.name}
        {user.role && (
          <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary capitalize">
            {user.role}
          </span>
        )}
      </span>
      <LogoutButton />
    </div>
  ) : (
    <Link href="/login" className="btn-primary">
      Log in
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4"
      >
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          Anvara
        </Link>

        <div className="hidden flex-1 items-center justify-between md:flex">
          <NavLinks links={links} />
          {account}
        </div>

        {/* Mobile: native <details> disclosure, works before JS loads */}
        <details className="group relative md:hidden">
          <summary
            aria-label="Menu"
            className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg hover:bg-surface [&::-webkit-details-marker]:hidden"
          >
            <span aria-hidden className="text-2xl group-open:hidden">
              ☰
            </span>
            <span aria-hidden className="hidden text-2xl group-open:inline">
              ×
            </span>
          </summary>
          <div className="card animate-fade-in absolute right-0 mt-2 flex w-64 flex-col gap-4 p-4">
            <NavLinks links={links} vertical />
            <div className="border-t border-border pt-4">{account}</div>
          </div>
        </details>
      </nav>
    </header>
  );
}
