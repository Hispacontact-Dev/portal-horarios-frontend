import type { Role } from "@/types/session";
import type { EmployeePosition } from "@/types/employee";
import type { Weekday } from "@/types/schedule";

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

// Días de la semana, de lunes a domingo. `WORKWEEK_WEEKDAYS` es el predeterminado laboral: el fin
// de semana nace apagado en los editores y se marca a mano cuando se programa un turno.
export const WEEKDAY_ORDER: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const WORKWEEK_WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export const WEEKDAY_SHORT_LABELS: Record<Weekday, string> = {
  monday: "L",
  tuesday: "M",
  wednesday: "X",
  thursday: "J",
  friday: "V",
  saturday: "S",
  sunday: "D",
};
