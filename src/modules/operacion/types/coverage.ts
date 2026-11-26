// Resumen de cobertura por hora (brief §9). Se genera a partir de la programación individual: filas
// = actividades, columnas = horas, celdas = cantidad de agentes, y una última fila con el total de
// agentes en operación.
//
// Es una vista DERIVADA: la calcula `engine/` a partir de `WeekProgram` y se recalcula al modificar
// cualquier programación (brief §9, regla 5). Esta es su forma, la produzca el motor o la devuelva
// el backend.
//
// Dos reglas del brief que el modelo tiene que respetar:
//   - Los estados de ausencia NO entran: no hay filas de break, almuerzo ni descanso.
//   - El total no duplica a un agente que cambió de actividad dentro de la misma hora.
//
// Vocabulario: `Coverage` / `CoverageRow`, nunca `KPI` ni `report` (T-001 §2.2).

import { z } from "zod";

import { isoDateSchema, timeOfDaySchema } from "./primitives";

// Cantidad de agentes por hora, indexada por la hora. Se usa un objeto y no un arreglo paralelo a
// `hours` a propósito: un arreglo desalineado por uno daría cifras creíbles pero falsas, y ese error
// es silencioso.
export const coverageCountsByHourSchema = z.record(timeOfDaySchema, z.number().int().nonnegative());

export type CoverageCountsByHour = z.infer<typeof coverageCountsByHourSchema>;

export const coverageRowSchema = z.object({
  activity_id: z.string(),
  // El nombre viaja con la fila porque es el encabezado visible de la fila del reporte.
  activity_name: z.string(),
  counts: coverageCountsByHourSchema,
});

export type CoverageRow = z.infer<typeof coverageRowSchema>;

export const coverageTableSchema = z.object({
  campaign_id: z.string(),
  date: isoDateSchema,
  // Las horas que forman las columnas, en orden. La cobertura es por HORA, no por franja: dos
  // franjas de 30 minutos caen en la misma columna.
  hours: z.array(timeOfDaySchema),
  rows: z.array(coverageRowSchema),
  // La última fila del reporte: agentes en operación por hora, sin duplicar agentes.
  totals: coverageCountsByHourSchema,
});

export type CoverageTable = z.infer<typeof coverageTableSchema>;

export const coverageFiltersSchema = z.object({
  campaign_id: z.string().nullable(),
  date: isoDateSchema.nullable(),
});

export type CoverageFilters = z.infer<typeof coverageFiltersSchema>;
