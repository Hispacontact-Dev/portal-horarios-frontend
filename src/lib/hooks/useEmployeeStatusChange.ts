"use client";

import { useState } from "react";
import { updateEmployeeStatus } from "@/lib/api/employees";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { Employee } from "@/types/employee";

export interface UseEmployeeStatusChangeOptions {
  employeeId: string;
  onSuccess?: (employee: Employee) => void;
}

interface EmployeeStatusChangeState {
  isSubmitting: boolean;
  error: ClassifiedError | null;
}

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

export function useEmployeeStatusChange({ employeeId, onSuccess }: UseEmployeeStatusChangeOptions) {
  const [state, setState] = useState<EmployeeStatusChangeState>({
    isSubmitting: false,
    error: null,
  });

  async function changeStatus(newStatusId: string) {
    if (state.isSubmitting) return;
    setState({ isSubmitting: true, error: null });
    try {
      const updated = await updateEmployeeStatus(employeeId, newStatusId);
      setState({ isSubmitting: false, error: null });
      onSuccess?.(updated);
    } catch (err) {
      const classified = err instanceof ApiError ? classifyError(err) : null;
      setState({ isSubmitting: false, error: classified ?? UNKNOWN_ERROR });
    }
  }

  return { ...state, changeStatus };
}
