'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavLink {
  href: string;
  label: string;
}

export function NavLinks({ links, vertical = false }: { links: NavLink[]; vertical?: boolean }) {
  const pathname = usePathname();

  return (
    <ul className={cn('flex gap-1', vertical && 'flex-col')}>
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              // Close the mobile <details> menu after navigating
              onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')}
              className={cn(
                'flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors',
                active ? 'bg-primary-soft text-primary' : 'text-muted hover:text-foreground'
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
