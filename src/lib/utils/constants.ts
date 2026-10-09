import type { Role } from "@/types/session";

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

export const ROLE_LABELS: Record<Role, string> = {
  gestion_humana: "Gestión Humana",
  lider: "Líder",
};
