import type { Role } from "@/types/session";
import type { UserRole } from "@/types/user";
import { ROLE_LABELS, ROUTE_PATHS } from "@/lib/utils/constants";

export function canonicalRole(role: UserRole): Role {
  if (role === "admin") return "gestion_humana";
  return role;
}

export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[canonicalRole(role)];
}

// Pantalla de entrada de cada rol: `planeacion` trabaja en el módulo de operación, los
// roles del portal de Junta Directiva en el dashboard.
export function landingPathForRole(role: Role): string {
  return role === "planeacion" ? ROUTE_PATHS.operacion : ROUTE_PATHS.dashboard;
}
