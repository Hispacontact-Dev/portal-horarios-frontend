// Campaña: la agrupación operativa a la que pertenece un agente (brief §2). Define qué actividades
// tiene disponibles y con qué granularidad se programa.
//
// Vocabulario: `Campaign`, nunca `Area` (T-001 §2.2). El catálogo de Áreas del portal de Junta es
// otra entidad y no se importa ni se extiende.

import { z } from "zod";

import { auditFieldsSchema, slotMinutesSchema, timeOfDaySchema } from "./primitives";

export const campaignSchema = auditFieldsSchema.extend({
  id: z.string(),
  name: z.string(),
  is_enabled: z.boolean(),
  // Rango operativo de la campaña. El brief §8 fija 07:00–20:30 para la operación actual y lo
  // declara configurable por campaña; C-10 sigue abierta, así que el rango es dato, no constante.
  operating_start: timeOfDaySchema,
  operating_end: timeOfDaySchema,
  slot_minutes: slotMinutesSchema,
});

export type Campaign = z.infer<typeof campaignSchema>;

export const campaignCreateSchema = z.object({
  name: z.string().min(1, "El nombre de la campaña es obligatorio"),
  operating_start: timeOfDaySchema,
  operating_end: timeOfDaySchema,
  slot_minutes: slotMinutesSchema,
});

export type CampaignCreate = z.infer<typeof campaignCreateSchema>;

export const campaignUpdateSchema = campaignCreateSchema.partial();

export type CampaignUpdate = z.infer<typeof campaignUpdateSchema>;
