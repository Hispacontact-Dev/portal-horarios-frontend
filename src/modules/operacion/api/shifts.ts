// Plantillas de turno y asignación de turnos (brief §6). Planeación asigna los turnos antes de
// entrar a la programación diaria.
//
// Contrato: `backlog/ANEXO-A-T005-CONTRATO-API.md` §4.
//
// `/turnos` NO es `/shift-templates` del portal de Junta: ese guarda `blocks: TimeRange[]` y este
// guarda `start` / `end` / `weekdays`. Son dos recursos distintos con nombres parecidos (T-001
// §2.2); tocar el existente para que sirva a los dos rompería el portal en producción.

import { z } from "zod";

import {
  shiftAssignmentResultSchema,
  shiftTemplateSchema,
  type ShiftAssignmentInput,
  type ShiftAssignmentResult,
  type ShiftTemplate,
  type ShiftTemplateCreate,
  type ShiftTemplateUpdate,
} from "../types/shift";
import { opsFetch } from "./client";

export async function listShiftTemplates(signal?: AbortSignal): Promise<ShiftTemplate[]> {
  return opsFetch("/turnos", z.array(shiftTemplateSchema), { signal });
}

export async function createShiftTemplate(input: ShiftTemplateCreate): Promise<ShiftTemplate> {
  return opsFetch("/turnos", shiftTemplateSchema, {
    method: "POST",
    body: input,
    errorCopy: { 409: "Ya existe una plantilla de turno con ese nombre" },
  });
}

// Regla del brief §6: un turno se modifica sin reconstruir la programación. Editar la plantilla no
// reescribe lo ya programado; para eso está `assignShift`.
export async function updateShiftTemplate(
  templateId: string,
  input: ShiftTemplateUpdate,
): Promise<ShiftTemplate> {
  return opsFetch(`/turnos/${templateId}`, shiftTemplateSchema, { method: "PUT", body: input });
}

/**
 * Asigna un turno a uno o varios agentes en un rango de fechas. Individual y masiva son la misma
 * llamada: individual es un lote de un agente.
 *
 * El lote no es todo o nada: devuelve los agentes asignados y los saltados con su motivo. El
 * payload no se valida acá porque viene de un formulario, que es quien puede señalar el campo
 * incompleto; la validación de forma vive en la pantalla.
 */
export async function assignShift(input: ShiftAssignmentInput): Promise<ShiftAssignmentResult> {
  return opsFetch("/asignaciones-turno", shiftAssignmentResultSchema, { method: "POST", body: input });
}
