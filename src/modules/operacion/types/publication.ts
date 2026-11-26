// Publicación semanal (brief §10). La restricción clave del objetivo del brief: se debe poder
// trabajar con semanas EN CONSTRUCCIÓN sin que los agentes vean horarios no publicados.
//
// C-07 sigue abierta: quién publica, si es reversible (despublicar) y si se publica por campaña o
// la semana completa. Acá se modela lo único que el brief sí afirma — que una semana está en uno de
// dos estados — y se deja la publicación por campaña+semana, que es la unidad que ya tiene
// `WeekProgram`. Si C-07 decide que es por semana completa, `campaign_id` sale de este tipo.

import { z } from "zod";

import { isoDateSchema } from "./primitives";

// Enumeración pedida por T-004. Ojo con el copy: los identificadores son `draft` / `published`,
// pero en pantalla se escribe "En construcción" / "Publicada" — nunca "Borrador" (T-001 §2.2).
export const weekPublicationStateSchema = z.enum(["draft", "published"]);

export type WeekPublicationState = z.infer<typeof weekPublicationStateSchema>;

export const weekPublicationSchema = z.object({
  campaign_id: z.string(),
  week_start: isoDateSchema,
  state: weekPublicationStateSchema,
  // `null` mientras la semana sigue en construcción: todavía nadie la publicó.
  published_at: z.string().nullable(),
  published_by: z.string().nullable(),
});

export type WeekPublication = z.infer<typeof weekPublicationSchema>;

// Solo publicar. Despublicar NO se modela todavía: C-07 no definió si la operación es reversible, y
// un input con el estado como parámetro daría por cerrada esa decisión.
export const publishInputSchema = z.object({
  campaign_id: z.string(),
  week_start: isoDateSchema,
});

export type PublishInput = z.infer<typeof publishInputSchema>;
