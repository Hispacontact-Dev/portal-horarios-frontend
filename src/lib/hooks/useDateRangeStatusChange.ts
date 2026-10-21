"use client";

import { useState } from "react";
import { useAsyncAction } from "@/lib/hooks/useAsyncAction";
import { setDateRangeStatus } from "@/lib/api/schedules";
import { ApiError } from "@/lib/api/client";
import type { DateRangeStatusChangeInput, ScheduleDayEntry } from "@/types/schedule";

const WEEKDAY_NUMBERS = new Set([1, 2, 3, 4, 5]); // lunes-viernes (Date#getDay: 0 = domingo, 6 = sábado)

function onlyWeekdays(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  while (cursor <= end) {
    if (WEEKDAY_NUMBERS.has(cursor.getDay())) dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function useDateRangeStatusChange() {
  const [overlappingDates, setOverlappingDates] = useState<string[]>([]);

  async function submit(input: DateRangeStatusChangeInput): Promise<ScheduleDayEntry[]> {
    if (onlyWeekdays(input.start_date, input.end_date).length === 0) {
      // Validación local, sin red: el rango elegido cae enteramente en fin de semana — RF-3.
      throw new Error("El rango seleccionado no incluye ningún día hábil");
    }
    try {
      const result = await setDateRangeStatus(input);
      setOverlappingDates([]);
      return result;
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Mismo patrón que useCatalogDisable.ts: leer un campo extra de err.body además de clasificarlo — RF-3.
        const dates = err.body?.overlapping_dates;
        setOverlappingDates(Array.isArray(dates) ? (dates as string[]) : []);
      }
      throw err;
    }
  }

  const action = useAsyncAction<DateRangeStatusChangeInput, ScheduleDayEntry[]>(submit);
  return { ...action, overlappingDates };
}
