"use client";

import { RoleGate } from "@/components/auth/RoleGate";
import { UserForm } from "@/components/users/UserForm";

export function UsuariosTab() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Usuarios</h1>
      <p className="text-sm text-gray-500">
        La lista de usuarios estará disponible cuando el backend exponga un endpoint para consultarlos.
      </p>
      <RoleGate>
        <UserForm />
      </RoleGate>
    </div>
  );
}
