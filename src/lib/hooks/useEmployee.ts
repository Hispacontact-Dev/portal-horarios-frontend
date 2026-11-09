"use client";

import { useEffect, useState } from "react";
import { getEmployee } from "@/lib/api/employees";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { Employee } from "@/types/employee";

type EmployeeState =
  | { status: "loading"; employee: null; error: null }
  | { status: "success"; employee: Employee; error: null }
  | { status: "error"; employee: null; error: ClassifiedError };

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

export function useEmployee(id: string) {
  const [state, setState] = useState<EmployeeState>({
    status: "loading",
    employee: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", employee: null, error: null });

    getEmployee(id)
      .then((employee) => {
        if (!cancelled) setState({ status: "success", employee, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const classified = err instanceof ApiError ? classifyError(err) : null;
        setState({ status: "error", employee: null, error: classified ?? UNKNOWN_ERROR });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  function setEmployee(employee: Employee) {
    setState({ status: "success", employee, error: null });
  }

  return { ...state, setEmployee };
}
