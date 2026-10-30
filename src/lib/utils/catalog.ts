import type { Employee } from "@/types/employee";

// Funciones puras de catálogo (sin fetch) según plan.md secciones 3.4 y 3.6.

export function countEmployeesByArea(employees: Employee[], areaId: string): number {
  return employees.filter((employee) => employee.area_id === areaId).length;
}

export function countEmployeesByStatus(employees: Employee[], statusId: string): number {
  return employees.filter((employee) => employee.status_id === statusId).length;
}

// Cuántos empleados hay por id de Estado, en una sola pasada. Lo usa la pestaña
// Estados, que necesita el conteo de todos los Estados a la vez y no de uno solo.
export function countEmployeesByStatusId(employees: Employee[]): Map<string, number> {
  const counts = new Map<string, number>();
  employees.forEach((employee) => {
    if (employee.status_id === null) return;
    counts.set(employee.status_id, (counts.get(employee.status_id) ?? 0) + 1);
  });
  return counts;
}

// Mismo criterio para las Áreas, que la pestaña de catálogo muestra por fila.
export function countEmployeesByAreaId(employees: Employee[]): Map<string, number> {
  const counts = new Map<string, number>();
  employees.forEach((employee) => {
    if (employee.area_id === null) return;
    counts.set(employee.area_id, (counts.get(employee.area_id) ?? 0) + 1);
  });
  return counts;
}

interface SelectableEntry {
  id: string;
  is_enabled: boolean;
}

export function selectableOptions<T extends SelectableEntry>(
  entries: T[],
  currentlyAssignedId?: string
): T[] {
  return entries.filter((entry) => entry.is_enabled || entry.id === currentlyAssignedId);
}

interface IdNameOption {
  id: string;
  name: string;
}

function dedupeSorted(entries: Map<string, string>): IdNameOption[] {
  return [...entries.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Deriva las opciones de un filtro de Área a partir del nombre de área ya embebido en los
// registros cargados (empleados u horarios de la semana). El backend no devuelve area_id
// en estas respuestas (solo area_name) — filtrar/comparar por id siempre falla porque ese
// campo nunca llega. area_name sí es confiable, igual que ya hace EmployeesView.tsx.
export function uniqueAreaNames<T extends { area_name: string }>(entries: T[]): string[] {
  return [...new Set(entries.map((entry) => entry.area_name))].sort((a, b) => a.localeCompare(b));
}

// Mismo principio que areaOptionsFromEmployees, para el Estado embebido en los días de
// la semana de cada empleado.
export function statusOptionsFromDays(
  employees: { days: { status_id: string; status_name: string }[] }[]
): IdNameOption[] {
  const seen = new Map<string, string>();
  employees.forEach((employee) => employee.days.forEach((day) => seen.set(day.status_id, day.status_name)));
  return dedupeSorted(seen);
}
