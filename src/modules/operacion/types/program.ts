// Programación diaria por agente y actividad (brief §8): el módulo principal del producto.
//
// El modelo tiene DOS representaciones de lo mismo, y las dos son necesarias:
//
//   - `ProgramSegment`: la forma compacta — desde `start` hasta `end` con un único contenido. Es la
//     que viaja al backend y la que se edita, porque una jornada son unos pocos tramos.
//   - `ProgramCell`: la forma expandida, una por franja. Es la que pinta la grilla, que son agentes
//     en filas y franjas en columnas.
//
// La conversión entre ambas es lógica pura y vive en `engine/` (T-005). Acá solo va el modelo.
//
// Vocabulario: `DayProgram` / `ProgramCell`, nunca `Schedule`, que está ocupado por el portal de
// Junta (T-001 §2.2).

import { z } from "zod";

import { isoDateSchema, slotMinutesSchema, slotSchema, timeOfDaySchema } from "./primitives";
import { weekPublicationStateSchema } from "./publication";

// Qué hay en una franja. Son los dos únicos contenidos posibles, y van discriminados por `kind`
// para que el motor de cobertura no pueda contar una ausencia como si fuera trabajo: el tipo lo
// obliga a mirar el discriminante antes de leer el id.
export const programCellContentSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("activity"),
    activity_id: z.string(),
  }),
  z.object({
    kind: z.literal("absence"),
    status_id: z.string(),
  }),
]);

export type ProgramCellContent = z.infer<typeof programCellContentSchema>;

// Las dos ramas, con nombre propio: las firmas de los guards se leen solas y el motor de
// cobertura puede pedir exactamente la rama que sabe contar.
export type ActivityCell = Extract<ProgramCellContent, { kind: "activity" }>;

export type AbsenceCell = Extract<ProgramCellContent, { kind: "absence" }>;

export const programSegmentSchema = z.object({
  start: timeOfDaySchema,
  end: timeOfDaySchema,
  content: programCellContentSchema,
});

export type ProgramSegment = z.infer<typeof programSegmentSchema>;

export const programCellSchema = slotSchema.extend({
  // `null` en una franja que cae fuera del turno del agente. No es lo mismo que una ausencia: ahí
  // no hay jornada que cubrir, así que la celda va vacía y no suma ni resta en la cobertura.
  content: programCellContentSchema.nullable(),
});

export type ProgramCell = z.infer<typeof programCellSchema>;

export const dayProgramSchema = z.object({
  agent_id: z.string(),
  date: isoDateSchema,
  segments: z.array(programSegmentSchema),
  // `null` cuando el día todavía no tiene programación guardada: no hay versión que comparar. Se
  // reenvía tal cual en `expected_updated_at` (mismo criterio que `ScheduleDayEntry` en el portal
  // de Junta).
  updated_at: z.string().nullable(),
});

export type DayProgram = z.infer<typeof dayProgramSchema>;

// Una fila de la grilla por agente. `full_name` viaja denormalizado por el mismo motivo que en
// `EmployeeWeekSchedule`: es el payload principal de la pantalla y la fila necesita el nombre sin
// una segunda petición.
export const agentWeekProgramSchema = z.object({
  agent_id: z.string(),
  full_name: z.string(),
  days: z.array(dayProgramSchema),
});

export type AgentWeekProgram = z.infer<typeof agentWeekProgramSchema>;

export const weekProgramSchema = z.object({
  week_start: isoDateSchema,
  week_end: isoDateSchema,
  // La fecha del servidor, para no depender del reloj del navegador al marcar el día en curso.
  server_today: isoDateSchema,
  campaign_id: z.string(),
  // El estado de la semana viaja con la programación: la grilla tiene que poder avisar que lo que
  // se está editando ya está publicado, y el portal del agente solo puede ver semanas publicadas
  // (restricción clave del objetivo del brief).
  state: weekPublicationStateSchema,
  // El rango operativo y la franja salen de la campaña, pero viajan en la respuesta para que la
  // grilla arme sus columnas sin una segunda petición.
  operating_start: timeOfDaySchema,
  operating_end: timeOfDaySchema,
  slot_minutes: slotMinutesSchema,
  agents: z.array(agentWeekProgramSchema),
});

export type WeekProgram = z.infer<typeof weekProgramSchema>;

// Filtros de la vista, los cinco del brief §8. `null` es "sin filtro".
export const programFiltersSchema = z.object({
  campaign_id: z.string().nullable(),
  week_start: isoDateSchema.nullable(),
  date: isoDateSchema.nullable(),
  agent_id: z.string().nullable(),
  activity_id: z.string().nullable(),
});

export type ProgramFilters = z.infer<typeof programFiltersSchema>;

// Unidad de escritura: el agente-día completo, en lote. C-01 sigue abierta, y esta es la
// granularidad que el backend ya sabe versionar hoy (`expected_updated_at` es por día).
//
// `expected_updated_at` se reenvía tal cual lo entregó la lectura, incluido el `null` de un día sin
// programación: el backend compara por igualdad exacta y la clave es obligatoria en el payload.
export const dayProgramSaveInputSchema = z.object({
  agent_id: z.string(),
  date: isoDateSchema,
  segments: z.array(programSegmentSchema),
  expected_updated_at: z.string().nullable(),
});

export type DayProgramSaveInput = z.infer<typeof dayProgramSaveInputSchema>;
