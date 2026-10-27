import type { TodayScheduleEntry } from "@/lib/hooks/useTodaySchedule";
import {
  TIMELINE_END_HOUR,
  TIMELINE_SPAN_HOURS,
  TIMELINE_START_HOUR,
  classifyDayEntry,
  rowPriorityRank,
  rowPriorityStatus,
  type ClassifiedRange,
  type RowStatus,
} from "@/lib/utils/scheduleStatus";

// Posicionamiento puro del timeline (06:00–22:00) — separado de scheduleStatus.ts porque aquí
// solo importan coordenadas en %, no la clasificación en sí.

export function rangeToBarPosition(cr: ClassifiedRange): { leftPct: number; widthPct: number } {
  const leftPct = ((cr.startHour - TIMELINE_START_HOUR) / TIMELINE_SPAN_HOURS) * 100;
  const widthPct = ((cr.endHour - cr.startHour) / TIMELINE_SPAN_HOURS) * 100;
  return { leftPct, widthPct: Math.max(0, widthPct) };
}

export function nowLineFraction(nowHour: number): number | null {
  if (nowHour < TIMELINE_START_HOUR || nowHour > TIMELINE_END_HOUR) return null;
  return (nowHour - TIMELINE_START_HOUR) / TIMELINE_SPAN_HOURS;
}

export function filterByArea(entries: TodayScheduleEntry[], areaId: string | null): TodayScheduleEntry[] {
  if (!areaId) return entries;
  return entries.filter((entry) => entry.area_id === areaId);
}

export function filterByRowStatus(
  entries: TodayScheduleEntry[],
  status: RowStatus | null,
  nowHour: number,
): TodayScheduleEntry[] {
  if (!status) return entries;
  return entries.filter((entry) => rowPriorityStatus(classifyDayEntry(entry.day, nowHour)) === status);
}

export function sortByRowPriority(entries: TodayScheduleEntry[], nowHour: number): TodayScheduleEntry[] {
  return [...entries].sort((a, b) => {
    const rankA = rowPriorityRank(rowPriorityStatus(classifyDayEntry(a.day, nowHour)));
    const rankB = rowPriorityRank(rowPriorityStatus(classifyDayEntry(b.day, nowHour)));
    return rankA - rankB;
  });
}
