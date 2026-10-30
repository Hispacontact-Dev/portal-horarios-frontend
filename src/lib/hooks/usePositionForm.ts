"use client";

import { useState } from "react";
import { createPosition, updatePosition } from "@/lib/api/positions";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { Position } from "@/types/position";

export type PositionFormMode = "create" | "edit";

export interface PositionFormValues {
  name: string;
}

export interface UsePositionFormOptions {
  mode: PositionFormMode;
  positionId?: string;
  initialPosition?: Position;
  onSuccess?: (position: Position) => void;
}

interface PositionFormState {
  values: PositionFormValues;
  isSubmitting: boolean;
  error: ClassifiedError | null;
}

const EMPTY_VALUES: PositionFormValues = { name: "" };
const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

function valuesFromPosition(position?: Position): PositionFormValues {
  if (!position) return EMPTY_VALUES;
  return { name: position.name };
}

export function usePositionForm({ mode, positionId, initialPosition, onSuccess }: UsePositionFormOptions) {
  const [state, setState] = useState<PositionFormState>(() => ({
    values: valuesFromPosition(initialPosition),
    isSubmitting: false,
    error: null,
  }));

  function setField<K extends keyof PositionFormValues>(field: K, value: PositionFormValues[K]) {
    setState((prev) => ({ ...prev, values: { ...prev.values, [field]: value } }));
  }

  async function submit(values: PositionFormValues) {
    if (state.isSubmitting) return;

    // Nunca limpiar los datos ingresados antes de confirmar éxito (mismo criterio que useAreaForm).
    setState((prev) => ({ ...prev, values, isSubmitting: true, error: null }));

    try {
      const result =
        mode === "create"
          ? await createPosition({ name: values.name })
          : await updatePosition(positionId as string, { name: values.name });

      setState((prev) => ({ ...prev, isSubmitting: false, error: null }));
      onSuccess?.(result);
    } catch (err) {
      const classified = err instanceof ApiError ? classifyError(err) : null;
      setState((prev) => ({ ...prev, isSubmitting: false, error: classified ?? UNKNOWN_ERROR }));
    }
  }

  return { ...state, setField, submit };
}
