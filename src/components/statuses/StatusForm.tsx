"use client";

import { type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useStatusForm, type StatusFormMode } from "@/lib/hooks/useStatusForm";
import type { Status } from "@/types/status";

interface StatusFormProps {
  mode: StatusFormMode;
  status?: Status;
  onSuccess: (status: Status) => void;
}

export function StatusForm({ mode, status, onSuccess }: StatusFormProps) {
  const { values, isSubmitting, error, setField, submit } = useStatusForm({
    mode,
    statusId: status?.id,
    initialStatus: status,
    onSuccess,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        name="name"
        placeholder="Nombre del estado"
        value={values.name}
        onChange={(event) => setField("name", event.target.value)}
        required
        maxLength={100}
      />

      {error && <ErrorState message={error.message} />}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : mode === "create" ? "Crear estado" : "Guardar cambios"}
      </Button>
    </form>
  );
}
