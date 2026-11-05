"use client";

import { useAsyncAction } from "@/lib/hooks/useAsyncAction";
import { revertDayToDefault, setDayStatus } from "@/lib/api/schedules";
import { ApiError } from "@/lib/api/client";
import type { ScheduleDayEntry } from "@/types/schedule";

// Deja la novedad de un empleado igual al rango que eligió Gestión Humana: asigna el Estado a cada
// día del rango nuevo y quita los días que quedaron fuera. Cada día es un PATCH
// /schedules/day-status (o /revert), no un POST /schedules/range-status.
//
// El motivo es que `range_override` es irreversible: el backend no sabe borrarlo
// (`revert_day_exception` lo ignora y `apply_day_exception` lo rechaza con 409), así que una
// novedad guardada con ese endpoint quedaba congelada. Un `day_override` sí se sobrescribe y se
// borra, que es lo que pide spec 005 RF-3 ("corregir días individuales sin rehacer el rango").
//
// A cambio la operación no es atómica: el resultado es parcial, igual que POST /schedules/bulk, y
// los días que el backend no cambió se devuelven en `skipped`.

const CONFLICT_FALLBACK = "ya tiene algo asignado";
const BULK_LOCKED_REASON =
  "es un turno asignado de forma masiva y el backend no lo quita como día suelto (no da error: devuelve el día sin borrar la excepción)";

export interface NovedadSyncInput {
  employeeId: string;
  /** El Estado a asignar; `null` cuando solo se están quitando días. */
  statusId: string | null;
  /** Días que deben quedar con ese Estado. */
  targetDates: string[];
  /** Días que tenían la novedad y deben volver al horario habitual. */
  removeDates: string[];
  /** `updated_at` conocido por fecha. Sin entrada ⇒ se envía `null` (día sin excepción). */
  knownUpdatedAt: Record<string, string | null>;
}

export interface NovedadSyncSkipped {
  date: string;
  reason: string;
}

export interface NovedadSyncResult {
  applied: number;
  removed: number;
  skipped: NovedadSyncSkipped[];
}

function conflictReason(err: ApiError): string {
  // El backend serializa sus errores como `{"detail": "..."}`, no como `{"message": ...}`.
  const detail = err.body?.detail;
  return typeof detail === "string" && detail !== "" ? detail : CONFLICT_FALLBACK;
}

async function submitNovedadSync(input: NovedadSyncInput): Promise<NovedadSyncResult> {
  const result: NovedadSyncResult = { applied: 0, removed: 0, skipped: [] };

  /**
   * Corre una escritura de un día y decide si realmente ocurrió. Un 409 es un día que el backend no
   * deja tocar (nació de una asignación masiva, o cambió desde otra pantalla): se salta y se sigue
   * con el resto. Cualquier otro error corta la operación y lo clasifica `useAsyncAction`.
   *
   * `expectedSource` es la comprobación que hace honesto el resultado: `revert_day_exception` no
   * falla cuando el día viene de una asignación masiva, devuelve el día con su excepción intacta.
   * Mirar el `source` de la respuesta es la única forma de distinguir eso de una reversión real.
   */
  async function run(
    date: string,
    expectedSource: ScheduleDayEntry["source"],
    action: () => Promise<ScheduleDayEntry>,
  ): Promise<boolean> {
    try {
      const entry = await action();
      if (entry.source !== expectedSource) {
        result.skipped.push({ date, reason: BULK_LOCKED_REASON });
        return false;
      }
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        result.skipped.push({ date, reason: conflictReason(err) });
        return false;
      }
      throw err;
    }
  }

  // Primero se quitan los días que salieron del rango: si el rango se corrió, el día liberado
  // vuelve al horario habitual antes de escribir los nuevos.
  for (const date of input.removeDates) {
    const done = await run(date, "default", () =>
      revertDayToDefault(input.employeeId, date, input.knownUpdatedAt[date] ?? null),
    );
    if (done) result.removed += 1;
  }

  if (input.statusId === null) return result;
  const statusId = input.statusId;

  for (const date of input.targetDates) {
    const done = await run(date, "day_override", () =>
      setDayStatus({
        employee_id: input.employeeId,
        date,
        status_id: statusId,
        expected_updated_at: input.knownUpdatedAt[date] ?? null,
      }),
    );
    if (done) result.applied += 1;
  }

  return result;
}

export function useNovedadSync() {
  return useAsyncAction<NovedadSyncInput, NovedadSyncResult>(submitNovedadSync);
}
