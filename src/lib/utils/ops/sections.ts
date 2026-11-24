import { ROUTE_PATHS } from "@/lib/utils/constants";

export type OpsSectionKey =
  | "agentes"
  | "actividades"
  | "turnos"
  | "descansos"
  | "programacion"
  | "cobertura"
  | "publicacion"
  | "historial";

export interface OpsSection {
  key: OpsSectionKey;
  label: string;
  path: string;
}

function section(key: OpsSectionKey, label: string): OpsSection {
  return { key, label, path: `${ROUTE_PATHS.operacion}/${key}` };
}

// Fuente única de las sub-pestañas del módulo: de acá salen el menú, los breadcrumbs y los
// títulos de página. El orden es el del recorrido de trabajo, de maestros a resultado.
export const OPS_SECTIONS: OpsSection[] = [
  section("agentes", "Agentes"),
  section("actividades", "Actividades"),
  section("turnos", "Turnos"),
  section("descansos", "Descansos"),
  section("programacion", "Programación"),
  section("cobertura", "Cobertura"),
  section("publicacion", "Publicación"),
  section("historial", "Historial"),
];

// Todo el módulo cuelga de un solo prefijo: con esto el middleware decide de quién es la
// ruta sin repetir el string.
export function isOpsRoute(pathname: string): boolean {
  const base = ROUTE_PATHS.operacion;
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function opsSectionByKey(key: OpsSectionKey): OpsSection {
  const found = OPS_SECTIONS.find((it) => it.key === key);
  if (!found) throw new Error(`Sub-pestaña desconocida del módulo de operación: ${key}`);
  return found;
}
