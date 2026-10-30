import type { EmployeeWeekSchedule, ScheduleFilters } from "@/types/schedule";

// Reconciliación y filtrado combinado de la vista de Horarios — RF-4, specs/005-horarios/plan.md sección 3.5.
// Nota: el Área se compara por area_name, no por id — el backend no incluye area_id en
// la respuesta de /schedules/week (solo area_name), así que comparar por id nunca coincide.

export function reconcileFilters(filters: ScheduleFilters, employees: EmployeeWeekSchedule[]): ScheduleFilters {
  if (filters.employee_id === null) return filters;

  const person = employees.find((employee) => employee.employee_id === filters.employee_id);
  if (person === undefined) return filters;

  if (filters.area_name !== null && filters.area_name !== person.area_name) {
    // La persona filtrada manda sobre el área: se autocompleta en vez de forzar un resultado vacío.
    return { ...filters, area_name: person.area_name };
  }

  return filters;
}

// Simétrico a reconcileFilters: si el usuario cambia el Área a propósito y ya no coincide
// con la Persona activa, se limpia la Persona en vez de descartar el Área recién elegida.
export function clearEmployeeIfAreaMismatch(
  filters: ScheduleFilters,
  employees: EmployeeWeekSchedule[],
): ScheduleFilters {
  if (filters.employee_id === null || filters.area_name === null) return filters;

  const person = employees.find((employee) => employee.employee_id === filters.employee_id);
  if (person !== undefined && person.area_name !== filters.area_name) {
    return { ...filters, employee_id: null };
  }

  return filters;
}

export function applyScheduleFilters(
  employees: EmployeeWeekSchedule[],
  filters: ScheduleFilters,
): EmployeeWeekSchedule[] {
  return employees
    .filter((employee) => filters.employee_id === null || employee.employee_id === filters.employee_id)
    .filter((employee) => filters.area_name === null || employee.area_name === filters.area_name)
    .filter(
      (employee) =>
        filters.status_id === null || employee.days.some((day) => day.status_id === filters.status_id),
    );
}
