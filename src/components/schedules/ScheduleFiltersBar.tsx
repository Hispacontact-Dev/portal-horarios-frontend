"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import type { EmployeeWeekSchedule, ScheduleFilters } from "@/types/schedule";

interface ScheduleFiltersBarProps {
  employees: EmployeeWeekSchedule[];
  filters: ScheduleFilters;
  onChange: <K extends keyof ScheduleFilters>(key: K, value: ScheduleFilters[K]) => void;
  onClear: () => void;
}

export function ScheduleFiltersBar({ employees, filters, onChange, onClear }: ScheduleFiltersBarProps) {
  const areaOptions = useMemo(() => {
    const seen = new Map<string, string>();
    employees.forEach((employee) => seen.set(employee.area_id, employee.area_name));
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [employees]);

  const statusOptions = useMemo(() => {
    const seen = new Map<string, string>();
    employees.forEach((employee) => employee.days.forEach((day) => seen.set(day.status_id, day.status_name)));
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [employees]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col text-sm text-gray-700">
        Persona
        <select
          className="rounded border px-3 py-2 text-sm"
          value={filters.employee_id ?? ""}
          onChange={(event) => onChange("employee_id", event.target.value || null)}
        >
          <option value="">Todas</option>
          {employees.map((employee) => (
            <option key={employee.employee_id} value={employee.employee_id}>
              {employee.full_name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-gray-700">
        Área
        <select
          className="rounded border px-3 py-2 text-sm"
          value={filters.area_id ?? ""}
          onChange={(event) => onChange("area_id", event.target.value || null)}
        >
          <option value="">Todas</option>
          {areaOptions.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-gray-700">
        Modalidad
        <select
          className="rounded border px-3 py-2 text-sm"
          value={filters.modality ?? ""}
          onChange={(event) => onChange("modality", (event.target.value || null) as ScheduleFilters["modality"])}
        >
          <option value="">Todas</option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual/Casa</option>
        </select>
      </label>

      <label className="flex flex-col text-sm text-gray-700">
        Estado
        <select
          className="rounded border px-3 py-2 text-sm"
          value={filters.status_id ?? ""}
          onChange={(event) => onChange("status_id", event.target.value || null)}
        >
          <option value="">Todos</option>
          {statusOptions.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </label>

      <Button type="button" variant="secondary" onClick={onClear}>
        Limpiar filtros
      </Button>
    </div>
  );
}
