"use client";

// Sin uso desde el rediseño de Configuración (specs/011-rediseno-configuracion): la
// pestaña Estados pasó a ser de solo lectura. Se conserva para reponer la administración
// de Estados en un diálogo, como hace la pestaña Usuarios, sin volver a escribirla.

import { type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { SuccessState } from "@/components/ui/SuccessState";
import { useSuccessFlag } from "@/lib/hooks/useSuccessFlag";
import { useStatusForm, type StatusFormMode } from "@/lib/hooks/useStatusForm";
import type { Status } from "@/types/status";

interface StatusFormProps {
  mode: StatusFormMode;
  status?: Status;
  onSuccess: (status: Status) => void;
}

export function StatusForm({ mode, status, onSuccess }: StatusFormProps) {
  const successFlag = useSuccessFlag();

  function handleSuccess(result: Status) {
    successFlag.show();
    onSuccess(result);
  }

  const { values, isSubmitting, error, setField, submit } = useStatusForm({
    mode,
    statusId: status?.id,
    initialStatus: status,
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
        placeholder="Nombre del estado"
        value={values.name}
        onChange={(event) => handleNameChange(event.target.value)}
        required
        maxLength={100}
      />

      {successFlag.visible && <SuccessState message="Cambios guardados" />}
      {error && <ErrorState message={error.message} />}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : mode === "create" ? "Crear estado" : "Guardar cambios"}
      </Button>
    </form>
  );
}
