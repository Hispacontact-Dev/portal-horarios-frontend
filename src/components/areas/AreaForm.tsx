"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// TODO: conectar con useAreas()/lib/api/areas.ts para alta/edición de nombre.
export function AreaForm() {
  return (
    <form className="flex flex-col gap-3">
      <Input name="name" placeholder="Nombre del área" />
      <Button type="submit">Guardar</Button>
    </form>
  );
}
