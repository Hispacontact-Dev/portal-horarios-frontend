"use client";

import { useEffect, useState } from "react";
import { listHistory } from "@/lib/api/history";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { HistoryEntry, HistoryFilters } from "@/types/history";

type HistoryState =
  | { status: "loading"; entries: HistoryEntry[]; error: null }
  | { status: "success"; entries: HistoryEntry[]; error: null }
  | { status: "error"; entries: HistoryEntry[]; error: ClassifiedError };

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

export function useHistory(filters: HistoryFilters = {}) {
  const [state, setState] = useState<HistoryState>({ status: "loading", entries: [], error: null });
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ status: "loading", entries: prev.entries, error: null }));

    listHistory(filters)
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
    // filtersKey (serializado) evita refetch infinito cuando el llamador pasa un objeto literal nuevo en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  return state;
}
