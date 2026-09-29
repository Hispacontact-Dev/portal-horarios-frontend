"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

// TODO: conectar con useUsers()/lib/api/users.ts (full_name, email, role).
export function UserForm() {
  return (
    <form className="flex flex-col gap-3">
      <Input name="full_name" placeholder="Nombre completo" />
      <Input name="email" type="email" placeholder="Correo electrónico" />
      <Select name="role">
        <option value="lider">Líder</option>
        <option value="junta_directiva">Junta Directiva</option>
      </Select>
      <Button type="submit">Crear usuario</Button>
    </form>
  );
}
