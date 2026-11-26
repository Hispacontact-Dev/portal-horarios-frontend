// Piezas compartidas por todos los tipos del módulo. Reflejan el contrato del backend, no la UI.
//
// Se redeclaran acá a propósito en vez de reutilizar `@/types/schedule`: la frontera del módulo
// (T-003) solo admite `@/types/session`, y T-001 §2.2 reserva `Schedule` al portal de Junta.
//
// Convención del módulo: el esquema es la fuente de verdad y el tipo se deriva con `z.infer`,
// así no hay dos definiciones que puedan desincronizarse.

import { z } from "zod";

// Formatos copiados tal cual del backend (`src/schemas/schedule.py`): la fecha viaja como
// "YYYY-MM-DD" y la hora como "HH:MM" en 24 horas. Se replica el regex de `TIME_PATTERN` en vez
// de usar `z.iso.time()`, que además aceptaría segundos.
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe venir como YYYY-MM-DD");

export type IsoDate = z.infer<typeof isoDateSchema>;

export const timeOfDaySchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe venir como HH:MM en formato de 24 horas");

export type TimeOfDay = z.infer<typeof timeOfDaySchema>;

// La semana del módulo va de lunes a domingo: la operación cubre el fin de semana, así que no
// hay días que queden fuera de la programación.
export const weekdaySchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export type Weekday = z.infer<typeof weekdaySchema>;

export const timeRangeSchema = z.object({
  start: timeOfDaySchema,
  end: timeOfDaySchema,
});

export type TimeRange = z.infer<typeof timeRangeSchema>;

// Duración de la franja en minutos. El brief fija 30 como valor inicial y la declara configurable
// por campaña; C-10 (granularidades admitidas) sigue abierta, así que acá no se cierra el conjunto
// de valores posibles.
export const slotMinutesSchema = z.number().int().positive();

export type SlotMinutes = z.infer<typeof slotMinutesSchema>;

// Una franja: la columna de la grilla de programación. `slot_end` se deriva de `slot_minutes` de
// la campaña, pero viaja explícito para que la grilla no tenga que recalcularlo celda por celda.
export const slotSchema = z.object({
  slot_start: timeOfDaySchema,
  slot_end: timeOfDaySchema,
});

export type Slot = z.infer<typeof slotSchema>;

// Campos de auditoría que repiten los catálogos del módulo. `null` mientras nadie haya tocado la
// entrada: el backend los devuelve vacíos hasta el primer cambio (mismo criterio que
// `src/types/area.ts` en el portal de Junta).
export const auditFieldsSchema = z.object({
  created_at: z.string(),
  created_by: z.string().nullable(),
  updated_at: z.string().nullable(),
  updated_by: z.string().nullable(),
});

export type AuditFields = z.infer<typeof auditFieldsSchema>;
