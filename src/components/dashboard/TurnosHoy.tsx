"use client";

import Link from "next/link";
import { Corners } from "./Corners";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { useTodaySchedule } from "@/lib/hooks/useTodaySchedule";

export function TurnosHoy() {
  const { state, retry } = useTodaySchedule();

  return (
    <section className="panel anim-up flex flex-col gap-3 px-5 py-[18px]" style={{ animationDelay: ".3s" }}>
      <Corners />
      <div className="flex items-baseline justify-between">
        <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">Turnos de hoy</h2>
        <Link href="/horarios" className="whitespace-nowrap text-[13px] text-[var(--accent-700)] hover:text-[var(--accent-800)]">
          Ver horarios →
        </Link>
      </div>

      {state.status === "loading" && <Spinner />}
      {state.status === "error" && <ErrorState message={state.error.message} onRetry={retry} />}
      {state.status === "empty" && <EmptyState message="No hay nadie programado para hoy." />}
      {state.status === "success" && (
        <div className="flex flex-col">
          {state.data.map((entry) => {
            const label =
              entry.day.time_ranges.length > 0
                ? `${entry.day.status_name} · ${entry.day.time_ranges[0].start}–${entry.day.time_ranges[0].end}`
                : entry.day.status_name;
            return (
              <div
                key={entry.employee_id}
                className="grid grid-cols-[190px_minmax(0,1fr)] items-center gap-2 border-t border-[var(--divider)] py-2.5"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{entry.full_name}</span>
                  <span className="text-[11px] text-[var(--neutral-700)]">{entry.area_name}</span>
                </div>
                <Badge className={entry.day.modality ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>
                  {label}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
