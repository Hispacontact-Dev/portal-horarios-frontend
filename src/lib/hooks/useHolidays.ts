"use client";

import { useAsyncResource } from "@/lib/hooks/useAsyncResource";
import { listHolidays } from "@/lib/api/holidays";

export function useHolidays(year: number) {
  return useAsyncResource(
    (signal) => listHolidays(year, signal),
    [year],
  );
}
