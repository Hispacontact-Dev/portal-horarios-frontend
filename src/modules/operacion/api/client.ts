// Cliente HTTP del módulo. Es la única puerta de salida de `api/`: ningún servicio llama a
// `apiFetch` por su cuenta, y mucho menos a `fetch`.
//
// Reutiliza el chasis tal como está (T-005 no toca `@/lib/api/client` ni `@/lib/api/errors`, que
// están fuera de la lista de excepciones de T-001 §1.2) y le agrega las tres cosas que el módulo
// necesita y el portal de Junta no tiene:
//
//   1. Validación de la respuesta con el esquema de T-004. `apiFetch` hace `JSON.parse(text) as T`,
//      un cast ciego: si el backend cambia un campo, el error aparece recién al pintar la grilla.
//   2. Normalización de horas y fechas al formato del contrato (ver `normalize.ts`).
//   3. Copy de error por status, para que un 409 de la grilla diga lo que pasó en vez de
//      "Ya existe o hay un conflicto".
//
// Lo que NO hace: manejar el 401. Eso ya lo hace `apiFetch` (dispara el handler de sesión
// inválida) y `classifyError` (lo silencia para que no se pinte dos veces).

import { z } from "zod";

import { ApiError, apiFetch } from "@/lib/api/client";

import { normalizeOpsPayload } from "./normalize";

const CONTRACT_ERROR_MESSAGE = "La respuesta del servidor no tiene el formato esperado";
const PAYLOAD_ERROR_MESSAGE = "Hay datos inválidos en lo que se intentó guardar";

/**
 * Copy propio del módulo para los status que conviene explicar en términos de lo que la persona
 * estaba haciendo. 401 queda afuera a propósito: es del chasis.
 */
export type OpsErrorCopy = Partial<Record<403 | 404 | 409 | 422, string>>;

interface OpsFetchOptions {
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  /** Se serializa con `JSON.stringify`. `undefined` = petición sin cuerpo. */
  body?: unknown;
  signal?: AbortSignal;
  errorCopy?: OpsErrorCopy;
}

/**
 * Lo que viajó no cumple el contrato del Anexo A: la respuesta que llegó (`"response"`) o el
 * payload que se iba a enviar (`"request"`).
 *
 * Hereda de `ApiError` con status 422 por una razón concreta: `ClassifiedErrorKind` es un tipo
 * cerrado del chasis, así que no se puede agregar un `kind` nuevo, y 422 es el único status cuyo
 * copy `classifyError` toma de `body.message`. Así el mensaje llega hasta `ErrorState` sin tocar
 * ni `errors.ts` ni `useAsyncResource`. Quien necesite distinguirlo del 422 real del backend lo
 * hace con `instanceof OpsContractError`, y `issues` trae el campo y el motivo de cada falla.
 */
export class OpsContractError extends ApiError {
  readonly issues: string[];

  constructor(path: string, issues: string[], source: "request" | "response" = "response") {
    const message = source === "request" ? PAYLOAD_ERROR_MESSAGE : CONTRACT_ERROR_MESSAGE;
    super({ status: 422, message, body: { message, path, source, issues } });
    this.name = "OpsContractError";
    this.issues = issues;
  }
}

function describeIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const field = issue.path.join(".");
    return field === "" ? issue.message : `${field}: ${issue.message}`;
  });
}

/**
 * Valida contra `schema` lo que está por enviarse y devuelve el valor tipado.
 *
 * Es la frontera de escritura que justificó `zod` en T-004: el cargue masivo de agentes y la
 * grilla. Una fila o una celda mal formada que llega al backend vuelve como un 422 genérico; acá
 * se detecta antes, con el campo exacto.
 */
export function parseOpsPayload<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
  path: string,
): z.infer<TSchema> {
  const result = schema.safeParse(value);
  if (!result.success) throw new OpsContractError(path, describeIssues(result.error), "request");
  return result.data as z.infer<TSchema>;
}

function isCopyableStatus(status: number): status is 403 | 404 | 409 | 422 {
  return status === 403 || status === 404 || status === 409 || status === 422;
}

/**
 * El mensaje que el backend puso en `detail`.
 *
 * `classifyError` lee `body.message`, pero el backend usa `HTTPException`, así que hoy devuelve
 * `{"detail": …}` (ya pasa en `useCatalogDisable`, que lo detecta por substring). En un 422 de
 * Pydantic, `detail` además es un array de errores: se aplana a una línea legible.
 */
function detailMessage(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const { detail } = body as { detail?: unknown };

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item !== "object" || item === null) return null;
        const { msg, loc } = item as { msg?: unknown; loc?: unknown };
        if (typeof msg !== "string") return null;
        const field = Array.isArray(loc) ? loc.join(".") : null;
        return field ? `${field}: ${msg}` : msg;
      })
      .filter((message): message is string => message !== null);

    return messages.length === 0 ? null : messages.join(" · ");
  }

  return null;
}

/**
 * Devuelve el error que hay que propagar: el mismo, o una copia con el `message` que el módulo
 * quiere mostrar. Un `AbortError` o un fallo de red pasan intactos — los clasifica el chasis.
 */
function withOpsCopy(err: unknown, errorCopy: OpsErrorCopy | undefined): unknown {
  if (!(err instanceof ApiError)) return err;

  const fromCopy = isCopyableStatus(err.status) ? errorCopy?.[err.status] : undefined;
  // El `message` propio del backend manda sobre el `detail`: si lo mandó, es el más específico.
  const message = fromCopy ?? (err.body?.message ? null : detailMessage(err.body));
  if (message === null || message === undefined) return err;

  return new ApiError({ status: err.status, message, body: { ...err.body, message } });
}

/**
 * Pide `path`, valida la respuesta con `schema` y devuelve el tipo que ese esquema deriva.
 *
 * Para una respuesta sin cuerpo (204) el llamador pasa `z.void()`.
 */
export async function opsFetch<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  { method, body, signal, errorCopy }: OpsFetchOptions = {},
): Promise<z.infer<TSchema>> {
  let payload: unknown;

  try {
    payload = await apiFetch<unknown>(path, {
      ...(method ? { method } : {}),
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal,
    });
  } catch (err) {
    throw withOpsCopy(err, errorCopy);
  }

  const result = schema.safeParse(normalizeOpsPayload(payload));
  if (!result.success) throw new OpsContractError(path, describeIssues(result.error));

  return result.data as z.infer<TSchema>;
}
