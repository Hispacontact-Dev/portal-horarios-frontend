"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useUsers } from "@/lib/hooks/useUsers";
import type { UserCreate } from "@/types/user";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_VALUES: UserCreate = {
  full_name: "",
  email: "",
  role: "lider",
};

function isValid(values: UserCreate): boolean {
  return values.full_name.trim() !== "" && EMAIL_PATTERN.test(values.email.trim());
}

export function UserForm() {
  const [values, setValues] = useState<UserCreate>(EMPTY_VALUES);
  const { state, submit } = useUsers();

  function setField<K extends keyof UserCreate>(field: K, value: UserCreate[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid(values)) return;
    const success = await submit(values);
    if (success) {
      setValues(EMPTY_VALUES);
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
      {state.status === "success" && (
        <p role="status" className="text-sm text-green-700">
          Usuario creado correctamente.
        </p>
      )}

      <Button type="submit" disabled={!canSubmit}>
        {state.status === "submitting" ? "Creando..." : "Crear usuario"}
      </Button>
    </form>
  );
}
