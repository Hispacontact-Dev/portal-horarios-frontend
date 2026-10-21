// TODO: el backend todavía no expone endpoints de Horarios — ver specs/005-horarios/plan.md sección 7.

import { apiFetch } from "@/lib/api/client";
import type {
  WeekScheduleResponse,
  DayStatusChangeInput,
  DateRangeStatusChangeInput,
  DefaultScheduleChangeInput,
  EmployeeDefaultSchedule,
  ScheduleDayEntry,
} from "@/types/schedule";

export async function getWeekSchedule(weekOffset: number, signal?: AbortSignal): Promise<WeekScheduleResponse> {
  return apiFetch<WeekScheduleResponse>(`/schedules/week?offset=${weekOffset}`, { signal });
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
  expectedUpdatedAt: string,
): Promise<ScheduleDayEntry> {
  return apiFetch<ScheduleDayEntry>("/schedules/day-status/revert", {
    method: "PATCH",
    body: JSON.stringify({ employee_id: employeeId, date, expected_updated_at: expectedUpdatedAt }),
  });
}

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
