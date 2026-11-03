// Zona horaria del portal: Colombia no tiene horario de verano, así que el offset es
// fijo todo el año (spec 004 del backend, RNF-5).
export const PORTAL_TIME_ZONE = "America/Bogota";
const PORTAL_UTC_OFFSET = "-05:00";

const HAS_TIME_ZONE = /(?:Z|[+-]\d{2}:?\d{2})$/;

/**
 * El backend guarda `occurred_at` como UTC "naive" y lo serializa sin sufijo
 * ("2026-11-03T14:44:00"), que `new Date()` interpretaría como hora local. Se le agrega
 * la Z para que siempre se lea como UTC antes de formatear en hora de Bogotá.
 */
export function parseBackendDate(value: string): Date {
  return new Date(HAS_TIME_ZONE.test(value) ? value : `${value}Z`);
}

// Año completo y no `dateStyle: "short"`, que en es-CO abrevia a "3/11/26" y queda
// ambiguo en el detalle de una entrada y en el CSV.
const dateTimeFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: PORTAL_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const dateFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: PORTAL_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeShortFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: PORTAL_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// "en-CA" da el día en formato ISO (2026-11-03), que sirve como clave de agrupación.
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: PORTAL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dayLabelFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: PORTAL_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "short",
});

export function formatDate(value: string): string {
  return dateFormat.format(parseBackendDate(value));
}

export function formatDateTime(value: string): string {
  return dateTimeFormat.format(parseBackendDate(value));
}

export function formatTimeShort(value: string): string {
  return timeShortFormat.format(parseBackendDate(value));
}

/** Día local de Bogotá de un instante del backend, como "2026-11-03". */
export function bogotaDayKey(value: string): string {
  return dayKeyFormat.format(parseBackendDate(value));
}

export function todayDayKey(): string {
  return dayKeyFormat.format(new Date());
}

/** Suma (o resta) días a una clave de día, sin salirse del calendario local. */
export function addDaysToDayKey(dayKey: string, days: number): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Etiqueta de encabezado de día: "Hoy · lunes, 3 nov". */
export function formatDayLabel(dayKey: string): string {
  // Mediodía UTC: cualquier offset del continente cae dentro del mismo día local.
  const base = dayLabelFormat.format(new Date(`${dayKey}T12:00:00Z`));
  const today = todayDayKey();
  if (dayKey === today) return `Hoy · ${base}`;
  if (dayKey === addDaysToDayKey(today, -1)) return `Ayer · ${base}`;
  return base;
}

/**
 * Extremos del día en hora de Bogotá, para los filtros `date_from`/`date_to` del backend:
 * sin el offset explícito los interpretaría como medianoche UTC y el rango quedaría
 * corrido cinco horas.
 */
export function bogotaDayStart(dayKey: string): string {
  return `${dayKey}T00:00:00${PORTAL_UTC_OFFSET}`;
}

export function bogotaDayEnd(dayKey: string): string {
  return `${dayKey}T23:59:59.999${PORTAL_UTC_OFFSET}`;
}
