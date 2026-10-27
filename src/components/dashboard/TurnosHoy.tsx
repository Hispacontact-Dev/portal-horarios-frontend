"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Corners } from "./Corners";
import { ErrorState } from "@/components/ui/ErrorState";
import { Select } from "@/components/ui/Select";
import { useTodaySchedule } from "@/lib/hooks/useTodaySchedule";
import { useNowTick } from "@/lib/hooks/useNowTick";
import { nowAsDecimalHour, rowStatusLabel, type RowStatus } from "@/lib/utils/scheduleStatus";
import { filterByArea, filterByRowStatus, sortByRowPriority } from "@/lib/utils/scheduleLayout";
import { TurnosHoyHourRow } from "./turnos-hoy/TurnosHoyHourRow";
import { TurnosHoyRow } from "./turnos-hoy/TurnosHoyRow";
import { TurnosHoyNowLine } from "./turnos-hoy/TurnosHoyNowLine";
import { TurnosHoySkeletonRow } from "./turnos-hoy/TurnosHoySkeletonRow";

const ROW_STATUS_OPTIONS: RowStatus[] = ["sin_horario", "en_curso", "finalizado", "programado"];
const STAGGER_LIMIT = 10;

export function TurnosHoy() {
  const { state, retry } = useTodaySchedule();
  const nowTick = useNowTick();
  const [areaId, setAreaId] = useState<string | null>(null);
  const [rowStatus, setRowStatus] = useState<RowStatus | null>(null);

  const nowHour = nowAsDecimalHour(nowTick ?? new Date());

  const areaOptions = useMemo(() => {
    if (state.status !== "success") return [];
    const map = new Map<string, string>();
    for (const entry of state.data) map.set(entry.area_id, entry.area_name);
    return Array.from(map.entries());
  }, [state]);

  const visibleEntries = useMemo(() => {
    if (state.status !== "success") return [];
    const byArea = filterByArea(state.data, areaId);
    const byStatus = filterByRowStatus(byArea, rowStatus, nowHour);
    return sortByRowPriority(byStatus, nowHour);
  }, [state, areaId, rowStatus, nowHour]);

  return (
    <section className="panel anim-up flex flex-col gap-3 px-5 py-[18px]" style={{ animationDelay: ".3s" }}>
      <Corners />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">Turnos de hoy</h2>
        <div className="flex flex-wrap items-center gap-2">
          {state.status === "success" && areaOptions.length > 1 && (
            <Select
              value={areaId ?? ""}
              onChange={(e) => setAreaId(e.target.value || null)}
              className="h-7 text-xs"
              aria-label="Filtrar por área"
            >
              <option value="">Todas las áreas</option>
              {areaOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </Select>
          )}
          {state.status === "success" && (
            <Select
              value={rowStatus ?? ""}
              onChange={(e) => setRowStatus((e.target.value || null) as RowStatus | null)}
              className="h-7 text-xs"
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              {ROW_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {rowStatusLabel(status)}
                </option>
              ))}
            </Select>
          )}
          <Link
            href="/horarios"
            className="whitespace-nowrap text-[13px] text-[var(--accent-700)] hover:text-[var(--accent-800)]"
          >
            Ver horarios →
          </Link>
        </div>
      </div>

      {state.status === "loading" && (
        <div className="flex flex-col">
          <TurnosHoyHourRow />
          {Array.from({ length: 6 }, (_, i) => (
            <TurnosHoySkeletonRow key={i} />
          ))}
        </div>
      )}

      {state.status === "error" && <ErrorState message={state.error.message} onRetry={retry} />}

      {state.status === "empty" && (
        <div className="rounded border border-dashed border-[var(--divider)] px-4 py-6 text-center text-sm text-[var(--neutral-700)]">
          No hay turnos programados para hoy.{" "}
          <Link href="/horarios" className="font-medium text-[var(--accent-700)] hover:text-[var(--accent-800)]">
            + Nuevo horario
          </Link>
        </div>
      )}

      {state.status === "success" && (
        <div className="flex flex-col">
          <TurnosHoyHourRow />
          <div className="relative">
            <div role="list" className="flex max-h-[460px] flex-col overflow-y-auto">
              {visibleEntries.map((entry, i) => (
                <TurnosHoyRow
                  key={entry.employee_id}
                  entry={entry}
                  nowHour={nowHour}
                  animationDelay={`${0.35 + Math.min(i, STAGGER_LIMIT) * 0.07}s`}
                />
              ))}
            </div>
            <TurnosHoyNowLine />
          </div>
        </div>
      )}
    </section>
  );
}
