import type { Employee } from "@/types/employee";

// Funciones puras de catálogo (sin fetch) según plan.md secciones 3.4 y 3.6.

export function countEmployeesByArea(employees: Employee[], areaId: string): number {
  return employees.filter((employee) => employee.area_id === areaId).length;
}

export function countEmployeesByStatus(employees: Employee[], statusId: string): number {
  return employees.filter((employee) => employee.status_id === statusId).length;
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
