import { apiFetch } from "@/lib/api/client";
import type { ShiftTemplate, ShiftTemplateCreate, ShiftTemplateUpdate } from "@/types/shiftTemplate";

// Corresponde al recurso /shift-templates del backend (Catálogo de Plantillas de turno en la UI).
// El backend todavía no expone este recurso (specs/010-catalogos-cargos-plantillas-festivos) — estas
// llamadas devuelven error real (404/conexión) hasta que exista.

export async function listShiftTemplates(): Promise<ShiftTemplate[]> {
  return apiFetch<ShiftTemplate[]>("/shift-templates");
}

export async function createShiftTemplate(data: ShiftTemplateCreate): Promise<ShiftTemplate> {
  return apiFetch<ShiftTemplate>("/shift-templates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateShiftTemplate(id: string, data: ShiftTemplateUpdate): Promise<ShiftTemplate> {
  return apiFetch<ShiftTemplate>(`/shift-templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
