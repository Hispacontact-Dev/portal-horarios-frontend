// Agente: el maestro de agentes operativos (brief §4). Cada registro lleva los seis datos que el
// brief fija: nombre, campaña, estado, actividades que puede realizar, horas semanales contratadas
// e identificador de usuario para ingresar al portal.
//
// Vocabulario: `Agent`, nunca `Employee` (T-001 §2.2). El maestro de empleados del portal de Junta
// es otra entidad; acá no se importa ni se extiende ninguno de sus tipos.

import { z } from "zod";

import { auditFieldsSchema } from "./primitives";

// Enumeración pedida por T-004. El resto del repo usa un booleano (`is_active`) para lo mismo, pero
// el desglose de la tarea pide explícitamente una enumeración de estado de agente.
export const agentStatusSchema = z.enum(["active", "inactive"]);

export type AgentStatus = z.infer<typeof agentStatusSchema>;

export const agentSchema = auditFieldsSchema.extend({
  id: z.string(),
  full_name: z.string(),
  campaign_id: z.string(),
  status: agentStatusSchema,
  // Las actividades que el agente puede realizar. El brief §4 lo vuelve regla de negocio: no se
  // puede programarle una actividad que no esté en esta lista. La regla la aplica el motor al
  // editar la grilla; acá solo vive el dato.
  allowed_activity_ids: z.array(z.string()),
  // Horas semanales contratadas. Admite fracción porque hay jornadas de media hora. C-14 (si el
  // sistema avisa cuando el acumulado programado no coincide) sigue abierta: el dato está, la
  // alerta no se asume.
  weekly_contracted_hours: z.number().positive(),
  // `null` en un agente que todavía no tiene acceso al portal: el brief lo lista como dato del
  // maestro, y C-06 (rol `agente`) sigue abierta, así que el alta no puede exigirlo.
  user_id: z.string().nullable(),
});

export type Agent = z.infer<typeof agentSchema>;

export const agentCreateSchema = z.object({
  full_name: z.string().min(1, "El nombre del agente es obligatorio"),
  campaign_id: z.string(),
  allowed_activity_ids: z.array(z.string()),
  weekly_contracted_hours: z.number().positive("Las horas contratadas deben ser mayores a cero"),
  user_id: z.string().nullable(),
});

export type AgentCreate = z.infer<typeof agentCreateSchema>;

// El alta no recibe `status`: un agente nace activo y se inactiva después, que es la operación que
// el brief §4 describe ("activar o inactivar agentes").
export const agentUpdateSchema = agentCreateSchema.partial().extend({
  status: agentStatusSchema.optional(),
});

export type AgentUpdate = z.infer<typeof agentUpdateSchema>;

// El brief §4 pide filtrar por campaña. `status` se agrega porque el maestro conserva a los agentes
// inactivos y sin ese filtro la lista no es usable. `null` es "sin filtro", igual que
// `ScheduleFilters` en el portal de Junta.
export const agentFiltersSchema = z.object({
  campaign_id: z.string().nullable(),
  status: agentStatusSchema.nullable(),
});

export type AgentFilters = z.infer<typeof agentFiltersSchema>;

// Cargue masivo. C-12 (formato CSV/Excel, columnas y manejo de errores) sigue abierta: lo único que
// se asume es lo que el brief §4 sí fija, que las columnas son los campos de alta. `row_number`
// permite reportar el error en su fila, porque una fila rechazada todavía no tiene `id`.
export const agentBulkRowSchema = agentCreateSchema.extend({
  row_number: z.number().int().positive(),
});

export type AgentBulkRow = z.infer<typeof agentBulkRowSchema>;

export const agentBulkSkippedSchema = z.object({
  row_number: z.number().int().positive(),
  reason: z.string(),
});

export type AgentBulkSkipped = z.infer<typeof agentBulkSkippedSchema>;

// Resultado parcial, con el mismo molde que `BulkAssignmentResult` del portal de Junta: el lote no
// es todo o nada, así que informa qué entró y qué se saltó con su motivo.
export const agentBulkResultSchema = z.object({
  created: z.array(agentSchema),
  skipped: z.array(agentBulkSkippedSchema),
});

export type AgentBulkResult = z.infer<typeof agentBulkResultSchema>;
