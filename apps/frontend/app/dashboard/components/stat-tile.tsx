export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
