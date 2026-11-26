// Normalización de formatos antes de validar la respuesta del backend.
//
// El contrato acordado en `backlog/ANEXO-A-T005-CONTRATO-API.md` §2 es `"HH:MM"` para la hora y
// `"YYYY-MM-DD"` para la fecha, que es lo que exigen los esquemas de T-004. Esta capa tolera las
// dos variantes que el backend podría mandar sin querer —la hora con segundos y la fecha como
// datetime completo— en vez de hacer fallar la pantalla por eso.
//
// Es una red de seguridad, no un permiso: el formato que se le pide al backend sigue siendo el del
// Anexo A, y los tipos de T-004 no se relajan para acomodar la variante (regla de AGENTS.md).

// Se reconoce por la forma, no por la clave: un timestamp de auditoría nunca es solo "HH:MM:SS".
const TIME_WITH_SECONDS = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

// Acá sí hace falta una lista explícita de claves. `created_at`, `updated_at`, `published_at` y
// `occurred_at` son timestamps y tienen que quedar completos; recortarles la hora los arruinaría.
// Estas son las claves que los esquemas declaran como `isoDateSchema`.
const DATE_ONLY_KEYS = new Set([
  "date",
  "week_start",
  "week_end",
  "server_today",
  "start_date",
  "end_date",
  "skipped_date",
  "date_from",
  "date_to",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: string, key: string | null): string {
  if (TIME_WITH_SECONDS.test(value)) return value.slice(0, 5);
  if (key !== null && DATE_ONLY_KEYS.has(key) && value.includes("T")) return value.split("T")[0];
  return value;
}

// `key` es la clave que contiene al valor: se arrastra en el recorrido porque la decisión sobre las
// fechas depende de ella. En un array se propaga la del array, así que una lista de fechas bajo una
// clave de fecha también se normaliza.
function normalizeValue(value: unknown, key: string | null): unknown {
  if (typeof value === "string") return normalizeString(value, key);
  if (Array.isArray(value)) return value.map((item) => normalizeValue(item, key));
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalizeValue(v, k)]));
  }
  return value;
}

/** La respuesta con las horas y fechas llevadas al formato del contrato. No muta la entrada. */
export function normalizeOpsPayload(payload: unknown): unknown {
  return normalizeValue(payload, null);
}
