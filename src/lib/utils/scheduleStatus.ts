import type { CSSProperties } from "react";
import type { ScheduleDayEntry, TimeRange } from "@/types/schedule";

// Clasificación 100% estructural del turno de un día: se deriva solo de time_ranges (dato real)
// y la hora actual, nunca de status_name — el catálogo de Estados es abierto (RH puede crear
// estados personalizados) y no hay dato real de hora de entrada, así que no existe un mapeo
// fijo de "Presente/Tarde/Ausente/..." posible. Ver specs/007-dashboard-vistazo-diario/plan.md.

export const TIMELINE_START_HOUR = 6;
export const TIMELINE_END_HOUR = 22;
export const TIMELINE_SPAN_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR;

export type RangeRuntimeStatus = "programado" | "en_curso" | "finalizado";
export type RowStatus = "sin_horario" | "en_curso" | "finalizado" | "programado";

export interface ClassifiedRange {
  range: TimeRange;
  status: RangeRuntimeStatus;
  startHour: number;
  endHour: number;
  isLeftCut: boolean;
  isRightCut: boolean;
  isOutOfView: boolean;
}

export type DayClassification =
  | { kind: "sin_horario" }
  | { kind: "con_horario"; ranges: ClassifiedRange[] };

export function timeToDecimalHour(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h + m / 60;
}

export function nowAsDecimalHour(date: Date = new Date()): number {
  return date.getHours() + date.getMinutes() / 60;
}

function clampToTimeline(value: number): number {
  return Math.min(TIMELINE_END_HOUR, Math.max(TIMELINE_START_HOUR, value));
}

export function rangeRuntimeStatus(range: TimeRange, nowHour: number): RangeRuntimeStatus {
  const start = timeToDecimalHour(range.start);
  let end = timeToDecimalHour(range.end);
  if (end <= start) end += 24; // turno nocturno, ej. 22:00–06:00
  if (nowHour < start) return "programado";
  if (nowHour > end) return "finalizado";
  return "en_curso";
}

export function rangeProgressPct(range: TimeRange, nowHour: number): number {
  const start = timeToDecimalHour(range.start);
  let end = timeToDecimalHour(range.end);
  if (end <= start) end += 24;
  if (nowHour <= start) return 0;
  if (nowHour >= end) return 100;
  return Math.round(((nowHour - start) / (end - start)) * 100);
}

export function classifyTimeRange(range: TimeRange, nowHour: number): ClassifiedRange {
  const start = timeToDecimalHour(range.start);
  let end = timeToDecimalHour(range.end);
  if (end <= start) end += 24;

  const clampedStart = clampToTimeline(start);
  const clampedEnd = clampToTimeline(end);

  return {
    range,
    status: rangeRuntimeStatus(range, nowHour),
    startHour: clampedStart,
    endHour: clampedEnd,
    isLeftCut: start < TIMELINE_START_HOUR,
    isRightCut: end > TIMELINE_END_HOUR,
    isOutOfView: clampedEnd - clampedStart <= 0,
  };
}

export function classifyDayEntry(day: ScheduleDayEntry, nowHour: number): DayClassification {
  if (day.time_ranges.length === 0) return { kind: "sin_horario" };
  return { kind: "con_horario", ranges: day.time_ranges.map((r) => classifyTimeRange(r, nowHour)) };
}

// Prioridad para ordenar filas y para el filtro estructural de "Estado": lo que requiere
// atención primero. "Fuera de rango" se trata como variante de "sin_horario" a estos efectos.
const ROW_PRIORITY: RowStatus[] = ["sin_horario", "en_curso", "finalizado", "programado"];

export function rowPriorityStatus(classification: DayClassification): RowStatus {
  if (classification.kind === "sin_horario") return "sin_horario";
  const visibleRanges = classification.ranges.filter((r) => !r.isOutOfView);
  if (visibleRanges.length === 0) return "sin_horario";
  for (const status of ROW_PRIORITY) {
    if (status === "sin_horario") continue;
    if (visibleRanges.some((r) => r.status === status)) return status;
  }
  return "programado";
}

export function rowPriorityRank(status: RowStatus): number {
  return ROW_PRIORITY.indexOf(status);
}

export interface StatusVisualProps {
  className: string;
  style?: CSSProperties;
}

const ABSENCE_STRIPES: CSSProperties = {
  backgroundImage: "repeating-linear-gradient(45deg, #cfcfd1 0 4px, transparent 4px 8px)",
};

export function statusVisualProps(status: RangeRuntimeStatus | "sin_horario" | "fuera_de_rango"): StatusVisualProps {
  switch (status) {
    case "en_curso":
      return { className: "border border-[#6f93b8] bg-[var(--accent)] text-[var(--bg)]" };
    case "finalizado":
      return { className: "border border-[#6f93b8] bg-[var(--accent-700)] text-[var(--bg)]" };
    case "programado":
      return { className: "border border-[#6f93b8] bg-transparent text-[var(--accent-800)]" };
    case "sin_horario":
      return { className: "border border-[var(--divider)] text-[#3b3b3d]", style: ABSENCE_STRIPES };
    case "fuera_de_rango":
      return { className: "border border-[var(--divider)] text-[var(--neutral-700)]" };
  }
}

export function rowStatusLabel(status: RowStatus): string {
  switch (status) {
    case "sin_horario":
      return "Sin horario";
    case "en_curso":
      return "En curso";
    case "finalizado":
      return "Finalizado";
    case "programado":
      return "Programado";
  }
}

export function rangeStatusLabel(status: RangeRuntimeStatus): string {
  switch (status) {
    case "en_curso":
      return "En curso";
    case "finalizado":
      return "Finalizado";
    case "programado":
      return "Programado";
  }
}
