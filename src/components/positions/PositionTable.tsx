import type { Position } from "@/types/position";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RoleGate } from "@/components/auth/RoleGate";

interface PositionTableProps {
  positions: Position[];
  onEdit: (position: Position) => void;
  onDisable: (position: Position) => void;
  onEnable: (position: Position) => void;
  actionsDisabled?: boolean;
}

export function PositionTable({
  positions,
  onEdit,
  onDisable,
  onEnable,
  actionsDisabled = false,
}: PositionTableProps) {
  return (
    <Table>
      <thead>
        <tr className="border-b border-[rgba(29,31,32,.35)]">
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Nombre</th>
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Condición</th>
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {positions.map((position) => (
          <tr key={position.id} className="border-t border-[var(--divider)] hover:bg-[rgba(238,246,255,.6)]">
            <td className="px-3 py-2 font-medium">{position.name}</td>
            <td className="px-3 py-2">
              <Badge
                className={
                  position.is_enabled ? "bg-[var(--accent-100)] text-[var(--accent-800)]" : "bg-[#e3e3e5] text-[#3b3b3d]"
                }
              >
                {position.is_enabled ? "Habilitado" : "Deshabilitado"}
              </Badge>
            </td>
            <td className="px-3 py-2">
              <RoleGate>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onEdit(position)}
                    disabled={actionsDisabled}
                  >
                    Editar
                  </Button>
                  {position.is_enabled ? (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => onDisable(position)}
                      disabled={actionsDisabled}
                    >
                      Deshabilitar
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onEnable(position)}
                      disabled={actionsDisabled}
                    >
                      Habilitar
                    </Button>
                  )}
                </div>
              </RoleGate>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
