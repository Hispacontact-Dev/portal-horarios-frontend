import { apiFetch } from "@/lib/api/client";
import type {
  WeekScheduleResponse,
  DayStatusChangeInput,
  DateRangeStatusChangeInput,
  DefaultScheduleChangeInput,
  EmployeeDefaultSchedule,
  ScheduleDayEntry,
  BulkAssignmentInput,
  BulkAssignmentResult,
} from "@/types/schedule";

export async function getWeekSchedule(weekOffset: number, signal?: AbortSignal): Promise<WeekScheduleResponse> {
  return apiFetch<WeekScheduleResponse>(`/schedules/week?offset=${weekOffset}`, { signal });
}

export async function getDefaultSchedule(
  employeeId: string,
  signal?: AbortSignal,
): Promise<EmployeeDefaultSchedule> {
  return apiFetch<EmployeeDefaultSchedule>(`/schedules/default/${employeeId}`, { signal });
}

export async function setDayStatus(input: DayStatusChangeInput): Promise<ScheduleDayEntry> {
  return apiFetch<ScheduleDayEntry>("/schedules/day-status", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function revertDayToDefault(
  employeeId: string,
  date: string,
  expectedUpdatedAt: string | null,
): Promise<ScheduleDayEntry> {
  return apiFetch<ScheduleDayEntry>("/schedules/day-status/revert", {
    method: "PATCH",
    body: JSON.stringify({ employee_id: employeeId, date, expected_updated_at: expectedUpdatedAt }),
  });
}

/**
 * El portal NO usa este endpoint: escribe las excepciones con `source: "range_override"`, que el
 * backend no sabe borrar (`revert_day_exception` lo ignora y `apply_day_exception` lo rechaza con
 * 409), así que una novedad guardada por acá queda congelada para siempre. Las novedades de varios
 * días se aplican día por día con `setDayStatus` — ver `lib/hooks/useDayStatusRange.ts`. Se
 * conserva el wrapper solo como registro del contrato del backend.
 */
export async function setDateRangeStatus(input: DateRangeStatusChangeInput): Promise<ScheduleDayEntry[]> {
  return apiFetch<ScheduleDayEntry[]>("/schedules/range-status", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateDefaultSchedule(input: DefaultScheduleChangeInput): Promise<EmployeeDefaultSchedule> {
  return apiFetch<EmployeeDefaultSchedule>(`/schedules/default/${input.employee_id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function applyBulkAssignment(input: BulkAssignmentInput): Promise<BulkAssignmentResult> {
  return apiFetch<BulkAssignmentResult>("/schedules/bulk", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
