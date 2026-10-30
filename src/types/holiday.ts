// Corresponde al catálogo de Festivos (specs/010-catalogos-cargos-plantillas-festivos). No reemplaza
// src/lib/utils/holidays.ts (el calendario fijo que hoy bloquea días en Horarios) — esta spec solo
// cubre la pantalla de administración del catálogo. El backend todavía no expone este recurso.

export type HolidayType = "nacional" | "empresa";

export interface Holiday {
  date: string; // "YYYY-MM-DD"
  name: string;
  type: HolidayType;
  blocks_shifts: boolean;
}

export interface HolidayCreate {
  date: string;
  name: string;
}

export interface HolidayImportResult {
  imported: Holiday[];
  skipped_dates: string[];
}
