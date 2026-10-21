import { ApiError } from "@/lib/api/client";

// Clasificación de errores de API según plan.md sección 3.7 (status HTTP)
// y specs/004-integracion-tecnica-backend/plan.md sección 3.1 (conexión/abort).

export type ClassifiedErrorKind =
  | "forbidden"
  | "not_found"
  | "conflict"
  | "invalid"
  | "connection"
  | "unknown";

export interface ClassifiedError {
  kind: ClassifiedErrorKind;
  message: string;
}

function isAbortError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { name?: unknown }).name === "AbortError";
}

export function classifyError(err: unknown): ClassifiedError | null {
  if (isAbortError(err)) {
    // La petición fue cancelada a propósito (navegación fuera de pantalla) — RF-2. No es un error que mostrar.
    return null;
  }

  if (err instanceof ApiError) {
    switch (err.status) {
      case 401:
        // Ya interceptado globalmente por client.ts (redirige a login) — RF-7.
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

  // No llegó a haber Response: bloqueo de CORS, falla de red o timeout — RF-2. El navegador
  // reporta los tres casos igual, así que se tratan con el mismo criterio (ver Casos límite de spec.md).
  return { kind: "connection", message: "No se pudo conectar con el servidor" };
}
