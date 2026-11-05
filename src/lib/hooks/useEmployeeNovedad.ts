"use client";

import { useAsyncResource } from "@/lib/hooks/useAsyncResource";
import { getWeekSchedule } from "@/lib/api/schedules";
import { addDaysToDayKey } from "@/lib/utils/date";
import type { ScheduleDayEntry } from "@/types/schedule";

// La novedad vigente de un empleado: el Estado especial que tiene asignado y el rango de días que
// cubre. El backend no expone un listado de excepciones por empleado, así que se reconstruye desde
// `GET /schedules/week`: se arranca en la semana en curso y solo se piden semanas vecinas mientras
// el rango siga tocando el borde de lo ya cargado. Un rango de pocos días cuesta una sola petición.

const MAX_WEEK_SCAN = 8;

export interface NovedadDay {
  date: string;
  updatedAt: string | null;
  source: ScheduleDayEntry["source"];
}

export interface EmployeeNovedad {
  statusId: string;
  statusName: string;
  startDate: string;
  endDate: string;
  /** Cada día con su `source`: el panel distingue los que nacieron de una asignación masiva, que el
   * backend no deja editar ni quitar. */
  days: NovedadDay[];
  /** El rango seguía al llegar al límite de semanas revisables, así que puede estar recortado. */
  clipped: boolean;
}

export interface EmployeeNovedadState {
  serverToday: string;
  /** El día de hoy tal como lo resuelve el backend (novedad si la hay, horario habitual si no). */
  todayEntry: ScheduleDayEntry | undefined;
  novedad: EmployeeNovedad | null;
  /** `updated_at` por fecha de todo lo que se alcanzó a cargar, para el control de concurrencia. */
  knownUpdatedAt: Record<string, string | null>;
}

function isNovedadDay(entry: ScheduleDayEntry | undefined, statusId: string): boolean {
  return entry !== undefined && entry.source !== "default" && entry.status_id === statusId;
}

async function loadNovedad(employeeId: string, signal: AbortSignal): Promise<EmployeeNovedadState> {
  const byDate = new Map<string, ScheduleDayEntry>();

  async function loadWeek(offset: number): Promise<string> {
    const response = await getWeekSchedule(offset, signal);
    const employee = response.employees.find((entry) => entry.employee_id === employeeId);
    employee?.days.forEach((day) => byDate.set(day.date, day));
    return response.server_today;
  }

  const serverToday = await loadWeek(0);
  const loadedDates = [...byDate.keys()].sort();
  let earliest = loadedDates[0] ?? serverToday;
  let latest = loadedDates[loadedDates.length - 1] ?? serverToday;
  let minOffset = 0;
  let maxOffset = 0;

  const todayEntry = byDate.get(serverToday);
  // Ancla: la novedad de hoy si la hay; si no, la primera de la semana en curso a partir de hoy —
  // así una incapacidad que empieza mañana también se encuentra al abrir la ficha.
  const anchor =
    todayEntry !== undefined && todayEntry.source !== "default"
      ? todayEntry
      : loadedDates
          .filter((date) => date >= serverToday)
          .map((date) => byDate.get(date))
          .find((entry) => entry !== undefined && entry.source !== "default");

  if (anchor === undefined) {
    return {
      serverToday,
      todayEntry,
      novedad: null,
      knownUpdatedAt: Object.fromEntries([...byDate.values()].map((day) => [day.date, day.updated_at])),
    };
  }

  const statusId = anchor.status_id;
  let startDate = anchor.date;
  let endDate = anchor.date;

  function expand(): void {
    for (let prev = addDaysToDayKey(startDate, -1); isNovedadDay(byDate.get(prev), statusId); prev = addDaysToDayKey(startDate, -1)) {
      startDate = prev;
    }
    for (let next = addDaysToDayKey(endDate, 1); isNovedadDay(byDate.get(next), statusId); next = addDaysToDayKey(endDate, 1)) {
      endDate = next;
    }
  }

  expand();
  // Solo se piden semanas vecinas si el rango llega al borde de lo cargado: ahí puede continuar.
  while (startDate === earliest && minOffset > -MAX_WEEK_SCAN) {
    minOffset -= 1;
    await loadWeek(minOffset);
    earliest = [...byDate.keys()].sort()[0] ?? earliest;
    expand();
  }
  while (endDate === latest && maxOffset < MAX_WEEK_SCAN) {
    maxOffset += 1;
    await loadWeek(maxOffset);
    const sorted = [...byDate.keys()].sort();
    latest = sorted[sorted.length - 1] ?? latest;
    expand();
  }

  const days: NovedadDay[] = [];
  for (let date = startDate; date <= endDate; date = addDaysToDayKey(date, 1)) {
    const entry = byDate.get(date);
    if (entry === undefined) continue;
    days.push({ date, updatedAt: entry.updated_at, source: entry.source });
  }

  return {
    serverToday,
    todayEntry,
    novedad: {
      statusId,
      statusName: anchor.status_name,
      startDate,
      endDate,
      days,
      clipped: startDate === earliest || endDate === latest,
    },
    knownUpdatedAt: Object.fromEntries([...byDate.values()].map((day) => [day.date, day.updated_at])),
  };
}

export function useEmployeeNovedad(employeeId: string) {
  return useAsyncResource<EmployeeNovedadState>(
    (signal) => loadNovedad(employeeId, signal),
    [employeeId],
    { isEmpty: () => false },
  );
}
