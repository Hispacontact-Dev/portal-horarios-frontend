"use client";

import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useActorOptions } from "@/lib/hooks/useActorOptions";
import type { EntityType, HistoryFilters as HistoryFiltersValue } from "@/types/history";

interface HistoryFiltersProps {
  value: HistoryFiltersValue;
  onChange: (value: HistoryFiltersValue) => void;
}

export function HistoryFilters({ value, onChange }: HistoryFiltersProps) {
  const actorOptions = useActorOptions();

  function setField<K extends keyof HistoryFiltersValue>(field: K, fieldValue: HistoryFiltersValue[K]) {
    onChange({ ...value, [field]: fieldValue });
  }

  return (
    <div className="flex gap-3">
      <Select
        name="entity_type"
        value={value.entity_type ?? ""}
        onChange={(event) =>
          setField("entity_type", (event.target.value || undefined) as EntityType | undefined)
        }
      >
        <option value="">Todos</option>
        <option value="employee">Empleado</option>
        <option value="area">Área</option>
        <option value="status">Estado</option>
        <option value="user">Usuario</option>
        <option value="login">Inicio de sesión</option>
      </Select>

      <Input
        type="date"
        name="date_from"
        value={value.date_from ?? ""}
        onChange={(event) => setField("date_from", event.target.value || undefined)}
      />
      <Input
        type="date"
        name="date_to"
        value={value.date_to ?? ""}
        onChange={(event) => setField("date_to", event.target.value || undefined)}
      />

      <Select
        name="actor_id"
        value={value.actor_id ?? ""}
        onChange={(event) => setField("actor_id", event.target.value || undefined)}
      >
        <option value="">Todos los usuarios</option>
        {actorOptions.map((actor) => (
          <option key={actor.id} value={actor.id}>
            {actor.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
