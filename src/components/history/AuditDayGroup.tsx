"use client";

import { AuditRow } from "@/components/history/AuditRow";
import type { AuditDay, TargetResolver } from "@/lib/utils/audit";
import { formatDayLabel } from "@/lib/utils/date";

interface AuditDayGroupProps {
  day: AuditDay;
  resolveTarget: TargetResolver;
  openRows: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export function AuditDayGroup({ day, resolveTarget, openRows, onToggle }: AuditDayGroupProps) {
  return (
    <div>
      <div className="sticky top-0 z-[1] flex items-baseline justify-between gap-3 border-b border-[var(--text)] bg-[var(--bg)] px-2 pb-2 pt-4">
        <span className="font-heading text-lg font-semibold uppercase tracking-[.04em]">
          {formatDayLabel(day.dayKey)}
        </span>
        <span className="text-[11px] uppercase tracking-[.1em] text-[var(--neutral-700)]">
          {day.count} {day.count === 1 ? "evento" : "eventos"}
        </span>
      </div>

      {day.rows.map((row) => (
        <AuditRow
          key={row.id}
          row={row}
          resolveTarget={resolveTarget}
          isOpen={openRows[row.id] === true}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
