"use client";

import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

// TODO: conectar con useHistory()/lib/api/history.ts (entity_type, actor_id, date_from, date_to).
export function HistoryFilters() {
  return (
    <div className="flex gap-3">
      <Select name="entity_type">
        <option value="">Todos</option>
        <option value="employee">Empleado</option>
        <option value="area">Área</option>
        <option value="status">Estado</option>
        <option value="user">Usuario</option>
        <option value="login">Inicio de sesión</option>
      </Select>
      <Input type="date" name="date_from" />
      <Input type="date" name="date_to" />
    </div>
  );
}
