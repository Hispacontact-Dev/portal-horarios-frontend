"use client";

import { useAsyncAction } from "@/lib/hooks/useAsyncAction";
import { deleteShiftTemplate } from "@/lib/api/shiftTemplates";
import type { ShiftTemplateDeleted } from "@/types/shiftTemplate";

export function useDeleteShiftTemplate() {
  return useAsyncAction<string, ShiftTemplateDeleted>(deleteShiftTemplate);
}
