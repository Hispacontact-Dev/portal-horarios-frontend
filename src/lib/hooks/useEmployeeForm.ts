"use client";

import { useState } from "react";
import { updateEmployee } from "@/lib/api/employees";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { Employee, EmployeePosition } from "@/types/employee";

export interface EmployeeFormValues {
  full_name: string;
  position: EmployeePosition;
  area_id: string;
  // Se precarga y se muestra, pero no se envía en el PATCH (EmployeeUpdate no tiene
  // status_id). El cambio real de Estado es aparte (updateEmployeeStatus); por eso el
  // <select> correspondiente queda deshabilitado en EmployeeForm.
  status_id: string;
}

export interface UseEmployeeFormOptions {
  employeeId: string;
  initialEmployee: Employee;
  onSuccess?: (employee: Employee) => void;
}

interface EmployeeFormState {
  values: EmployeeFormValues;
  isSubmitting: boolean;
  error: ClassifiedError | null;
}

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

function valuesFromEmployee(employee: Employee): EmployeeFormValues {
  return {
    full_name: employee.full_name,
    position: employee.position,
    area_id: employee.area_id,
    status_id: employee.status_id,
  };
}

export function useEmployeeForm({ employeeId, initialEmployee, onSuccess }: UseEmployeeFormOptions) {
  const [state, setState] = useState<EmployeeFormState>(() => ({
    values: valuesFromEmployee(initialEmployee),
    isSubmitting: false,
    error: null,
  }));

  function setField<K extends keyof EmployeeFormValues>(field: K, value: EmployeeFormValues[K]) {
    setState((prev) => ({ ...prev, values: { ...prev.values, [field]: value } }));
  }

  async function submit(values: EmployeeFormValues) {
    if (state.isSubmitting) return;

    // Nunca limpiar los datos ingresados antes de confirmar éxito (RNF-4, plan.md 3.2).
    setState((prev) => ({ ...prev, values, isSubmitting: true, error: null }));

    try {
      const result = await updateEmployee(employeeId, {
        full_name: values.full_name,
        position: values.position,
        area_id: values.area_id,
      });

      setState((prev) => ({ ...prev, isSubmitting: false, error: null }));
      onSuccess?.(result);
    } catch (err) {
      const classified = err instanceof ApiError ? classifyError(err) : null;
      setState((prev) => ({ ...prev, isSubmitting: false, error: classified ?? UNKNOWN_ERROR }));
    }
  }

  return { ...state, setField, submit };
}
