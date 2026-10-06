"use client";

import { type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAreaForm, type AreaFormMode } from "@/lib/hooks/useAreaForm";
import type { Area } from "@/types/area";

interface AreaFormProps {
  mode: AreaFormMode;
  area?: Area;
  onSuccess: (area: Area) => void;
}

export function AreaForm({ mode, area, onSuccess }: AreaFormProps) {
  const { values, isSubmitting, error, setField, submit } = useAreaForm({
    mode,
    areaId: area?.id,
    initialArea: area,
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
        placeholder="Nombre del área"
        value={values.name}
        onChange={(event) => setField("name", event.target.value)}
        required
        maxLength={100}
      />

      {error && <ErrorState message={error.message} />}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : mode === "create" ? "Crear área" : "Guardar cambios"}
      </Button>
    </form>
  );
}
