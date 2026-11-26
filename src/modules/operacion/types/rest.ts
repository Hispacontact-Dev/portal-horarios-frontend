// Descanso rotativo (brief §7): día de descanso no fijo, asignado según necesidad operativa y
// rotación semanal.
//
// Regla del brief: el descanso queda registrado como un ESTADO de programación, no como una entidad
// aparte. Por eso lleva `status_id` y ocupa el día completo. Y por eso tampoco se contabiliza en la
// cobertura: entra por la misma puerta que cualquier estado de ausencia.
//
// Vocabulario: `Rest`, nunca `dayoff` (T-001 §2.2).

import { z } from "zod";

import { isoDateSchema } from "./primitives";

export const restSchema = z.object({
  agent_id: z.string(),
  date: isoDateSchema,
  // El estado de ausencia con el que se registra el descanso. Es un dato, no una constante: el
  // catálogo de estados vive en el backend y C-05 (si se comparte con el portal de Junta) sigue
  // abierta.
  status_id: z.string(),
});

export type Rest = z.infer<typeof restSchema>;

// Cubre la asignación individual y la masiva del brief §7: individual es un lote de un agente. El
// día se elige a mano, que es exactamente lo que pide el brief ("seleccionar manualmente el día").
export const restAssignmentInputSchema = z.object({
  agent_ids: z.array(z.string()).min(1, "Hay que elegir al menos un agente"),
  date: isoDateSchema,
  status_id: z.string(),
});

export type RestAssignmentInput = z.infer<typeof restAssignmentInputSchema>;

// Vista "agentes que descansan por día" del brief §7. Viajan los ids y no los nombres: la pantalla
// ya tiene cargado el maestro de agentes de la campaña, así que denormalizar el nombre acá sería
// duplicar un dato que puede quedar viejo.
export const restsByDaySchema = z.object({
  date: isoDateSchema,
  agent_ids: z.array(z.string()),
});

export type RestsByDay = z.infer<typeof restsByDaySchema>;
