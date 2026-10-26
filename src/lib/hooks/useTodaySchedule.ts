"use client";

import { useWeekSchedule } from "@/lib/hooks/useWeekSchedule";
import type { AsyncResourceState } from "@/lib/hooks/useAsyncResource";
import type { ScheduleDayEntry, WeekScheduleResponse } from "@/types/schedule";

// Deriva las entradas de "hoy" a partir de la semana que useWeekSchedule(0) ya trae — RF-1, RF-2, RNF-3,
// specs/007-dashboard-vistazo-diario/plan.md sección 3.1. No pide ningún endpoint nuevo.

export interface TodayScheduleEntry {
  employee_id: string;
  full_name: string;
  area_name: string;
  day: ScheduleDayEntry;
}

function deriveTodayEntries(data: WeekScheduleResponse): TodayScheduleEntry[] {
  const today = data.server_today;
  return data.employees
    .filter((employee) => employee.is_active)
    .flatMap((employee) => {
      const day = employee.days.find((d) => d.date === today);
      return day
        ? [{ employee_id: employee.employee_id, full_name: employee.full_name, area_name: employee.area_name, day }]
        : [];
    });
}

export function useTodaySchedule() {
  const { state: weekState, retry } = useWeekSchedule(0);

  if (weekState.status === "loading") {
    return { state: { status: "loading", data: null, error: null } as AsyncResourceState<TodayScheduleEntry[]>, retry };
  }
  if (weekState.status === "error") {
    return { state: weekState, retry };
  }

  const entries = deriveTodayEntries(weekState.data);
  const state: AsyncResourceState<TodayScheduleEntry[]> =
    entries.length === 0
      ? { status: "empty", data: entries, error: null, emptyReason: "no_data" }
      : { status: "success", data: entries, error: null };

  return { state, retry };
}
