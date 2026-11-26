// Turno: la jornada del agente (brief §6). Plantilla de turno: un turno preconfigurado y
// reutilizable, asignable de forma masiva o individual.
//
// La duración de la jornada NO se almacena: se deriva de `start` y `end` en `engine/`. El brief la
// lista entre los datos del turno, pero guardarla junto a la entrada y la salida crearía dos
// fuentes de verdad que pueden contradecirse, que es justo lo que T-004 viene a evitar. Es también
// como lo resuelve hoy el portal de Junta (`AUDITORIA-T000.md` §2).

import { z } from "zod";

import { isoDateSchema, timeOfDaySchema, weekdaySchema } from "./primitives";

// El turno en sí es un valor, no un registro: entrada, salida y días de programación. Lo que se
// guarda con identidad propia es la plantilla.
export const shiftSchema = z.object({
  start: timeOfDaySchema,
  end: timeOfDaySchema,
  weekdays: z.array(weekdaySchema).min(1, "Hay que elegir al menos un día de programación"),
});

export type Shift = z.infer<typeof shiftSchema>;

export const shiftTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_enabled: z.boolean(),
  created_at: z.string(),
  created_by: z.string().nullable(),
  updated_at: z.string().nullable(),
  updated_by: z.string().nullable(),
  ...shiftSchema.shape,
});

export type ShiftTemplate = z.infer<typeof shiftTemplateSchema>;

export const shiftTemplateCreateSchema = shiftSchema.extend({
  name: z.string().min(1, "El nombre de la plantilla es obligatorio"),
});

export type ShiftTemplateCreate = z.infer<typeof shiftTemplateCreateSchema>;

export type ShiftTemplateUpdate = ShiftTemplateCreate;

// Una sola forma cubre la asignación individual y la masiva del brief §6: individual es un lote de
// un agente. Mismo molde que `BulkAssignmentInput` del portal de Junta (agentes + rango + días).
export const shiftAssignmentInputSchema = shiftSchema.extend({
  agent_ids: z.array(z.string()).min(1, "Hay que elegir al menos un agente"),
  start_date: isoDateSchema,
  end_date: isoDateSchema,
});

export type ShiftAssignmentInput = z.infer<typeof shiftAssignmentInputSchema>;

export const shiftAssignmentSkippedSchema = z.object({
  agent_id: z.string(),
  // `null` cuando el agente entero se saltó, no una fecha suya en particular.
  skipped_date: isoDateSchema.nullable(),
  reason: z.string(),
});

export type ShiftAssignmentSkipped = z.infer<typeof shiftAssignmentSkippedSchema>;

// El lote no es todo o nada: informa qué quedó asignado y qué se saltó con su motivo, igual que
// `BulkAssignmentResult` del portal de Junta.
export const shiftAssignmentResultSchema = z.object({
  assigned_agent_ids: z.array(z.string()),
  skipped: z.array(shiftAssignmentSkippedSchema),
});

export type ShiftAssignmentResult = z.infer<typeof shiftAssignmentResultSchema>;
