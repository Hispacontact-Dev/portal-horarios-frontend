import type { EmployeeWeekSchedule, ScheduleFilters } from "@/types/schedule";

// Reconciliación y filtrado combinado de la vista de Horarios — RF-4, specs/005-horarios/plan.md sección 3.5.

export function reconcileFilters(filters: ScheduleFilters, employees: EmployeeWeekSchedule[]): ScheduleFilters {
  if (filters.employee_id === null) return filters;

  const person = employees.find((employee) => employee.employee_id === filters.employee_id);
  if (person === undefined) return filters;

  if (filters.area_id !== null && filters.area_id !== person.area_id) {
    // La persona filtrada manda sobre el área: se autocompleta en vez de forzar un resultado vacío.
    return { ...filters, area_id: person.area_id };
  }

  return filters;
}

export function applyScheduleFilters(
  employees: EmployeeWeekSchedule[],
  filters: ScheduleFilters,
): EmployeeWeekSchedule[] {
  return employees
    .filter((employee) => filters.employee_id === null || employee.employee_id === filters.employee_id)
    .filter((employee) => filters.area_id === null || employee.area_id === filters.area_id)
    .map((employee) => ({
      ...employee,
      days: employee.days.filter(
        (day) => filters.status_id === null || day.status_id === filters.status_id,
      ),
    }));
}
