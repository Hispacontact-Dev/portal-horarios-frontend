// Estados de ausencia: break, almuerzo, descanso semanal, vacaciones, incapacidad, permisos y otros
// (brief §2). Aparecen en la programación del agente y nunca suman en la cobertura.
//
// Contrato: `backlog/ANEXO-A-T005-CONTRATO-API.md` §4. Es un recurso propio del módulo y no
// `/statuses` del portal de Junta: mientras C-05 esté abierta, un cambio acá no puede impactar el
// catálogo que ya está en producción.

import { z } from "zod";

import {
  absenceStatusSchema,
  type AbsenceStatus,
  type AbsenceStatusCreate,
  type AbsenceStatusUpdate,
} from "../types/absenceStatus";
import { opsFetch } from "./client";

const DUPLICATE_NAME_MESSAGE = "Ya existe un estado con ese nombre";

export async function listAbsenceStatuses(signal?: AbortSignal): Promise<AbsenceStatus[]> {
  return opsFetch("/estados-programacion", z.array(absenceStatusSchema), { signal });
}

export async function createAbsenceStatus(input: AbsenceStatusCreate): Promise<AbsenceStatus> {
  return opsFetch("/estados-programacion", absenceStatusSchema, {
    method: "POST",
    body: input,
    errorCopy: { 409: DUPLICATE_NAME_MESSAGE },
  });
}

export async function updateAbsenceStatus(
  statusId: string,
  input: AbsenceStatusUpdate,
): Promise<AbsenceStatus> {
  return opsFetch(`/estados-programacion/${statusId}`, absenceStatusSchema, {
    method: "PUT",
    body: input,
    errorCopy: { 409: DUPLICATE_NAME_MESSAGE },
  });
}
