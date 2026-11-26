// Publicación semanal (brief §10). La restricción clave del objetivo del brief: se trabaja con
// semanas en construcción sin que los agentes vean horarios sin publicar.
//
// Contrato: `backlog/ANEXO-A-T005-CONTRATO-API.md` §4. Copy: "En construcción" / "Publicada",
// nunca "Borrador" (T-001 §2.2).
//
// No hay `unpublishWeek`: C-07 no definió si despublicar es una operación válida, y T-004 decidió
// no modelarla. El hueco está anotado en el Anexo A §8.

import {
  weekPublicationSchema,
  type PublishInput,
  type WeekPublication,
} from "../types/publication";
import { opsFetch } from "./client";
import { buildQuery } from "./query";

// La semana se identifica por campaña + lunes, no por un id propio: es la unidad que ya usa
// `WeekProgram`, así que la pestaña de Publicación pregunta por lo mismo que pinta la grilla.
export async function getWeekPublication(
  campaignId: string,
  weekStart: string,
  signal?: AbortSignal,
): Promise<WeekPublication> {
  const query = buildQuery({ campaign_id: campaignId, week_start: weekStart });
  return opsFetch(`/semanas${query}`, weekPublicationSchema, { signal });
}

export async function publishWeek(input: PublishInput): Promise<WeekPublication> {
  return opsFetch("/semanas/publicar", weekPublicationSchema, {
    method: "POST",
    body: input,
    errorCopy: { 409: "Esta semana ya está publicada. Recargá para ver su estado." },
  });
}
