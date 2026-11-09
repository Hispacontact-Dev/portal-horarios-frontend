
// La semana del portal va de lunes a domingo: el fin de semana normalmente es descanso, pero hay
// sábados y domingos que se trabajan y deben poder programarse.
export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

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
  // `null` cuando el día sale del horario habitual (`source: "default"`): todavía no existe
  // ninguna excepción guardada para esa fecha, así que no hay versión que comparar.
  updated_at: string | null;
  source: "default" | "day_override" | "range_override" | "shift_override";
}

export interface EmployeeWeekSchedule {
  employee_id: string;
  full_name: string;
  position: string;
  // El backend no incluye area_id en GET /schedules/week, solo area_name.
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
  // Se reenvía tal cual lo entregó `GET /schedules/week`, incluido el `null` de un día sin
  // excepción: el backend compara por igualdad exacta y la clave es obligatoria en el payload.
  expected_updated_at: string | null;
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
  // Nombre de área, no id: /schedules/week no devuelve area_id, solo area_name.
  area_name: string | null;
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
