"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useUsers } from "@/lib/hooks/useUsers";
import type { User, UserCreate } from "@/types/user";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_VALUES: UserCreate = {
  full_name: "",
  email: "",
  role: "lider",
};

function isValid(values: UserCreate): boolean {
  return values.full_name.trim() !== "" && EMAIL_PATTERN.test(values.email.trim());
}

interface UserFormProps {
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

export function UserForm({ onSuccess, onCancel }: UserFormProps) {
  const [values, setValues] = useState<UserCreate>(EMPTY_VALUES);
  const { state, submit } = useUsers();

  function setField<K extends keyof UserCreate>(field: K, value: UserCreate[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid(values)) return;
    const created = await submit(values);
    if (created) {
      setValues(EMPTY_VALUES);
      onSuccess(created);
    }
  }

  const canSubmit = isValid(values) && state.status !== "submitting";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        name="full_name"
        placeholder="Nombre completo"
        value={values.full_name}
        onChange={(event) => setField("full_name", event.target.value)}
        required
      />

      <Input
        name="email"
        type="email"
        placeholder="Correo electrónico"
        value={values.email}
        onChange={(event) => setField("email", event.target.value)}
        required
      />

      <Select
        name="role"
        value={values.role}
        onChange={(event) => setField("role", event.target.value as UserCreate["role"])}
        required
      >
        <option value="lider">Líder</option>
        <option value="gestion_humana">Gestión Humana</option>
      </Select>

      {state.status === "error" && state.error && <ErrorState message={state.error.message} />}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {state.status === "submitting" ? "Creando..." : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}
