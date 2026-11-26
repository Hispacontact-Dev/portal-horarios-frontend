// Resumen de cobertura por hora (brief §9).
//
// Contrato: `backlog/ANEXO-A-T005-CONTRATO-API.md` §4, donde queda marcado como **opcional**: el
// cálculo de verdad lo hace `engine/` a partir de la programación, porque el brief exige que el
// resumen se actualice al modificar cualquier celda y esperar un viaje al servidor por celda no es
// usable. Este endpoint sirve para validar que las dos cuentas coinciden.

import { coverageTableSchema, type CoverageFilters, type CoverageTable } from "../types/coverage";
import { opsFetch } from "./client";
import { buildQuery } from "./query";

export async function getCoverage(
  filters: CoverageFilters,
  signal?: AbortSignal,
): Promise<CoverageTable> {
  const query = buildQuery({ campaign_id: filters.campaign_id, date: filters.date });
  return opsFetch(`/cobertura${query}`, coverageTableSchema, { signal });
}
