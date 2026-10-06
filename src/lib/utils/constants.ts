import type { UserRole } from "@/types/user";
import type { EntityType } from "@/types/history";

export const ROUTE_PATHS = {
  login: "/login",
  dashboard: "/dashboard",
  empleados: "/empleados",
  areas: "/areas",
  estados: "/estados",
  usuarios: "/usuarios",
  auditoria: "/auditoria",
  horarios: "/horarios",
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  gestion_humana: "Gestión Humana",
  lider: "Líder",
};

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  employee: "Empleado",
  area: "Área",
  status: "Estado",
  user: "Usuario",
  login: "Inicio de sesión",
};
