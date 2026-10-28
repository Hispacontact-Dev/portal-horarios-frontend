import type { EmployeePosition } from "@/types/employee";

export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday";

export interface TimeRange {
  start: string;
  end: string;
}

export interface DefaultScheduleDay {
  weekday: Weekday;
  works: boolean;
  modality: "presencial" | "virtual" | null;
  time_ranges: TimeRange[];
}

export interface EmployeeDefaultSchedule {
  employee_id: string;
  days: DefaultScheduleDay[];
  effective_from: string;
}

export interface ScheduleDayEntry {
  employee_id: string;
  date: string;
  status_id: string;
  status_name: string;
  modality: "presencial" | "virtual" | null;
  time_ranges: TimeRange[];
  observation: string | null;
  updated_at: string;
  source: "default" | "day_override" | "range_override" | "shift_override";
}

export interface EmployeeWeekSchedule {
  employee_id: string;
  full_name: string;
  position: EmployeePosition;
  area_id: string;
  area_name: string;
  is_active: boolean;
  days: ScheduleDayEntry[];
}

export interface WeekScheduleResponse {
  week_start: string;
  week_end: string;
  server_today: string;
  week_offset: number;
  can_navigate_prev: boolean;
  can_navigate_next: boolean;
  employees: EmployeeWeekSchedule[];
}

export interface DayStatusChangeInput {
  employee_id: string;
  date: string;
  status_id: string;
  observation?: string;
  expected_updated_at: string;
}

export interface DateRangeStatusChangeInput {
  employee_id: string;
  start_date: string;
  end_date: string;
  status_id: string;
}

export interface DefaultScheduleChangeInput {
  employee_id: string;
  days: DefaultScheduleDay[];
}

export interface ScheduleFilters {
  employee_id: string | null;
  area_id: string | null;
  status_id: string | null;
}

export type BulkAssignmentKind = "shift" | "status";

export type BulkAssignmentInput =
  | {
      employee_ids: string[];
      start_date: string;
      end_date: string;
      weekdays: Weekday[];
      kind: "shift";
      modality: "presencial" | "virtual";
      time_ranges: TimeRange[];
    }
  | {
      employee_ids: string[];
      start_date: string;
      end_date: string;
      weekdays: Weekday[];
      kind: "status";
      status_id: string;
    };

export interface BulkAssignmentSkipped {
  employee_id: string;
  skipped_date: string | null;
  reason: string;
}

export interface BulkAssignmentResult {
  created: ScheduleDayEntry[];
  skipped: BulkAssignmentSkipped[];
}
