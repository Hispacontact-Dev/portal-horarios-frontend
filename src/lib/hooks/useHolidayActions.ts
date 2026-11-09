"use client";

import { useAsyncAction } from "@/lib/hooks/useAsyncAction";
import { createHoliday, deleteHoliday, importNationalHolidays, setHolidayBlocksShifts } from "@/lib/api/holidays";
import type { Holiday, HolidayCreate, HolidayImportResult } from "@/types/holiday";

interface ToggleBlocksShiftsArgs {
  date: string;
  blocksShifts: boolean;
}

export function useCreateHoliday() {
  return useAsyncAction<HolidayCreate, Holiday>(createHoliday);
}

export function useToggleHolidayBlocksShifts() {
  return useAsyncAction<ToggleBlocksShiftsArgs, Holiday>(({ date, blocksShifts }) =>
    setHolidayBlocksShifts(date, blocksShifts)
  );
}

export function useDeleteHoliday() {
  return useAsyncAction<string, string>(deleteHoliday);
}

export function useImportNationalHolidays() {
  return useAsyncAction<number, HolidayImportResult>(importNationalHolidays);
}
