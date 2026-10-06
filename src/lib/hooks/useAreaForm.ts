"use client";

import { useState } from "react";
import { createArea, updateArea } from "@/lib/api/areas";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { Area } from "@/types/area";

export type AreaFormMode = "create" | "edit";

export interface AreaFormValues {
  name: string;
}

export interface UseAreaFormOptions {
  mode: AreaFormMode;
  areaId?: string;
  initialArea?: Area;
  onSuccess?: (area: Area) => void;
}

interface AreaFormState {
  values: AreaFormValues;
  isSubmitting: boolean;
  error: ClassifiedError | null;
}

const EMPTY_VALUES: AreaFormValues = { name: "" };
const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

function valuesFromArea(area?: Area): AreaFormValues {
  if (!area) return EMPTY_VALUES;
  return { name: area.name };
}

export function useAreaForm({ mode, areaId, initialArea, onSuccess }: UseAreaFormOptions) {
  const [state, setState] = useState<AreaFormState>(() => ({
    values: valuesFromArea(initialArea),
    isSubmitting: false,
    error: null,
  }));

  function setField<K extends keyof AreaFormValues>(field: K, value: AreaFormValues[K]) {
    setState((prev) => ({ ...prev, values: { ...prev.values, [field]: value } }));
  }

  async function submit(values: AreaFormValues) {
    if (state.isSubmitting) return;

    // Nunca limpiar los datos ingresados antes de confirmar éxito (RNF-4, plan.md 3.2).
    setState((prev) => ({ ...prev, values, isSubmitting: true, error: null }));

    try {
      const result =
        mode === "create"
          ? await createArea({ name: values.name })
          : await updateArea(areaId as string, { name: values.name });

      setState((prev) => ({ ...prev, isSubmitting: false, error: null }));
      onSuccess?.(result);
    } catch (err) {
      const classified = err instanceof ApiError ? classifyError(err) : null;
      setState((prev) => ({ ...prev, isSubmitting: false, error: classified ?? UNKNOWN_ERROR }));
    }
  }

  return { ...state, setField, submit };
}
