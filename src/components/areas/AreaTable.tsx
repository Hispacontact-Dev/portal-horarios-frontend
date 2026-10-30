import type { Area } from "@/types/area";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RoleGate } from "@/components/auth/RoleGate";

interface AreaTableProps {
  areas: Area[];
  onEdit: (area: Area) => void;
  onDisable: (area: Area) => void;
  onEnable: (area: Area) => void;
  actionsDisabled?: boolean;
}

export function AreaTable({
  areas,
  onEdit,
  onDisable,
  onEnable,
  actionsDisabled = false,
}: AreaTableProps) {
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
        {areas.map((area) => (
          <tr key={area.id} className="border-t border-[var(--divider)] hover:bg-[rgba(238,246,255,.6)]">
            <td className="px-3 py-2 font-medium">{area.name}</td>
            <td className="px-3 py-2">
              <Badge
                className={
                  area.is_enabled ? "bg-[var(--accent-100)] text-[var(--accent-800)]" : "bg-[#e3e3e5] text-[#3b3b3d]"
                }
              >
                {area.is_enabled ? "Habilitada" : "Deshabilitada"}
              </Badge>
            </td>
            <td className="px-3 py-2">
              <RoleGate>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onEdit(area)}
                    disabled={actionsDisabled}
                  >
                    Editar
                  </Button>
                  {area.is_enabled ? (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => onDisable(area)}
                      disabled={actionsDisabled}
                    >
                      Deshabilitar
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onEnable(area)}
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
