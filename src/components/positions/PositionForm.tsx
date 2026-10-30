"use client";

import { type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { SuccessState } from "@/components/ui/SuccessState";
import { useSuccessFlag } from "@/lib/hooks/useSuccessFlag";
import { usePositionForm, type PositionFormMode } from "@/lib/hooks/usePositionForm";
import type { Position } from "@/types/position";

interface PositionFormProps {
  mode: PositionFormMode;
  position?: Position;
  onSuccess: (position: Position) => void;
}

export function PositionForm({ mode, position, onSuccess }: PositionFormProps) {
  const successFlag = useSuccessFlag();

  function handleSuccess(result: Position) {
    successFlag.show();
    onSuccess(result);
  }

  const { values, isSubmitting, error, setField, submit } = usePositionForm({
    mode,
    positionId: position?.id,
    initialPosition: position,
    onSuccess: handleSuccess,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    successFlag.hide();
    submit(values);
  }

  function handleNameChange(value: string) {
    successFlag.hide();
    setField("name", value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        name="name"
        placeholder="Nombre del cargo"
        value={values.name}
        onChange={(event) => handleNameChange(event.target.value)}
        required
        maxLength={100}
      />

      {successFlag.visible && <SuccessState message="Cambios guardados" />}
      {error && <ErrorState message={error.message} />}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : mode === "create" ? "Crear cargo" : "Guardar cambios"}
      </Button>
    </form>
  );
}
