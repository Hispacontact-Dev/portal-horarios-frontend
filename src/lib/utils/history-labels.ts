import { POSITION_LABELS, ROLE_LABELS } from "@/lib/utils/constants";
import type { EntityType, HistoryChange, HistoryEntry } from "@/types/history";

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  employee: "Empleado",
  area: "Área",
  status: "Estado",
  position: "Cargo",
  shift_template: "Plantilla de turno",
  holiday: "Festivo",
  user: "Usuario",
  login: "Inicio de sesión",
};

export const ACTION_LABELS: Record<string, string> = {
  create: "creó",
  update: "actualizó",
  delete: "eliminó",
  disable: "deshabilitó",
  enable: "habilitó",
  deactivate: "retiró el acceso de",
  reset_password: "restableció la contraseña de",
  status_change: "cambió el estado de",
  delete_duplicate: "eliminó el duplicado de",
  login_success: "inició sesión",
  login_failed: "intentó iniciar sesión (sin éxito)",
};

export const FIELD_LABELS: Record<string, string> = {
  full_name: "Nombre completo",
  email: "Correo electrónico",
  role: "Rol",
  position: "Cargo",
  area: "Área",
  status: "Estado",
  name: "Nombre",
  date: "Fecha",
  is_national: "Festivo nacional",
  is_predefined: "Predefinido",
  blocks_shifts: "Bloquea turnos",
  blocks: "Bloques de horario",
  weekdays: "Días",
  is_active: "Acceso activo",
  reassigned_employees: "Empleados reasignados",
  reassigned_exceptions: "Excepciones reasignadas",
};

// Categorías de la pantalla de Auditoría. Agrupan los `entity_type` que el backend
// realmente registra: no hay auditoría de horarios, así que no hay categoría de Horarios.
export const AUDIT_CATEGORIES = ["Todos", "Empleados", "Catálogos", "Usuarios", "Accesos"] as const;

export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];
export type AuditCategoryFilter = Exclude<AuditCategory, "Todos">;

export const CATEGORY_BY_ENTITY: Record<EntityType, AuditCategoryFilter> = {
  employee: "Empleados",
  area: "Catálogos",
  status: "Catálogos",
  position: "Catálogos",
  shift_template: "Catálogos",
  holiday: "Catálogos",
  user: "Usuarios",
  login: "Accesos",
};

export const ENTITY_TYPES_BY_CATEGORY: Record<AuditCategoryFilter, EntityType[]> = {
  Empleados: ["employee"],
  Catálogos: ["area", "status", "position", "shift_template", "holiday"],
  Usuarios: ["user"],
  Accesos: ["login"],
};

// Acciones cuyo verbo ya arrastra su propio objeto ("retiró el acceso de"): no se les
// agrega el sustantivo de la entidad o quedaría "retiró el acceso de la cuenta de Ana".
const VERBS_WITH_OBJECT = new Set([
  "deactivate",
  "status_change",
  "delete_duplicate",
  "reset_password",
]);

const ENTITY_NOUNS: Record<EntityType, string> = {
  employee: "al empleado",
  area: "el área",
  status: "el estado",
  position: "el cargo",
  shift_template: "la plantilla de turno",
  holiday: "el festivo",
  user: "la cuenta de",
  login: "",
};

/** Frase de la acción, lista para que le siga el nombre del objetivo. */
export function describeAction(entry: HistoryEntry): string {
  const verb = ACTION_LABELS[entry.action] ?? entry.action;
  if (entry.entity_type === "login" || VERBS_WITH_OBJECT.has(entry.action)) return verb;
  return `${verb} ${ENTITY_NOUNS[entry.entity_type]}`;
}

export function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

export function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) return value.length === 0 ? "—" : value.join(", ");
  return String(value);
}

/**
 * Valor de un cambio, traducido cuando el campo guarda un identificador y no un texto:
 * el historial de un empleado trae `position: "practicante"` y el de una cuenta
 * `role: "gestion_humana"`.
 */
export function formatChangeValue(field: string, value: unknown): string {
  if (typeof value === "string") {
    if (field === "position" && value in POSITION_LABELS) {
      return POSITION_LABELS[value as keyof typeof POSITION_LABELS];
    }
    if (field === "role" && value in ROLE_LABELS) {
      return ROLE_LABELS[value as keyof typeof ROLE_LABELS];
    }
  }
  return formatFieldValue(value);
}

export function summarize(entry: HistoryEntry): string {
  const actor = entry.actor_name || "Sistema";
  const accion = ACTION_LABELS[entry.action] ?? entry.action;
  const entidad = ENTITY_TYPE_LABELS[entry.entity_type];
  return `${actor} ${accion} ${entidad}`;
}

export function summarizeChange(change: HistoryChange): string {
  return `${fieldLabel(change.field)}: ${formatChangeValue(change.field, change.old_value)} → ${formatChangeValue(change.field, change.new_value)}`;
}
