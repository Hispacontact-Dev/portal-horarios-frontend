"use client";

import { useState } from "react";
import { clearEmployeeIfAreaMismatch, reconcileFilters } from "@/lib/utils/scheduleFilters";
import type { EmployeeWeekSchedule, ScheduleFilters } from "@/types/schedule";

const EMPTY_FILTERS: ScheduleFilters = { employee_id: null, area_name: null, status_id: null };

export function useScheduleFilters(employees: EmployeeWeekSchedule[]) {
  const [filters, setFilters] = useState<ScheduleFilters>(EMPTY_FILTERS);

  function setFilter<K extends keyof ScheduleFilters>(key: K, value: ScheduleFilters[K]) {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      return key === "employee_id" ? reconcileFilters(next, employees) : clearEmployeeIfAreaMismatch(next, employees);
    });
  }

  function clearAll() {
    setFilters(EMPTY_FILTERS);
  }

  return { filters, setFilter, clearAll };
}
