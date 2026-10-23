"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { RoleGate } from "@/components/auth/RoleGate";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/ErrorState";
import { SuccessState } from "@/components/ui/SuccessState";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { useDayStatusChange } from "@/lib/hooks/useDayStatusChange";
import { useSuccessFlag } from "@/lib/hooks/useSuccessFlag";
import type { ScheduleDayEntry } from "@/types/schedule";

interface DayStatusEditorProps {
  employeeId: string;
  day: ScheduleDayEntry;
  onSaved: (entry: ScheduleDayEntry) => void;
}

function DayStatusEditorForm({ employeeId, day, onSaved }: DayStatusEditorProps) {
  const { statuses } = useStatuses();
  const { state, setStatus, revert } = useDayStatusChange();
  const successFlag = useSuccessFlag();
  const [statusId, setStatusId] = useState(day.status_id);
  const [observation, setObservation] = useState(day.observation ?? "");

  const isSubmitting = state.status === "submitting";
  const isConflict = state.status === "error" && state.error.kind === "conflict";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    successFlag.hide();
    const result = await setStatus({
      employee_id: employeeId,
      date: day.date,
      status_id: statusId,
      observation: observation || undefined,
      expected_updated_at: day.updated_at,
    });
    if (result) {
      successFlag.show();
      onSaved(result);
    }
  }

  async function handleRevert() {
    successFlag.hide();
    const result = await revert(employeeId, day.date, day.updated_at);
    if (result) {
      successFlag.show();
      onSaved(result);
    }
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    successFlag.hide();
    setStatusId(event.target.value);
  }

  function handleObservationChange(event: ChangeEvent<HTMLInputElement>) {
    successFlag.hide();
    setObservation(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col text-sm text-gray-700">
        Estado
        <select
          className="rounded border px-3 py-2 text-sm"
          value={statusId}
          onChange={handleStatusChange}
        >
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-gray-700">
        Observación
        <Input value={observation} onChange={handleObservationChange} />
      </label>

      {successFlag.visible && <SuccessState message="Cambios guardados" />}

      {state.status === "error" && (
        <ErrorState
          message={
            isConflict
              ? "Este día fue modificado por otra persona. Recargá los datos antes de guardar."
              : state.error.message
          }
        />
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
        <Button type="button" variant="secondary" onClick={handleRevert} disabled={isSubmitting}>
          Revertir a horario habitual
        </Button>
      </div>
    </form>
  );
}

export function DayStatusEditor(props: DayStatusEditorProps) {
  return (
    <RoleGate>
      <DayStatusEditorForm {...props} />
    </RoleGate>
  );
}
