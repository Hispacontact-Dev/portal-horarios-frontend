import { apiFetch } from "@/lib/api/client";
import type { Position, PositionCreate, PositionDisableResult, PositionUpdate } from "@/types/position";

// Corresponde al recurso /positions del backend (Catálogo de Cargos en la UI, pestaña Configuración).
// El backend todavía no expone este recurso (specs/010-catalogos-cargos-plantillas-festivos) — estas
// llamadas devuelven error real (404/conexión) hasta que exista.

export async function listPositions(): Promise<Position[]> {
  return apiFetch<Position[]>("/positions");
}

export async function createPosition(data: PositionCreate): Promise<Position> {
  return apiFetch<Position>("/positions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePosition(id: string, data: PositionUpdate): Promise<Position> {
  return apiFetch<Position>(`/positions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function disablePosition(id: string): Promise<PositionDisableResult> {
  return apiFetch<PositionDisableResult>(`/positions/${id}/disable`, { method: "PATCH" });
}

export async function enablePosition(id: string): Promise<Position> {
  return apiFetch<Position>(`/positions/${id}/enable`, { method: "PATCH" });
}
