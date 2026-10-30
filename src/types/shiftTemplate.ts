import type { TimeRange, Weekday } from "@/types/schedule";

// Corresponde al catálogo de Plantillas de turno (specs/010-catalogos-cargos-plantillas-festivos).
// Solo cubre lunes a viernes porque todo el dominio de Horarios hoy no soporta fin de semana
// (ver src/types/schedule.ts Weekday). El backend lo expone en /shift-templates desde su
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
