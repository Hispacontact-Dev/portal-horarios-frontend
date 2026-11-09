"use client";

import { useEffect, useState } from "react";
import { listPositions } from "@/lib/api/positions";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { Position } from "@/types/position";

type PositionsState =
  | { status: "loading"; positions: Position[]; error: null }
  | { status: "success"; positions: Position[]; error: null }
  | { status: "error"; positions: Position[]; error: ClassifiedError };

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

export function usePositions() {
  const [state, setState] = useState<PositionsState>({ status: "loading", positions: [], error: null });

  useEffect(() => {
    let cancelled = false;

    listPositions()
      .then((positions) => {
        if (!cancelled) setState({ status: "success", positions, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const classified = err instanceof ApiError ? classifyError(err) : null;
        setState({ status: "error", positions: [], error: classified ?? UNKNOWN_ERROR });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
