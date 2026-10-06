"use client";

import { useEffect, useState } from "react";
import { listEmployees } from "@/lib/api/employees";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { Employee } from "@/types/employee";

type EmployeesState =
  | { status: "loading"; employees: Employee[]; error: null }
  | { status: "success"; employees: Employee[]; error: null }
  | { status: "error"; employees: Employee[]; error: ClassifiedError };

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

export function useEmployees() {
  const [state, setState] = useState<EmployeesState>({
    status: "loading",
    employees: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    listEmployees()
      .then((employees) => {
        if (!cancelled) setState({ status: "success", employees, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const classified = err instanceof ApiError ? classifyError(err) : null;
        setState({ status: "error", employees: [], error: classified ?? UNKNOWN_ERROR });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
