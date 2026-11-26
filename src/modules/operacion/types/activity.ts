// Actividad: el concepto ÚNICO que identifica qué hace el agente en cada franja de su jornada
// (brief §2 y regla explícita de §8). Configurable por campaña, con color configurable.
//
// Rige el concepto único de ACTIVIDAD (T-001 §2.2): lo que el agente puede hacer se expresa como
// actividades habilitadas en `Agent.allowed_activity_ids`, nunca como un campo aparte. El chequeo
// mecánico de T-001 §2.3 vigila esa regla sobre todo `src/`, así que acá no se nombran los términos
// descartados ni siquiera para prohibirlos: el grep no distingue un comentario de un identificador.

import { z } from "zod";

import { auditFieldsSchema } from "./primitives";

export const activitySchema = auditFieldsSchema.extend({
  id: z.string(),
  // La actividad pertenece a una campaña: la relación se guarda de este lado y no como una lista
  // en `Campaign`, para que no haya dos fuentes de verdad del mismo vínculo.
  campaign_id: z.string(),
  name: z.string(),
  // Dato de negocio que llega del backend, no un token del tema: es la única excepción sancionada
  // al hex en componentes (T-001 §2.3). Puede venir vacío, y ahí la UI aplica un neutro de respaldo
  // con texto de contraste calculado.
  color: z.string(),
  // `true` en las actividades operativas, que son las que suman en la cobertura (brief §9). Misma
  // clave que en `AbsenceStatus`, para que el motor de cobertura lea un solo nombre de campo.
  counts_for_coverage: z.boolean(),
  is_enabled: z.boolean(),
});

export type Activity = z.infer<typeof activitySchema>;

export const activityCreateSchema = z.object({
  campaign_id: z.string(),
  name: z.string().min(1, "El nombre de la actividad es obligatorio"),
  color: z.string(),
  counts_for_coverage: z.boolean(),
});

export type ActivityCreate = z.infer<typeof activityCreateSchema>;

// `campaign_id` queda fuera a propósito: mover una actividad de campaña dejaría huérfanas las
// celdas ya programadas con ella. Si alguna vez se necesita, es una operación propia, no un parche.
export const activityUpdateSchema = activityCreateSchema.omit({ campaign_id: true }).partial();

export type ActivityUpdate = z.infer<typeof activityUpdateSchema>;
