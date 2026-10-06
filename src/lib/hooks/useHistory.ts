"use client";

import { useEffect, useState } from "react";
import { listHistory } from "@/lib/api/history";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { HistoryEntry } from "@/types/history";

type HistoryState =
  | { status: "loading"; entries: HistoryEntry[]; error: null }
  | { status: "success"; entries: HistoryEntry[]; error: null }
  | { status: "error"; entries: HistoryEntry[]; error: ClassifiedError };

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

export function useHistory() {
  const [state, setState] = useState<HistoryState>({ status: "loading", entries: [], error: null });

  useEffect(() => {
    let cancelled = false;

    listHistory()
      .then((entries) => {
        if (!cancelled) setState({ status: "success", entries, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const classified = err instanceof ApiError ? classifyError(err) : null;
        setState({ status: "error", entries: [], error: classified ?? UNKNOWN_ERROR });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
