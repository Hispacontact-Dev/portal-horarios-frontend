"use client";

import { useMemo, useState } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { RoleGate } from "@/components/auth/RoleGate";
import { UserForm } from "@/components/users/UserForm";
import { UserTable } from "@/components/users/UserTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Toast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useUsersList } from "@/lib/hooks/useUsersList";
import { useChangeUserRole, useDeactivateUser } from "@/lib/hooks/useUserActions";
import { useToast } from "@/lib/hooks/useToast";
import { roleLabel } from "@/lib/utils/role";
import type { User, UserRoleUpdate } from "@/types/user";

export function UsuariosTab() {
  const { state, retry } = useUsersList();
  const [localUsers, setLocalUsers] = useState<User[] | null>(null);
  const [creating, setCreating] = useState(false);
  const toast = useToast();

  const changeRole = useChangeUserRole();
  const deactivate = useDeactivateUser();

  const baseUsers = useMemo(
    () => (state.status === "success" || state.status === "empty" ? state.data : []),
    [state]
  );
  const users = useMemo(
    () => [...(localUsers ?? baseUsers)].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [localUsers, baseUsers]
  );

  function upsertUser(entry: User) {
    setLocalUsers((current) => {
      const base = current ?? baseUsers;
      const exists = base.some((item) => item.id === entry.id);
      return exists ? base.map((item) => (item.id === entry.id ? entry : item)) : [...base, entry];
    });
  }

  async function handleChangeRole(user: User, role: UserRoleUpdate["role"]) {
    const updated = await changeRole.submit({ id: user.id, role });
    if (!updated) return;
    upsertUser(updated);
    toast.show(`${updated.full_name} ahora es ${roleLabel(updated.role)}`);
  }

  async function handleDeactivate(user: User) {
    const updated = await deactivate.submit(user.id);
    if (!updated) return;
    upsertUser(updated);
    toast.show(`Acceso retirado a ${updated.full_name}`);
  }

  function handleCreated(user: User) {
    upsertUser(user);
    setCreating(false);
    toast.show(`Cuenta creada para ${user.email}`);
  }

  const actionsDisabled =
    changeRole.state.status === "submitting" || deactivate.state.status === "submitting";

  return (
    <section className="panel anim-up flex flex-col gap-[18px] px-[22px] py-5">
      <Corners />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold">Usuarios</h2>
          <span className="text-[13px] text-[var(--neutral-700)]">
            Quién entra al portal y con qué rol. Gestión Humana administra; Líder solo consulta.
          </span>
        </div>
        <RoleGate>
          <Button type="button" onClick={() => setCreating(true)}>
            + Crear usuario
          </Button>
        </RoleGate>
      </div>

      {state.status === "loading" && <Spinner />}
      {state.status === "error" && <ErrorState message={state.error.message} onRetry={retry} />}

      {state.status === "empty" && (
        <div className="py-9 text-center text-[13px] text-[var(--neutral-700)]">
          No hay cuentas registradas todavía.
        </div>
      )}

      {state.status === "success" && (
        <div className="overflow-x-auto">
          <UserTable
            users={users}
            onChangeRole={handleChangeRole}
            onDeactivate={handleDeactivate}
            actionsDisabled={actionsDisabled}
          />
        </div>
      )}

      {changeRole.state.status === "error" && (
        <ErrorState message={changeRole.state.error.message} />
      )}
      {deactivate.state.status === "error" && (
        <ErrorState message={deactivate.state.error.message} />
      )}

      <span className="text-[11px] leading-relaxed text-[var(--neutral-700)]">
        Cambiar el rol de una cuenta cierra sus sesiones abiertas para que el rol nuevo aplique.
        Nadie puede cambiar su propio rol ni retirarse el acceso a sí mismo.
      </span>

      <Dialog isOpen={creating} title="Crear usuario" onClose={() => setCreating(false)}>
        <UserForm onSuccess={handleCreated} onCancel={() => setCreating(false)} />
      </Dialog>

      {toast.message && <Toast message={toast.message} />}
    </section>
  );
}
