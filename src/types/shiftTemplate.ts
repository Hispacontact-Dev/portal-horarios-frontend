import type { TimeRange, Weekday } from "@/types/schedule";

// Corresponde al catálogo de Plantillas de turno (specs/010-catalogos-cargos-plantillas-festivos).
// Cubre de lunes a domingo, igual que el resto de Horarios (ver src/types/schedule.ts Weekday):
// el fin de semana entra solo en las plantillas que lo marcan. El backend lo expone en /shift-templates desde su
// specs/009-catalogos-configuracion.

export interface ShiftTemplate {
  id: string;
  name: string;
  blocks: TimeRange[];
  weekdays: Weekday[];
  created_at: string;
  // `null` mientras nadie haya tocado la entrada: el backend devuelve estos campos
  // vacíos hasta el primer cambio.
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export interface ShiftTemplateCreate {
  name: string;
  blocks: TimeRange[];
  weekdays: Weekday[];
}

export type ShiftTemplateUpdate = ShiftTemplateCreate;

// El backend devuelve el id y el nombre de la plantilla borrada (en vez de un 204 sin cuerpo)
// porque el portal parsea toda respuesta; el documento desaparece, así que este nombre es lo
// único que queda para el mensaje de confirmación.
export interface ShiftTemplateDeleted {
  id: string;
  name: string;
}
