"use client";

import { useState } from "react";
import { createShiftTemplate, updateShiftTemplate } from "@/lib/api/shiftTemplates";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { ShiftTemplate } from "@/types/shiftTemplate";
import type { TimeRange, Weekday } from "@/types/schedule";

export type ShiftTemplateFormMode = "create" | "edit";

export interface ShiftTemplateFormValues {
  name: string;
  weekdays: Weekday[];
  blocks: TimeRange[];
}

export interface UseShiftTemplateFormOptions {
  mode: ShiftTemplateFormMode;
  templateId?: string;
  initialValues?: ShiftTemplateFormValues;
  onSuccess?: (template: ShiftTemplate) => void;
}

interface ShiftTemplateFormState {
  values: ShiftTemplateFormValues;
  isSubmitting: boolean;
  error: ClassifiedError | null;
}

const DEFAULT_VALUES: ShiftTemplateFormValues = {
  name: "",
  weekdays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  blocks: [{ start: "08:00", end: "17:00" }],
};

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

// Validación de RF-3 (specs/010-catalogos-cargos-plantillas-festivos): nombre requerido, al menos un
// día, cada bloque con fin posterior al inicio y sin solapes. "HH:mm" compara bien como string
// (ancho fijo).
function validate(values: ShiftTemplateFormValues): ClassifiedError | null {
  if (!values.name.trim()) {
    return { kind: "invalid", message: "Escribí un nombre para la plantilla." };
  }
  if (values.weekdays.length === 0) {
    return { kind: "invalid", message: "Elegí al menos un día de la semana." };
  }
  if (values.blocks.length === 0) {
    return { kind: "invalid", message: "Agregá al menos un bloque de horario." };
  }
  if (values.blocks.some((block) => block.end <= block.start)) {
    return { kind: "invalid", message: "La hora de fin debe ser posterior a la hora de inicio." };
  }
  if (hasOverlap(values.blocks)) {
    return { kind: "invalid", message: "Los bloques de horario no pueden solaparse entre sí." };
  }
  return null;
}

// El backend rechaza una jornada partida con bloques solapados; se valida acá también
// para no gastar un viaje al servidor en un error que ya se puede ver.
function hasOverlap(blocks: TimeRange[]): boolean {
  const sorted = [...blocks].sort((a, b) => a.start.localeCompare(b.start));
  return sorted.some((block, index) => index > 0 && block.start < sorted[index - 1].end);
}

export function useShiftTemplateForm({
  mode,
  templateId,
  initialValues,
  onSuccess,
}: UseShiftTemplateFormOptions) {
  const [state, setState] = useState<ShiftTemplateFormState>(() => ({
    values: initialValues ?? DEFAULT_VALUES,
    isSubmitting: false,
    error: null,
  }));

  function setField<K extends keyof ShiftTemplateFormValues>(
    field: K,
    value: ShiftTemplateFormValues[K]
  ) {
    setState((prev) => ({ ...prev, values: { ...prev.values, [field]: value } }));
  }

  async function submit(values: ShiftTemplateFormValues) {
    if (state.isSubmitting) return;

    const validationError = validate(values);
    if (validationError) {
      setState((prev) => ({ ...prev, values, error: validationError }));
      return;
    }

    // Nunca limpiar los datos ingresados antes de confirmar éxito (mismo criterio que useStatusForm).
    setState((prev) => ({ ...prev, values, isSubmitting: true, error: null }));

    try {
      const payload = { name: values.name, weekdays: values.weekdays, blocks: values.blocks };
      const result =
        mode === "create"
          ? await createShiftTemplate(payload)
          : await updateShiftTemplate(templateId as string, payload);

      setState((prev) => ({ ...prev, isSubmitting: false, error: null }));
      onSuccess?.(result);
    } catch (err) {
      const classified = err instanceof ApiError ? classifyError(err) : null;
      setState((prev) => ({ ...prev, isSubmitting: false, error: classified ?? UNKNOWN_ERROR }));
    }
  }

  return { ...state, setField, submit };
}
