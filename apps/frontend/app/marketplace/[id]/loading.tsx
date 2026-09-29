// Mirrors the detail page's two-column layout so nothing jumps when it loads
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading listing">
      <div className="h-5 w-40 animate-pulse rounded bg-surface" />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="h-6 w-24 animate-pulse rounded-full bg-surface" />
          <div className="h-10 w-3/4 animate-pulse rounded-lg bg-surface" />
          <div className="h-20 animate-pulse rounded-lg bg-surface" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-surface" />
      </div>
    </div>
  );
}
