/** Mirrors the dashboard layout so the page doesn't jump when data arrives. */
export function DashboardSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-8" aria-busy="true" aria-label={label}>
      <div className="h-14 w-64 animate-pulse rounded-lg bg-surface" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
