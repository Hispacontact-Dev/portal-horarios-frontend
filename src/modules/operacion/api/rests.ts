// Descansos rotativos (brief §7): no son fijos, se asignan según la necesidad operativa y la
// rotación semanal.
//
// Contrato: `backlog/ANEXO-A-T005-CONTRATO-API.md` §4. El descanso se registra como un estado de
// programación (lleva `status_id`), ocupa el día completo y no se contabiliza en la cobertura.

import { z } from "zod";

import { restSchema, restsByDaySchema, type Rest, type RestAssignmentInput, type RestsByDay } from "../types/rest";
import { opsFetch } from "./client";
import { buildQuery } from "./query";

/**
 * Los agentes que descansan cada día de la semana, que es la vista que pide el brief §7.
 *
 * La consulta es semanal, no por día: el descanso rotativo se decide mirando la semana completa, y
 * pedir día por día serían siete peticiones para pintar una sola pantalla.
 */
export async function listRests(
  campaignId: string,
  weekStart: string,
  signal?: AbortSignal,
): Promise<RestsByDay[]> {
  const query = buildQuery({ campaign_id: campaignId, week_start: weekStart });
  return opsFetch(`/descansos${query}`, z.array(restsByDaySchema), { signal });
}

// Individual y masiva son la misma llamada, igual que en los turnos: individual es un lote de un
// agente. El día lo elige la persona a mano, que es lo que pide el brief.
export async function assignRests(input: RestAssignmentInput): Promise<Rest[]> {
  return opsFetch("/descansos", z.array(restSchema), { method: "POST", body: input });
}

/**
 * Cambia con qué estado queda registrado el descanso de un agente en un día (por ejemplo, de
 * descanso semanal a vacaciones).
 *
 * No sirve para mover el descanso a otro día: la clave es agente + fecha, así que mover es asignar
 * el día nuevo y quitar el anterior, y quitar todavía no tiene contrato (Anexo A §8).
 */
export async function updateRest(input: Rest): Promise<Rest> {
  return opsFetch("/descansos", restSchema, { method: "PUT", body: input });
}
