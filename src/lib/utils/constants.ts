import type { Role } from "@/types/session";
import type { EmployeePosition } from "@/types/employee";

export const ROUTE_PATHS = {
  login: "/login",
  dashboard: "/dashboard",
  empleados: "/empleados",
  areas: "/areas",
  estados: "/estados",
  usuarios: "/usuarios",
  auditoria: "/auditoria",
  horarios: "/horarios",
  configuracion: "/configuracion",
} as const;

export const ROLE_LABELS: Record<Role, string> = {
  gestion_humana: "Gestión Humana",
  lider: "Líder",
};

export const POSITION_LABELS: Record<EmployeePosition, string> = {
  recursos_humanos: "Recursos Humanos",
  lider: "Líder",
  practicante: "Practicante",
};
