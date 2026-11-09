"use client";

import { useAsyncResource } from "@/lib/hooks/useAsyncResource";
import { getWeekSchedule } from "@/lib/api/schedules";
import { holidayName, isHoliday } from "@/lib/utils/holidays";
import { isWeekend } from "@/lib/utils/week";
import type { ScheduleDayEntry, WeekScheduleResponse } from "@/types/schedule";

// Overlays de solo lectura (nunca se escriben al backend) — RF-5, RNF-3, specs/005-horarios/plan.md
// sección 3.2. Solo aplican cuando el día viene del horario habitual (`source: "default"`): una excepción
// explícita (día u rango) ya resuelta por el backend siempre prevalece sobre el feriado automático.
function displayDayEntry(entry: ScheduleDayEntry): ScheduleDayEntry {
  if (entry.source === "default" && isHoliday(entry.date)) {
    return { ...entry, status_name: holidayName(entry.date) ?? "Día libre", modality: null, time_ranges: [] };
  }
  // El fin de semana es descanso salvo que se le haya programado un turno: sin franjas se nombra
  // así en vez de arrastrar el Estado de la persona, que leería como un día hábil sin horario.
  if (entry.source === "default" && entry.time_ranges.length === 0 && isWeekend(entry.date)) {
    return { ...entry, status_name: "Descanso", modality: null };
  }
  return entry;
}

export function useWeekSchedule(weekOffset: number) {
  return useAsyncResource<WeekScheduleResponse>(
    async (signal) => {
      const response = await getWeekSchedule(weekOffset, signal);
      return {
        ...response,
        employees: response.employees.map((employee) => ({
          ...employee,
          days: employee.days.map(displayDayEntry),
        })),
      };
    },
    [weekOffset],
    { isEmpty: (data) => data.employees.length === 0 },
  );
}
