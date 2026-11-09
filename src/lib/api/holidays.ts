import { apiFetch } from "@/lib/api/client";
import type { Holiday, HolidayCreate, HolidayImportResult } from "@/types/holiday";

// Corresponde al recurso /holidays del backend (Catálogo de Festivos en la UI). No confundir con
// src/lib/utils/holidays.ts (el calendario fijo que hoy bloquea días en Horarios, sin relación con
// este catálogo todavía — specs/010-catalogos-cargos-plantillas-festivos). Lo expone el backend
// desde specs/009-catalogos-configuracion.

export async function listHolidays(year: number, signal?: AbortSignal): Promise<Holiday[]> {
  return apiFetch<Holiday[]>(`/holidays?year=${year}`, { signal });
}

export async function createHoliday(data: HolidayCreate): Promise<Holiday> {
  return apiFetch<Holiday>("/holidays", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function setHolidayBlocksShifts(date: string, blocksShifts: boolean): Promise<Holiday> {
  return apiFetch<Holiday>(`/holidays/${date}`, {
    method: "PATCH",
    body: JSON.stringify({ blocks_shifts: blocksShifts }),
  });
}

// Devuelve la fecha eliminada (en vez de void) para que quien llame pueda distinguir éxito de
// error por el valor de retorno, igual que el resto de las acciones de este catálogo.
export async function deleteHoliday(date: string): Promise<string> {
  await apiFetch<void>(`/holidays/${date}`, { method: "DELETE" });
  return date;
}

export async function importNationalHolidays(year: number): Promise<HolidayImportResult> {
  return apiFetch<HolidayImportResult>(`/holidays/import?year=${year}`, { method: "POST" });
}
