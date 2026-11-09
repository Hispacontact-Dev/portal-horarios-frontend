"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { RoleGate } from "@/components/auth/RoleGate";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/ErrorState";
import { SuccessState } from "@/components/ui/SuccessState";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { useNovedadSync } from "@/lib/hooks/useNovedadSync";
import { useSuccessFlag } from "@/lib/hooks/useSuccessFlag";
import { formatDayKey } from "@/lib/utils/date";
import { datesInRange } from "@/lib/utils/week";

interface DateRangeStatusEditorProps {
  employeeId: string;
  onSaved: () => void;
}

function DateRangeStatusEditorForm({ employeeId, onSaved }: DateRangeStatusEditorProps) {
  const { statuses } = useStatuses();
  const { state, submit } = useNovedadSync();
  const successFlag = useSuccessFlag();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusId, setStatusId] = useState("");
  const [skipped, setSkipped] = useState<string[]>([]);

  const isSubmitting = state.status === "submitting";
  const targetDates = datesInRange(startDate, endDate);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    successFlag.hide();
    setSkipped([]);
    const result = await submit({
      employeeId,
      statusId,
      targetDates,
      removeDates: [],
      knownUpdatedAt: {},
    });
    if (!result) return;
    setSkipped(result.skipped.map((entry) => formatDayKey(entry.date)));
    if (result.applied > 0) {
      successFlag.show();
      onSaved();
    }
  }

  function handleStartDateChange(event: ChangeEvent<HTMLInputElement>) {
    successFlag.hide();
    setStartDate(event.target.value);
  }

  function handleEndDateChange(event: ChangeEvent<HTMLInputElement>) {
    successFlag.hide();
    setEndDate(event.target.value);
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    successFlag.hide();
    setStatusId(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col text-sm text-gray-700">
        Desde
        <Input type="date" value={startDate} onChange={handleStartDateChange} required />
      </label>

      <label className="flex flex-col text-sm text-gray-700">
        Hasta
        <Input type="date" value={endDate} min={startDate} onChange={handleEndDateChange} required />
      </label>

      <label className="flex flex-col text-sm text-gray-700">
        Estado
        <select
          className="rounded border px-3 py-2 text-sm"
          value={statusId}
          onChange={handleStatusChange}
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

      {successFlag.visible && <SuccessState message="Cambios guardados" />}

      {skipped.length > 0 && (
        <p className="text-sm text-gray-700">
          {skipped.length} día(s) quedaron sin cambiar porque ya tenían una novedad asignada: {skipped.join(", ")}.
        </p>
      )}

      {state.status === "error" && <ErrorState message={state.error.message} />}

      <Button type="submit" disabled={isSubmitting || targetDates.length === 0 || statusId === ""}>
        {isSubmitting ? "Guardando..." : `Asignar al rango · ${targetDates.length} día(s)`}
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
