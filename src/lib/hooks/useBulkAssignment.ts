"use client";

import { useAsyncAction } from "@/lib/hooks/useAsyncAction";
import { applyBulkAssignment } from "@/lib/api/schedules";
import type { BulkAssignmentInput, BulkAssignmentResult } from "@/types/schedule";

export function useBulkAssignment() {
  return useAsyncAction<BulkAssignmentInput, BulkAssignmentResult>(applyBulkAssignment);
}
