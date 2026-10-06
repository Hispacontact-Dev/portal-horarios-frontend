"use client";

import { useState } from "react";
import { createStatus, updateStatus } from "@/lib/api/statuses";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { Status } from "@/types/status";

export type StatusFormMode = "create" | "edit";

export interface StatusFormValues {
  name: string;
}

export interface UseStatusFormOptions {
  mode: StatusFormMode;
  statusId?: string;
  initialStatus?: Status;
  onSuccess?: (status: Status) => void;
}

interface StatusFormState {
  values: StatusFormValues;
  isSubmitting: boolean;
  error: ClassifiedError | null;
}

const EMPTY_VALUES: StatusFormValues = { name: "" };
const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

function valuesFromStatus(statusEntry?: Status): StatusFormValues {
  if (!statusEntry) return EMPTY_VALUES;
  return { name: statusEntry.name };
}

export function useStatusForm({ mode, statusId, initialStatus, onSuccess }: UseStatusFormOptions) {
  const [state, setState] = useState<StatusFormState>(() => ({
    values: valuesFromStatus(initialStatus),
    isSubmitting: false,
    error: null,
  }));

  function setField<K extends keyof StatusFormValues>(field: K, value: StatusFormValues[K]) {
    setState((prev) => ({ ...prev, values: { ...prev.values, [field]: value } }));
  }

  async function submit(values: StatusFormValues) {
    if (state.isSubmitting) return;

    // Nunca limpiar los datos ingresados antes de confirmar éxito (RNF-4, plan.md 3.2).
    setState((prev) => ({ ...prev, values, isSubmitting: true, error: null }));

    try {
      const result =
        mode === "create"
          ? await createStatus({ name: values.name })
          : await updateStatus(statusId as string, { name: values.name });

      setState((prev) => ({ ...prev, isSubmitting: false, error: null }));
      onSuccess?.(result);
    } catch (err) {
      const classified = err instanceof ApiError ? classifyError(err) : null;
      setState((prev) => ({ ...prev, isSubmitting: false, error: classified ?? UNKNOWN_ERROR }));
    }
  }

  return { ...state, setField, submit };
}
