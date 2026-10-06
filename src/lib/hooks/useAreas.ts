"use client";

import { useEffect, useState } from "react";
import { listAreas } from "@/lib/api/areas";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { Area } from "@/types/area";

type AreasState =
  | { status: "loading"; areas: Area[]; error: null }
  | { status: "success"; areas: Area[]; error: null }
  | { status: "error"; areas: Area[]; error: ClassifiedError };

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

export function useAreas() {
  const [state, setState] = useState<AreasState>({ status: "loading", areas: [], error: null });

  useEffect(() => {
    let cancelled = false;

    listAreas()
      .then((areas) => {
        if (!cancelled) setState({ status: "success", areas, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const classified = err instanceof ApiError ? classifyError(err) : null;
        setState({ status: "error", areas: [], error: classified ?? UNKNOWN_ERROR });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
