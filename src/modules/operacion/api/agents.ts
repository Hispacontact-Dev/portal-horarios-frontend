// Maestro de agentes (brief §4). Crear individualmente, cargar en masa, editar, activar o
// inactivar, y filtrar por campaña.
//
// Contrato: `backlog/ANEXO-A-T005-CONTRATO-API.md` §4. Vocabulario: `Agent`, nunca `Employee`
// (T-001 §2.2). El maestro de empleados del portal de Junta es otra entidad y acá no se toca.

import { z } from "zod";

import {
  agentBulkResultSchema,
  agentBulkRowSchema,
  agentSchema,
  type Agent,
  type AgentBulkResult,
  type AgentBulkRow,
  type AgentCreate,
  type AgentFilters,
  type AgentUpdate,
} from "../types/agent";
import { opsFetch, parseOpsPayload } from "./client";
import { buildQuery } from "./query";

const BULK_PATH = "/agentes/carga-masiva";

export async function listAgents(filters: AgentFilters, signal?: AbortSignal): Promise<Agent[]> {
  const query = buildQuery({ campaign_id: filters.campaign_id, status: filters.status });
  return opsFetch(`/agentes${query}`, z.array(agentSchema), { signal });
}

export async function getAgent(agentId: string, signal?: AbortSignal): Promise<Agent> {
  return opsFetch(`/agentes/${agentId}`, agentSchema, { signal });
}

export async function createAgent(input: AgentCreate): Promise<Agent> {
  return opsFetch("/agentes", agentSchema, {
    method: "POST",
    body: input,
    errorCopy: { 409: "Ya existe un agente con ese nombre en la campaña" },
  });
}

// Inactivar un agente es esta misma llamada con `status`, no un endpoint aparte: así lo modeló
// `agentUpdateSchema`, y es la operación que el brief §4 describe.
export async function updateAgent(agentId: string, input: AgentUpdate): Promise<Agent> {
  return opsFetch(`/agentes/${agentId}`, agentSchema, { method: "PUT", body: input });
}

/**
 * Cargue masivo. El lote **no** es todo o nada: devuelve los agentes creados y las filas saltadas
 * con su `row_number` y el motivo.
 *
 * Las filas se validan antes de salir porque una fila mal formada volvería como un 422 genérico y
 * la persona no sabría cuál revisar. El formato del archivo que las origina sigue sin decidirse
 * (C-12); esta función ya recibe filas, no un archivo.
 */
export async function bulkCreateAgents(rows: AgentBulkRow[]): Promise<AgentBulkResult> {
  const validRows = parseOpsPayload(z.array(agentBulkRowSchema), rows, BULK_PATH);

  // El cuerpo va envuelto en `rows` y no como array pelado: deja lugar a metadatos del archivo
  // (nombre, separador) sin romper el contrato una vez que C-12 se cierre.
  return opsFetch(BULK_PATH, agentBulkResultSchema, { method: "POST", body: { rows: validRows } });
}
