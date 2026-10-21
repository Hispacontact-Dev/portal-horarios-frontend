"use client";

import { useState, type FormEvent } from "react";
import { RoleGate } from "@/components/auth/RoleGate";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/ErrorState";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { useDateRangeStatusChange } from "@/lib/hooks/useDateRangeStatusChange";

interface DateRangeStatusEditorProps {
  employeeId: string;
  onSaved: () => void;
}

function DateRangeStatusEditorForm({ employeeId, onSaved }: DateRangeStatusEditorProps) {
  const { statuses } = useStatuses();
  const { state, submit, overlappingDates } = useDateRangeStatusChange();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusId, setStatusId] = useState("");

  const isSubmitting = state.status === "submitting";
  const isConflict = state.status === "error" && state.error.kind === "conflict";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await submit({
      employee_id: employeeId,
      start_date: startDate,
      end_date: endDate,
      status_id: statusId,
    });
    if (result) onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col text-sm text-gray-700">
        Desde
        <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
      </label>

      <label className="flex flex-col text-sm text-gray-700">
        Hasta
        <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
      </label>

      <label className="flex flex-col text-sm text-gray-700">
        Estado
        <select
          className="rounded border px-3 py-2 text-sm"
          value={statusId}
          onChange={(event) => setStatusId(event.target.value)}
          required
        >
          <option value="" disabled>
            Seleccioná un estado
          </option>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </label>

      {state.status === "error" && (
        <ErrorState
          message={
            isConflict
              ? `Este rango se superpone con días ya asignados${
                  overlappingDates.length > 0 ? `: ${overlappingDates.join(", ")}` : ""
                }. Resolvé el conflicto antes de continuar.`
              : state.error.message
          }
        />
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Asignar a todo el rango"}
      </Button>
    </form>
  );
}

export function DateRangeStatusEditor(props: DateRangeStatusEditorProps) {
  return (
    <RoleGate>
      <DateRangeStatusEditorForm {...props} />
    </RoleGate>
  );
}
