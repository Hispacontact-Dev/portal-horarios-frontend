import { apiFetch } from "@/lib/api/client";
import type { ShiftTemplate, ShiftTemplateCreate, ShiftTemplateUpdate } from "@/types/shiftTemplate";

// Corresponde al recurso /shift-templates del backend (Catálogo de Plantillas de turno en la UI).
// Lo expone el backend desde specs/009-catalogos-configuracion. Solo lunes a viernes,
// porque el dominio de Horarios no soporta fin de semana.

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
