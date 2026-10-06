"use client";

import { type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useEmployeeForm, type EmployeeFormMode } from "@/lib/hooks/useEmployeeForm";
import { useAreas } from "@/lib/hooks/useAreas";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { selectableOptions } from "@/lib/utils/catalog";
import type { Employee, EmployeePosition } from "@/types/employee";

const POSITION_LABELS: Record<EmployeePosition, string> = {
  recursos_humanos: "Recursos Humanos",
  lider: "Líder",
};

interface EmployeeFormProps {
  mode: EmployeeFormMode;
  employee?: Employee;
  onSuccess: (employee: Employee) => void;
}

export function EmployeeForm({ mode, employee, onSuccess }: EmployeeFormProps) {
  const { values, isSubmitting, error, setField, submit } = useEmployeeForm({
    mode,
    employeeId: employee?.id,
    initialEmployee: employee,
    onSuccess,
  });

  const { status: areasStatus, areas, error: areasError } = useAreas();
  const { status: statusesStatus, statuses, error: statusesError } = useStatuses();

  const catalogsLoading = areasStatus === "loading" || statusesStatus === "loading";
  const catalogsError =
    areasStatus === "error" ? areasError : statusesStatus === "error" ? statusesError : null;

  const areaOptions = selectableOptions(areas, employee?.area_id);
  const statusOptions = selectableOptions(statuses, employee?.status_id);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        name="full_name"
        placeholder="Nombre completo"
        value={values.full_name}
        onChange={(event) => setField("full_name", event.target.value)}
        required
      />

      <Select
        name="position"
        value={values.position}
        onChange={(event) => setField("position", event.target.value as EmployeePosition)}
        required
      >
        <option value="lider">{POSITION_LABELS.lider}</option>
        <option value="recursos_humanos">{POSITION_LABELS.recursos_humanos}</option>
      </Select>

      <Select
        name="area_id"
        value={values.area_id}
        onChange={(event) => setField("area_id", event.target.value)}
        disabled={catalogsLoading}
        required
      >
        <option value="" disabled>
          Seleccioná un área
        </option>
        {areaOptions.map((area) => (
          <option key={area.id} value={area.id}>
            {area.name}
          </option>
        ))}
      </Select>

      <Select
        name="status_id"
        value={values.status_id}
        onChange={(event) => setField("status_id", event.target.value)}
        disabled={catalogsLoading || mode === "edit"}
        required
      >
        <option value="" disabled>
          Seleccioná un estado
        </option>
        {statusOptions.map((statusOption) => (
          <option key={statusOption.id} value={statusOption.id}>
            {statusOption.name}
          </option>
        ))}
      </Select>
      {mode === "edit" && (
        <p className="text-xs text-gray-500">
          El estado se precarga con el valor vigente. Su cambio se gestiona por fuera de este
          formulario.
        </p>
      )}

      {catalogsError && <ErrorState message={catalogsError.message} />}
      {error && <ErrorState message={error.message} />}

      <Button type="submit" disabled={isSubmitting || catalogsLoading}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
