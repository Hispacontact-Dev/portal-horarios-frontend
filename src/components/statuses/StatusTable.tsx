import type { Status } from "@/types/status";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RoleGate } from "@/components/auth/RoleGate";

interface StatusTableProps {
  statuses: Status[];
  onEdit: (status: Status) => void;
  onDisable: (status: Status) => void;
  onEnable: (status: Status) => void;
  actionsDisabled?: boolean;
}

export function StatusTable({
  statuses,
  onEdit,
  onDisable,
  onEnable,
  actionsDisabled = false,
}: StatusTableProps) {
  return (
    <Table>
      <thead>
        <tr className="border-b border-[rgba(29,31,32,.35)]">
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Nombre</th>
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Condición</th>
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Origen</th>
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {statuses.map((status) => (
          <tr key={status.id} className="border-t border-[var(--divider)] hover:bg-[rgba(238,246,255,.6)]">
            <td className="px-3 py-2 font-medium">{status.name}</td>
            <td className="px-3 py-2">
              <Badge
                className={
                  status.is_enabled ? "bg-[var(--accent-100)] text-[var(--accent-800)]" : "bg-[#e3e3e5] text-[#3b3b3d]"
                }
              >
                {status.is_enabled ? "Habilitado" : "Deshabilitado"}
              </Badge>
            </td>
            <td className="px-3 py-2 text-[var(--neutral-700)]">
              {status.is_predefined ? (
                <Badge className="bg-[var(--accent-100)] text-[var(--accent-700)]">Predefinido</Badge>
              ) : (
                "Personalizado"
              )}
            </td>
            <td className="px-3 py-2">
              {!status.is_predefined && (
                <RoleGate>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onEdit(status)}
                      disabled={actionsDisabled}
                    >
                      Editar
                    </Button>
                    {status.is_enabled ? (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => onDisable(status)}
                        disabled={actionsDisabled}
                      >
                        Deshabilitar
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onEnable(status)}
                        disabled={actionsDisabled}
                      >
                        Habilitar
                      </Button>
                    )}
                  </div>
                </RoleGate>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
