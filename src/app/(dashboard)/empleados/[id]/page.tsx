"use client";

import type { ChangeEvent } from "react";
import { RoleGate } from "@/components/auth/RoleGate";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { EmployeeStatusBadge } from "@/components/employees/EmployeeStatusBadge";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { useEmployeeStatusChange } from "@/lib/hooks/useEmployeeStatusChange";
import { useEmployeeDefaultSchedule } from "@/lib/hooks/useEmployeeDefaultSchedule";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { selectableOptions } from "@/lib/utils/catalog";
import { WEEKDAY_LABELS } from "@/components/schedules/DefaultScheduleEditor";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import type { Employee, EmployeePosition } from "@/types/employee";

const MODALITY_LABELS: Record<"presencial" | "virtual", string> = {
  presencial: "Presencial",
  virtual: "Virtual/Casa",
};

const POSITION_LABELS: Record<EmployeePosition, string> = {
  recursos_humanos: "Recursos Humanos",
  lider: "Líder",
  practicante: "Practicante",
};

interface EmpleadoDetallePageProps {
  params: { id: string };
}

export default function EmpleadoDetallePage({ params }: EmpleadoDetallePageProps) {
  const { status, employee, error, setEmployee } = useEmployee(params.id);
  const { status: statusesStatus, statuses, error: statusesError } = useStatuses();
  const { state: defaultScheduleState } = useEmployeeDefaultSchedule(params.id);

  const {
    isSubmitting: isChangingStatus,
    error: statusChangeError,
    changeStatus,
  } = useEmployeeStatusChange({
    employeeId: params.id,
    onSuccess: setEmployee,
  });

  function handleUpdated(updated: Employee) {
    setEmployee(updated);
  }

  function handleStatusSelect(event: ChangeEvent<HTMLSelectElement>) {
    changeStatus(event.target.value);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Detalle del empleado</h1>

      {status === "loading" && <Spinner />}
      {status === "error" && <ErrorState message={error.message} />}

      {status === "success" && (
        <>
          <Card className="flex flex-col gap-2">
            <div>
              <span className="text-xs text-gray-500">Nombre</span>
              <p className="text-sm font-medium">{employee.full_name}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Cargo</span>
              <p className="text-sm">{POSITION_LABELS[employee.position]}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Área</span>
              <p className="text-sm">{employee.area_name}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Estado</span>
              <EmployeeStatusBadge statusName={employee.status_name} />
            </div>
            <div>
              <span className="text-xs text-gray-500">Activo</span>
              <Badge
                className={
                  employee.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                }
              >
                {employee.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </Card>

          <Card className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">Horario habitual</h2>
            {defaultScheduleState.status === "loading" && <Spinner />}
            {defaultScheduleState.status === "error" && (
              <ErrorState message={defaultScheduleState.error.message} />
            )}
            {defaultScheduleState.status === "empty" && (
              <EmptyState message="Todavía no se cargó un horario habitual para esta persona." />
            )}
            {defaultScheduleState.status === "success" && (
              <ul className="flex flex-col gap-1">
                {defaultScheduleState.data.days.map((day) => (
                  <li key={day.weekday} className="flex items-center gap-2 text-sm">
                    <span className="w-20 font-medium">{WEEKDAY_LABELS[day.weekday]}</span>
                    {day.works && day.modality ? (
                      <span>
                        {MODALITY_LABELS[day.modality]} —{" "}
                        {day.time_ranges.map((range) => `${range.start} a ${range.end}`).join(", ")}
                      </span>
                    ) : (
                      <span className="text-gray-500">No trabaja</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <RoleGate>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold">Cambiar estado</h2>
                <Select
                  name="status_id"
                  value={employee.status_id}
                  onChange={handleStatusSelect}
                  disabled={isChangingStatus || statusesStatus === "loading"}
                >
                  <option value="" disabled>
                    Seleccioná un estado
                  </option>
                  {selectableOptions(statuses, employee.status_id).map((statusOption) => (
                    <option key={statusOption.id} value={statusOption.id}>
                      {statusOption.name}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-gray-500">
                  Asignar un Estado de inactividad o baja es la única forma de deshabilitar al
                  empleado: no hay una acción separada. Podés revertirlo eligiendo cualquier otro
                  Estado disponible.
                </p>
                {statusesStatus === "error" && <ErrorState message={statusesError.message} />}
                {statusChangeError && <ErrorState message={statusChangeError.message} />}
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold">Editar empleado</h2>
                <EmployeeForm mode="edit" employee={employee} onSuccess={handleUpdated} />
              </div>
            </div>
          </RoleGate>
        </>
      )}
    </div>
  );
}
