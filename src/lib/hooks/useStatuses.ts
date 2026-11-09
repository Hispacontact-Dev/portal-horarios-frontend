"use client";

import { useEffect, useState } from "react";
import { listStatuses } from "@/lib/api/statuses";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { Status } from "@/types/status";

type StatusesState =
  | { status: "loading"; statuses: Status[]; error: null }
  | { status: "success"; statuses: Status[]; error: null }
  | { status: "error"; statuses: Status[]; error: ClassifiedError };

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

export function useStatuses() {
  const [state, setState] = useState<StatusesState>({
    status: "loading",
    statuses: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    listStatuses()
      .then((statuses) => {
        if (!cancelled) setState({ status: "success", statuses, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const classified = err instanceof ApiError ? classifyError(err) : null;
        setState({ status: "error", statuses: [], error: classified ?? UNKNOWN_ERROR });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
