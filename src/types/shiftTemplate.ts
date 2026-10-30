import type { TimeRange, Weekday } from "@/types/schedule";

// Corresponde al catálogo de Plantillas de turno (specs/010-catalogos-cargos-plantillas-festivos).
// Solo cubre lunes a viernes porque todo el dominio de Horarios hoy no soporta fin de semana
// (ver src/types/schedule.ts Weekday). El backend todavía no expone este recurso.

export interface ShiftTemplate {
  id: string;
  name: string;
  blocks: TimeRange[];
  weekdays: Weekday[];
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface ShiftTemplateCreate {
  name: string;
  blocks: TimeRange[];
  weekdays: Weekday[];
}

export type ShiftTemplateUpdate = ShiftTemplateCreate;
