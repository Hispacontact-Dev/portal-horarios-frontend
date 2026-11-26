// Historial de modificaciones del módulo (brief §12, listado sin desarrollar).
//
// La forma espeja el contrato de auditoría del portal de Junta (`src/types/history.ts`): mismos
// campos, mismo orden, misma semántica de `changes`. Se redeclara porque la frontera del módulo no
// admite importar `@/types/history`, no porque sea un contrato distinto — si Auditoría se reutiliza
// tal cual, estos tipos ya encajan.
//
// C-04 sigue abierta: la granularidad del historial (celda / agente-día / semana) y quién lo
// consulta. Acá la entidad más fina es el agente-día (`day_program`), NO la celda: un registro por
// celda haría el historial ilegible e inflado, que es el riesgo anotado en `AUDITORIA-T000.md` §4.7.
// Si C-04 decide bajar a la celda, se agrega el valor a la enumeración.

import { z } from "zod";

export const opsEntityTypeSchema = z.enum([
  "agent",
  "campaign",
  "activity",
  "absence_status",
  "shift_template",
  "day_program",
  "week_publication",
]);

export type OpsEntityType = z.infer<typeof opsEntityTypeSchema>;

export const opsHistoryChangeSchema = z.object({
  field: z.string(),
  old_value: z.unknown(),
  new_value: z.unknown(),
});

export type OpsHistoryChange = z.infer<typeof opsHistoryChangeSchema>;

export const opsChangeRecordSchema = z.object({
  id: z.string(),
  entity_type: opsEntityTypeSchema,
  entity_id: z.string().nullable(),
  action: z.string(),
  actor_id: z.string().nullable(),
  actor_name: z.string(),
  changes: z.array(opsHistoryChangeSchema),
  occurred_at: z.string(),
});

export type OpsChangeRecord = z.infer<typeof opsChangeRecordSchema>;

export const opsHistoryFiltersSchema = z.object({
  entity_type: opsEntityTypeSchema.optional(),
  entity_id: z.string().optional(),
  actor_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export type OpsHistoryFilters = z.infer<typeof opsHistoryFiltersSchema>;
