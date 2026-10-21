"use client";

import { useRef, useState } from "react";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";

// Hook genérico de escritura (loading/error/retry) — specs/004-integracion-tecnica-backend/plan.md sección 3.3.
// Los módulos de dominio (ej. la futura vista de Horarios, tarea 5) se construyen sobre este hook en vez de
// reimplementar su propio manejo de estado — RNF-1, RNF-4.

const MAX_RETRY_COUNT = 5;
const RETRY_LIMIT_MESSAGE = "El servicio no está disponible, intentá más tarde";

export type AsyncActionState<TArgs> =
  | { status: "idle"; error: null }
  | { status: "submitting"; error: null }
  | { status: "success"; error: null }
  | { status: "error"; error: ClassifiedError; retryCount: number; lastArgs: TArgs };

export function useAsyncAction<TArgs, TResult>(submitFn: (args: TArgs) => Promise<TResult>) {
  const [state, setState] = useState<AsyncActionState<TArgs>>({ status: "idle", error: null });
  // `submittingRef` guarda el disable de forma síncrona (no vía useState) — RF-3: un segundo click
  // disparado antes del próximo render debe leer el valor actualizado, cosa que React state no garantiza.
  const submittingRef = useRef(false);
  const retryCountRef = useRef(0);

  async function submit(args: TArgs): Promise<TResult | undefined> {
    if (submittingRef.current) return undefined;
    submittingRef.current = true;
    setState({ status: "submitting", error: null });

    try {
      const result = await submitFn(args);
      submittingRef.current = false;
      retryCountRef.current = 0;
      setState({ status: "success", error: null });
      return result;
    } catch (err) {
      submittingRef.current = false;
      const classified = classifyError(err);
      if (classified === null) return undefined; // abort silencioso, o 401 ya manejado globalmente — RF-7
      setState({ status: "error", error: classified, retryCount: retryCountRef.current, lastArgs: args });
      return undefined;
    }
  }

  // Reenvía la última escritura fallida. El riesgo de duplicado (RF-5) se comunica como copy en la UI
  // que consuma este hook (ver ErrorState, tarea 12) — este hook no posee un diálogo de confirmación.
  function retry(): void {
    if (state.status !== "error") return;
    if (retryCountRef.current >= MAX_RETRY_COUNT) {
      setState((prev) =>
        prev.status === "error" ? { ...prev, error: { ...prev.error, message: RETRY_LIMIT_MESSAGE } } : prev,
      );
      return;
    }
    retryCountRef.current += 1;
    void submit(state.lastArgs);
  }

  return { state, submit, retry };
}
