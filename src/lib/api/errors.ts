import type { ApiError } from "@/lib/api/client";

// Clasificación de errores de API según plan.md sección 3.7.

export type ClassifiedErrorKind = "forbidden" | "not_found" | "conflict" | "invalid" | "unknown";

export interface ClassifiedError {
  kind: ClassifiedErrorKind;
  message: string;
}

export function classifyError(err: ApiError): ClassifiedError | null {
  switch (err.status) {
    case 401:
      // Ya interceptado globalmente por client.ts (redirige a login).
      return null;
    case 403:
      return { kind: "forbidden", message: "No tenés permiso para esta acción" };
    case 404:
      return { kind: "not_found", message: err.body?.message ?? "No se encontró el recurso" };
    case 409:
      return { kind: "conflict", message: err.body?.message ?? "Ya existe o hay un conflicto" };
    case 422:
      return { kind: "invalid", message: err.body?.message ?? "Datos inválidos" };
    default:
      return { kind: "unknown", message: "Error inesperado, intentá de nuevo" };
  }
}
