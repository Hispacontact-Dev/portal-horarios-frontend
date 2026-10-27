export function TurnosHoySkeletonRow() {
  return (
    <div className="grid h-[46px] grid-cols-[120px_minmax(0,1fr)] items-center gap-2 border-t border-[var(--divider)] md:grid-cols-[190px_minmax(0,1fr)]">
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-28 animate-pulse rounded bg-[var(--divider)]" />
        <div className="h-2.5 w-16 animate-pulse rounded bg-[var(--divider)]" />
      </div>
      <div className="relative h-[22px]">
        <div className="absolute inset-y-0 left-0 w-1/3 animate-pulse rounded bg-[var(--divider)]" />
      </div>
    </div>
  );
}
