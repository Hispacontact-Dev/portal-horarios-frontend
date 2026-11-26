// Historial de modificaciones del módulo (brief §12).
//
// Contrato: `backlog/ANEXO-A-T005-CONTRATO-API.md` §4. La entidad más fina es el agente-día
// (`day_program`), no la celda: un registro por celda haría el historial ilegible (C-04).
//
// Sin paginación: el backend hoy no pagina ninguna lista, y dimensionar la página depende de C-04.
// El hueco está anotado en el Anexo A §8.

import { z } from "zod";

import {
  opsChangeRecordSchema,
  type OpsChangeRecord,
  type OpsHistoryFilters,
} from "../types/history";
import { opsFetch } from "./client";
import { buildQuery } from "./query";

export async function listOpsHistory(
  filters: OpsHistoryFilters,
  signal?: AbortSignal,
): Promise<OpsChangeRecord[]> {
  // Los filtros del historial son opcionales (`undefined` = sin filtro), a diferencia de los del
  // resto del módulo, que usan `null`. `buildQuery` omite los dos casos.
  const query = buildQuery({
    entity_type: filters.entity_type,
    entity_id: filters.entity_id,
    actor_id: filters.actor_id,
    date_from: filters.date_from,
    date_to: filters.date_to,
  });
  return opsFetch(`/historial${query}`, z.array(opsChangeRecordSchema), { signal });
}
