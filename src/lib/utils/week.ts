import type { Weekday } from "@/types/schedule";

export function mondayOf(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

export function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const WEEKDAY_BY_JS_DAY: Record<number, Weekday> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

/** Día de la semana de una fecha suelta (`YYYY-MM-DD`). */
export function weekdayOf(date: string): Weekday {
  return WEEKDAY_BY_JS_DAY[parseISODate(date).getDay()];
}

/** True si la fecha (`YYYY-MM-DD`) cae sábado o domingo. */
export function isWeekend(date: string): boolean {
  const jsDay = parseISODate(date).getDay();
  return jsDay === 0 || jsDay === 6;
}

/**
 * Las fechas (`YYYY-MM-DD`) entre dos extremos, fin de semana incluido. Vacío si el rango está mal
 * formado, que es como los editores detectan un rango inválido sin pegarle al backend.
 */
export function datesInRange(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate) return [];
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  if (start > end) return [];
  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(toISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/**
 * Fechas entre dos extremos que caen en alguno de los días de la semana indicados. No excluye el
 * fin de semana: un sábado se programa marcándolo en `weekdays`.
 */
export function datesForWeekdays(start: Date, end: Date, weekdays: Set<Weekday>): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const limit = new Date(end);
  limit.setHours(0, 0, 0, 0);
  while (cursor <= limit) {
    if (weekdays.has(WEEKDAY_BY_JS_DAY[cursor.getDay()])) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}
