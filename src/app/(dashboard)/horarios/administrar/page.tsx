"use client";

import { useState } from "react";
import { RoleGate } from "@/components/auth/RoleGate";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { useWeekSchedule } from "@/lib/hooks/useWeekSchedule";
import { DayStatusEditor } from "@/components/schedules/DayStatusEditor";
import { DateRangeStatusEditor } from "@/components/schedules/DateRangeStatusEditor";
import { DefaultScheduleEditor } from "@/components/schedules/DefaultScheduleEditor";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

function AdministrarHorariosContent() {
  const { status: employeesStatus, employees, error: employeesError } = useEmployees();
  const [employeeId, setEmployeeId] = useState("");
  const { state: weekState, retry: retryWeek } = useWeekSchedule(0);
  const [selectedDate, setSelectedDate] = useState("");

  const selectedEmployeeWeek =
    weekState.status === "success" || weekState.status === "empty"
      ? weekState.data.employees.find((employee) => employee.employee_id === employeeId)
      : undefined;
  const selectedDay = selectedEmployeeWeek?.days.find((day) => day.date === selectedDate);

  return (
    <div className="flex flex-col gap-6">
      {employeesStatus === "loading" && <Spinner />}
      {employeesStatus === "error" && <ErrorState message={employeesError.message} />}
      {employeesStatus === "success" && employees.length === 0 && (
        <EmptyState message="No hay empleados registrados." />
      )}

      {employeesStatus === "success" && employees.length > 0 && (
        <label className="flex flex-col text-sm text-gray-700">
          Persona
          <select
            className="rounded border px-3 py-2 text-sm"
            value={employeeId}
            onChange={(event) => {
              setEmployeeId(event.target.value);
              setSelectedDate("");
            }}
          >
            <option value="">Seleccioná una persona</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name}
              </option>
            ))}
          </select>
        </label>
      )}

      {employeeId && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">Horario habitual</h2>
            <DefaultScheduleEditor employeeId={employeeId} onSaved={() => retryWeek()} />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">Estado especial por día</h2>
            {weekState.status === "loading" && <Spinner />}
            {weekState.status === "error" && <ErrorState message={weekState.error.message} onRetry={retryWeek} />}
            {(weekState.status === "success" || weekState.status === "empty") && selectedEmployeeWeek && (
              <>
                <label className="flex flex-col text-sm text-gray-700">
                  Día
                  <select
                    className="rounded border px-3 py-2 text-sm"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  >
                    <option value="">Seleccioná un día</option>
                    {selectedEmployeeWeek.days.map((day) => (
                      <option key={day.date} value={day.date}>
                        {day.date}
                      </option>
                    ))}
                  </select>
                </label>
                {selectedDay && (
                  <DayStatusEditor employeeId={employeeId} day={selectedDay} onSaved={() => retryWeek()} />
                )}
              </>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">Estado especial por rango de fechas</h2>
            <DateRangeStatusEditor employeeId={employeeId} onSaved={() => retryWeek()} />
          </section>
        </>
      )}
    </div>
  );
}

export default function AdministrarHorariosPage() {
  return (
    <RoleGate>
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold">Administrar Horarios</h1>
        <AdministrarHorariosContent />
      </div>
    </RoleGate>
  );
}
