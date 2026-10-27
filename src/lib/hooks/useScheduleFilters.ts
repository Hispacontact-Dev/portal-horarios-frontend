"use client";

import { useState } from "react";
import { reconcileFilters } from "@/lib/utils/scheduleFilters";
import type { EmployeeWeekSchedule, ScheduleFilters } from "@/types/schedule";

const EMPTY_FILTERS: ScheduleFilters = { employee_id: null, area_id: null, status_id: null };

export function useScheduleFilters(employees: EmployeeWeekSchedule[]) {
  const [filters, setFilters] = useState<ScheduleFilters>(EMPTY_FILTERS);

  function setFilter<K extends keyof ScheduleFilters>(key: K, value: ScheduleFilters[K]) {
    setFilters((prev) => reconcileFilters({ ...prev, [key]: value }, employees));
  }

  function clearAll() {
    setFilters(EMPTY_FILTERS);
  }

  return { filters, setFilter, clearAll };
}
