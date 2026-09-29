export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading marketplace">
      <div className="space-y-2">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-surface" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-surface" />
      </div>
      <div className="h-20 animate-pulse rounded-xl bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
