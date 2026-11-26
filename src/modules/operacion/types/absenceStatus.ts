// Estado de ausencia: break, almuerzo, descanso semanal, vacaciones, incapacidad, permisos y otros
// (brief §2). Aparece en la programación individual del agente pero queda EXCLUIDO de la cobertura.
//
// C-05 sigue abierta (si el catálogo de Estados se comparte con el portal de Junta o se separa).
// Hasta que se cierre, el módulo declara su propio tipo y no importa `@/types/status`.

import { z } from "zod";

import { auditFieldsSchema } from "./primitives";

export const absenceStatusSchema = auditFieldsSchema.extend({
  id: z.string(),
  name: z.string(),
  is_enabled: z.boolean(),
  // Se consume tal cual lo entrega el backend (T-001 §2.2): `true` cuando el estado bloquea la
  // asignación de turnos.
  blocks_shifts: z.boolean(),
  // Constante por regla del brief §9: ningún estado de ausencia entra en la cobertura. Viaja
  // explícito, y no derivado, para que el motor lea la misma clave en una actividad y en un estado.
  counts_for_coverage: z.literal(false),
});

export type AbsenceStatus = z.infer<typeof absenceStatusSchema>;

export const absenceStatusCreateSchema = z.object({
  name: z.string().min(1, "El nombre del estado es obligatorio"),
  blocks_shifts: z.boolean(),
});

export type AbsenceStatusCreate = z.infer<typeof absenceStatusCreateSchema>;

export const absenceStatusUpdateSchema = absenceStatusCreateSchema.partial();

export type AbsenceStatusUpdate = z.infer<typeof absenceStatusUpdateSchema>;
