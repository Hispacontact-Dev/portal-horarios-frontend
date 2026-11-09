"use client";

import { useEffect, useState } from "react";
import { listShiftTemplates } from "@/lib/api/shiftTemplates";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { ShiftTemplate } from "@/types/shiftTemplate";

type ShiftTemplatesState =
  | { status: "loading"; shiftTemplates: ShiftTemplate[]; error: null }
  | { status: "success"; shiftTemplates: ShiftTemplate[]; error: null }
  | { status: "error"; shiftTemplates: ShiftTemplate[]; error: ClassifiedError };

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

export function useShiftTemplates() {
  const [state, setState] = useState<ShiftTemplatesState>({
    status: "loading",
    shiftTemplates: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    listShiftTemplates()
      .then((shiftTemplates) => {
        if (!cancelled) setState({ status: "success", shiftTemplates, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const classified = err instanceof ApiError ? classifyError(err) : null;
        setState({ status: "error", shiftTemplates: [], error: classified ?? UNKNOWN_ERROR });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
