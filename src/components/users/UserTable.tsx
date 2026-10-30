"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Table, Th, TheadRow } from "@/components/ui/Table";
import { RoleGate } from "@/components/auth/RoleGate";
import { ROLE_LABELS } from "@/lib/utils/constants";
import { canonicalRole, roleLabel } from "@/lib/utils/role";
import type { User, UserRoleUpdate } from "@/types/user";

const ASSIGNABLE_ROLES: UserRoleUpdate["role"][] = ["gestion_humana", "lider"];

function initials(user: User): string {
  const source = user.full_name.trim() === "" ? user.email.replace(/@.*/, "") : user.full_name;
  return source
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

interface UserTableProps {
  users: User[];
  onChangeRole: (user: User, role: UserRoleUpdate["role"]) => void;
  onDeactivate: (user: User) => void;
  actionsDisabled?: boolean;
}

export function UserTable({
  users,
  onChangeRole,
  onDeactivate,
  actionsDisabled = false,
}: UserTableProps) {
  return (
    <Table className="min-w-[680px]">
      <thead>
        <TheadRow>
          <Th>Usuario</Th>
          <Th className="w-[190px]">Rol</Th>
          <Th className="w-[140px]">Acceso</Th>
          <Th className="w-[140px]">Creado</Th>
          <Th className="w-[130px]" />
        </TheadRow>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr
            key={user.id}
            className={`border-t border-[var(--divider)] hover:bg-[rgba(238,246,255,.6)] ${
              user.is_active ? "" : "text-[var(--neutral-700)]"
            }`}
          >
            <td className="px-3 py-2">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="font-heading grid h-[34px] w-[34px] flex-none place-items-center border border-[var(--accent-600)] text-[13px] font-semibold text-[var(--accent-800)]"
                >
                  {initials(user)}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium">{user.full_name}</span>
                  <span className="text-[11px] text-[var(--neutral-700)]">{user.email}</span>
                </div>
              </div>
            </td>

            <td className="px-3 py-2">
              <RoleGate
                fallback={<span className="text-sm">{roleLabel(user.role)}</span>}
              >
                <Select
                  value={canonicalRole(user.role)}
                  aria-label={`Rol de ${user.full_name}`}
                  disabled={actionsDisabled || !user.is_active}
                  onChange={(event) =>
                    onChangeRole(user, event.target.value as UserRoleUpdate["role"])
                  }
                >
                  {ASSIGNABLE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </Select>
              </RoleGate>
            </td>

            <td className="px-3 py-2">
              <Badge
                className={`inline-flex items-center gap-1.5 ${
                  user.is_active
                    ? "bg-[var(--accent-100)] text-[var(--accent-800)]"
                    : "bg-[#e3e3e5] text-[#3b3b3d]"
                }`}
              >
                <i className="dot-ui" data-on={user.is_active} />
                {user.is_active ? "Activo" : "Retirado"}
              </Badge>
            </td>

            <td className="px-3 py-2 tabular-nums text-[var(--neutral-700)]">
              {formatDate(user.created_at)}
            </td>

            <td className="px-3 py-2 text-right">
              {user.is_active && (
                <RoleGate>
                  <Button
                    type="button"
                    variant="danger"
                    className="h-[30px] px-3 text-[13px]"
                    onClick={() => onDeactivate(user)}
                    disabled={actionsDisabled}
                  >
                    Desactivar
                  </Button>
                </RoleGate>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
