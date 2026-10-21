"use client";

import { useEffect, useState } from "react";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";

// Hook genérico de lectura (loading/vacío/error/retry) — specs/004-integracion-tecnica-backend/plan.md sección 3.2.
// Los módulos de dominio (ej. la futura vista de Horarios, tarea 5) se construyen sobre este hook en vez de
// reimplementar su propio manejo de estado — RNF-1, RNF-4.

const MAX_RETRY_COUNT = 5;
const RETRY_LIMIT_MESSAGE = "El servicio no está disponible, intentá más tarde";

export type EmptyReason = "filtered" | "no_data";

export type AsyncResourceState<T> =
  | { status: "loading"; data: T | null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "empty"; data: T; error: null; emptyReason: EmptyReason }
  | { status: "error"; data: null; error: ClassifiedError; retryCount: number };

export interface UseAsyncResourceOptions<T> {
  /** Determina si el resultado exitoso debe tratarse como estado vacío — RF-4. Por defecto, un array vacío. */
  isEmpty?: (data: T) => boolean;
  /** Indica si hay filtros aplicados, para distinguir el motivo del estado vacío — RF-4. */
  hasFilters?: boolean;
}

function defaultIsEmpty<T>(data: T): boolean {
  return Array.isArray(data) && data.length === 0;
}

export function useAsyncResource<T>(
  fetchFn: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
  { isEmpty = defaultIsEmpty, hasFilters = false }: UseAsyncResourceOptions<T> = {},
) {
  const [state, setState] = useState<AsyncResourceState<T>>({ status: "loading", data: null, error: null });
  const [retryCount, setRetryCount] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController(); // RF-2: cancela la petición en vuelo al desmontar/cambiar deps
    setState((prev) => ({
      status: "loading",
      data: prev.status === "success" || prev.status === "empty" ? prev.data : null,
      error: null,
    }));

    fetchFn(controller.signal)
      .then((data) => {
        if (cancelled) return;
        if (isEmpty(data)) {
          setState({ status: "empty", data, error: null, emptyReason: hasFilters ? "filtered" : "no_data" });
        } else {
          setState({ status: "success", data, error: null });
        }
        setRetryCount(0);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const classified = classifyError(err);
        if (classified === null) return; // abort silencioso, o 401 ya manejado globalmente — RF-2, RF-7
        setState({ status: "error", data: null, error: classified, retryCount });
      });

    return () => {
      // `cancelled` protege el setState aunque una función de dominio futura no reenvíe la señal a apiFetch;
      // `controller.abort()` cancela la petición real en el navegador cuando sí la reenvía — RF-2.
      cancelled = true;
      controller.abort();
    };
    // `deps` (provisto por el caller, ej. filtros serializados) y `attempt` controlan cuándo se vuelve a pedir;
    // `retryCount` se lee pero no debe disparar un refetch por sí solo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  function retry() {
    if (state.status !== "error") return;
    if (retryCount >= MAX_RETRY_COUNT) {
      // RF-5: al sexto intento consecutivo, solo se cambia el mensaje — no se dispara otra petición real.
      setState((prev) =>
        prev.status === "error" ? { ...prev, error: { ...prev.error, message: RETRY_LIMIT_MESSAGE } } : prev,
      );
      return;
    }
    setRetryCount((count) => count + 1);
    setAttempt((value) => value + 1);
  }

  return { state, retry };
}
