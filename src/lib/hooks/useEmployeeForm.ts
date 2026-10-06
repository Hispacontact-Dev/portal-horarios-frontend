"use client";

import { useState } from "react";
import { createEmployee, updateEmployee } from "@/lib/api/employees";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { Employee, EmployeePosition } from "@/types/employee";

export type EmployeeFormMode = "create" | "edit";

export interface EmployeeFormValues {
  full_name: string;
  position: EmployeePosition;
  area_id: string;
  // Se precarga y se muestra en ambos modos (RF-3), pero en modo "edit" no se
  // envía en el PATCH (EmployeeUpdate no tiene status_id). El cambio real de
  // Estado es la tarea 21 (updateEmployeeStatus); por eso el <select>
  // correspondiente queda deshabilitado en EmployeeForm cuando mode === "edit".
  status_id: string;
}

export interface UseEmployeeFormOptions {
  mode: EmployeeFormMode;
  employeeId?: string;
  initialEmployee?: Employee;
  onSuccess?: (employee: Employee) => void;
}

interface EmployeeFormState {
  values: EmployeeFormValues;
  isSubmitting: boolean;
  error: ClassifiedError | null;
}

const EMPTY_VALUES: EmployeeFormValues = {
  full_name: "",
  position: "lider",
  area_id: "",
  status_id: "",
};

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

function valuesFromEmployee(employee?: Employee): EmployeeFormValues {
  if (!employee) return EMPTY_VALUES;
  return {
    full_name: employee.full_name,
    position: employee.position,
    area_id: employee.area_id,
    status_id: employee.status_id,
  };
}

export function useEmployeeForm({
  mode,
  employeeId,
  initialEmployee,
  onSuccess,
}: UseEmployeeFormOptions) {
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
      const result =
        mode === "create"
          ? await createEmployee({
              full_name: values.full_name,
              position: values.position,
              area_id: values.area_id,
              status_id: values.status_id,
            })
          : await updateEmployee(employeeId as string, {
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
