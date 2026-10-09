import type { EntityType, HistoryChange, HistoryEntry } from "@/types/history";

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  employee: "Empleado",
  area: "Área",
  status: "Estado",
  user: "Usuario",
  login: "Inicio de sesión",
};

export const ACTION_LABELS: Record<string, string> = {
  create: "creó",
  update: "actualizó",
  disable: "deshabilitó",
  enable: "habilitó",
  status_change: "cambió el estado de",
  login_success: "inició sesión",
  login_failed: "intentó iniciar sesión (fallido)",
};

export const FIELD_LABELS: Record<string, string> = {
  full_name: "Nombre completo",
  email: "Correo electrónico",
  role: "Rol",
  position: "Cargo",
  area: "Área",
  status: "Estado",
  name: "Nombre",
  is_predefined: "Predefinido",
};

export function summarize(entry: HistoryEntry): string {
  const actor = entry.actor_name || "Sistema";
  const accion = ACTION_LABELS[entry.action] ?? entry.action;
  const entidad = ENTITY_TYPE_LABELS[entry.entity_type];
  return `${actor} ${accion} ${entidad}`;
}

function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  return String(value);
}

export function summarizeChange(change: HistoryChange): string {
  const campo = FIELD_LABELS[change.field] ?? change.field;
  return `${campo}: ${formatChangeValue(change.old_value)} → ${formatChangeValue(change.new_value)}`;
}
