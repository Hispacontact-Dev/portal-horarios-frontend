"use client";

import { Corners } from "@/components/dashboard/Corners";
import { RoleGate } from "@/components/auth/RoleGate";
import { UserForm } from "@/components/users/UserForm";

export function UsuariosTab() {
  return (
    <div className="flex flex-col gap-[22px]">
      <section className="panel anim-up flex flex-col gap-3.5 px-5 py-[18px]" style={{ animationDelay: ".05s" }}>
        <Corners />
        <h2 className="font-heading text-[22px] font-semibold">Usuarios</h2>
        <p className="text-[13px] text-[var(--neutral-700)]">
          La lista de usuarios estará disponible cuando el backend exponga un endpoint para consultarlos.
        </p>
        <RoleGate>
          <UserForm />
        </RoleGate>
      </section>
    </div>
  );
}
