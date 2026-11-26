// Programación diaria por agente y actividad (brief §8): el módulo principal del producto.
//
// Contrato: `backlog/ANEXO-A-T005-CONTRATO-API.md` §4 y §5. Vocabulario: `DayProgram` /
// `WeekProgram`, nunca `Schedule`, que está ocupado por el portal de Junta (T-001 §2.2).

import {
  dayProgramSaveInputSchema,
  dayProgramSchema,
  weekProgramSchema,
  type DayProgram,
  type DayProgramSaveInput,
  type ProgramFilters,
  type WeekProgram,
} from "../types/program";
import { opsFetch, parseOpsPayload } from "./client";
import { buildQuery } from "./query";

const SAVE_PATH = "/programacion/guardar";

// Lo que ve la grilla: agentes en filas, franjas en columnas. La respuesta trae el rango operativo,
// el tamaño de franja y el estado de la semana, así que la pantalla se arma con una sola petición.
export async function getWeekProgram(
  filters: ProgramFilters,
  signal?: AbortSignal,
): Promise<WeekProgram> {
  const query = buildQuery({
    campaign_id: filters.campaign_id,
    week_start: filters.week_start,
    date: filters.date,
    agent_id: filters.agent_id,
    activity_id: filters.activity_id,
  });
  return opsFetch(`/programacion${query}`, weekProgramSchema, { signal });
}

/**
 * Guarda el día completo de un agente, en lote. No es celda por celda: es la granularidad que el
 * backend ya sabe versionar (C-01, Anexo A §5).
 *
 * `expected_updated_at` se reenvía tal como lo entregó la lectura, incluido el `null` de un día sin
 * programación. Si no coincide, el backend responde 409 y se avisa que alguien más tocó ese día.
 *
 * El payload se valida antes de salir: es la segunda frontera que justificó `zod` en T-004. Una
 * celda mal formada que entra corrompe la cobertura de toda la campaña, y el error aparecería
 * recién al mirar el reporte.
 */
export async function saveDayProgram(input: DayProgramSaveInput): Promise<DayProgram> {
  const payload = parseOpsPayload(dayProgramSaveInputSchema, input, SAVE_PATH);

  return opsFetch(SAVE_PATH, dayProgramSchema, {
    method: "PUT",
    body: payload,
    errorCopy: {
      409: "Este día fue modificado por otra persona. Recargá los datos antes de guardar.",
    },
  });
}
