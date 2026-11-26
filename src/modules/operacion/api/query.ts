// Armado de query strings para los servicios del módulo.
//
// Los filtros de `@ops/types` usan `null` para decir "sin filtro" (`AgentFilters`,
// `ProgramFilters`, `CoverageFilters`), así que la clave no tiene que viajar: un
// `?campaign_id=null` el backend lo recibiría como el string "null".
//
// Mismo criterio que `src/lib/api/history.ts`, el único servicio del portal de Junta con query
// dinámico, pero acá queda en una función en vez de repetir el filtrado en cada wrapper.

export type QueryValue = string | number | boolean | null | undefined;

/** El query string listo para concatenar (`"?a=1&b=2"`), o `""` si no quedó ningún parámetro. */
export function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    // El string vacío entra en la misma bolsa que `null`: un filtro que el usuario borró no es
    // un filtro por "nada".
    if (value === null || value === undefined || value === "") continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return query === "" ? "" : `?${query}`;
}
