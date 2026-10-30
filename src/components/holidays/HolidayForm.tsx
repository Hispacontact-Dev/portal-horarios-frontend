"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { SuccessState } from "@/components/ui/SuccessState";
import { useSuccessFlag } from "@/lib/hooks/useSuccessFlag";
import { useCreateHoliday } from "@/lib/hooks/useHolidayActions";
import type { Holiday } from "@/types/holiday";

interface HolidayFormProps {
  year: number;
  onSuccess: (holiday: Holiday) => void;
}

export function HolidayForm({ year, onSuccess }: HolidayFormProps) {
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const successFlag = useSuccessFlag();
  const { state, submit } = useCreateHoliday();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    successFlag.hide();
    setValidationError(null);

    if (!date || !name.trim()) {
      setValidationError("Indicá la fecha y el nombre del día.");
      return;
    }
    if (!date.startsWith(String(year))) {
      setValidationError(`La fecha debe ser del año ${year}.`);
      return;
    }

    void submit({ date, name: name.trim() }).then((result) => {
      if (!result) return;
      successFlag.show();
      setDate("");
      setName("");
      onSuccess(result);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-2">
      <Input
        type="date"
        value={date}
        min={`${year}-01-01`}
        max={`${year}-12-31`}
        onChange={(event) => {
          successFlag.hide();
          setValidationError(null);
          setDate(event.target.value);
        }}
        required
      />
      <Input
        className="min-w-[220px] flex-1"
        placeholder="Nombre del festivo o día de la empresa"
        value={name}
        onChange={(event) => {
          successFlag.hide();
          setValidationError(null);
          setName(event.target.value);
        }}
        required
        maxLength={100}
      />
      <Button type="submit" variant="secondary" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Agregando..." : "+ Agregar día"}
      </Button>

      {validationError && <ErrorState message={validationError} />}
      {!validationError && state.status === "error" && <ErrorState message={state.error.message} />}
      {successFlag.visible && <SuccessState message="Día agregado" />}
    </form>
  );
}
