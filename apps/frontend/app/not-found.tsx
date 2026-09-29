import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-bold">This page doesn’t exist</h1>
      <p className="text-muted">The listing may have been removed, or the link is wrong.</p>
      <Link href="/marketplace" className="btn-primary">
        Browse the marketplace
      </Link>
    </div>
  );
}
