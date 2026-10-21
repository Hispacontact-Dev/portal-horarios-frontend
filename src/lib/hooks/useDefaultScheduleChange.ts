"use client";

import { useAsyncAction } from "@/lib/hooks/useAsyncAction";
import { updateDefaultSchedule } from "@/lib/api/schedules";
import type { DefaultScheduleChangeInput, EmployeeDefaultSchedule } from "@/types/schedule";

export function useDefaultScheduleChange() {
  return useAsyncAction<DefaultScheduleChangeInput, EmployeeDefaultSchedule>(updateDefaultSchedule);
}
