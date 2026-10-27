"use client";

import { useAsyncResource } from "@/lib/hooks/useAsyncResource";
import { getDefaultSchedule } from "@/lib/api/schedules";
import type { EmployeeDefaultSchedule } from "@/types/schedule";

export function useEmployeeDefaultSchedule(employeeId: string) {
  return useAsyncResource<EmployeeDefaultSchedule>(
    (signal) => getDefaultSchedule(employeeId, signal),
    [employeeId],
    { isEmpty: (data) => data.days.length === 0 },
  );
}
