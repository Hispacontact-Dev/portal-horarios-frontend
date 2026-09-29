"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// TODO: conectar con useStatuses()/lib/api/statuses.ts para alta/edición de nombre.
export function StatusForm() {
  return (
    <form className="flex flex-col gap-3">
      <Input name="name" placeholder="Nombre del estado" />
      <Button type="submit">Guardar</Button>
    </form>
  );
}
