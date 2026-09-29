"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

// TODO: conectar con useEmployees()/lib/api/employees.ts (full_name, position, area_id, status_id).
export function EmployeeForm() {
  return (
    <form className="flex flex-col gap-3">
      <Input name="full_name" placeholder="Nombre completo" />
      <Select name="position">
        <option value="lider">Líder</option>
        <option value="recursos_humanos">Recursos Humanos</option>
      </Select>
      <Button type="submit">Guardar</Button>
    </form>
  );
}
