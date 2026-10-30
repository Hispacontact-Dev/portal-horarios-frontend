import type { Holiday } from "@/types/holiday";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RoleGate } from "@/components/auth/RoleGate";

interface HolidayTableProps {
  holidays: Holiday[];
  onToggleBlocksShifts: (holiday: Holiday) => void;
  onDelete: (holiday: Holiday) => void;
  actionsDisabled?: boolean;
}

export function HolidayTable({
  holidays,
  onToggleBlocksShifts,
  onDelete,
  actionsDisabled = false,
}: HolidayTableProps) {
  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Table>
      <thead>
        <tr className="border-b border-[rgba(29,31,32,.35)]">
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Fecha</th>
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Nombre</th>
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Tipo</th>
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Turnos</th>
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((holiday) => (
          <tr key={holiday.date} className="border-t border-[var(--divider)] hover:bg-[rgba(238,246,255,.6)]">
            <td className="px-3 py-2 tabular-nums">{holiday.date}</td>
            <td className="px-3 py-2 font-medium">{holiday.name}</td>
            <td className="px-3 py-2">
              <Badge className={holiday.type === "empresa" ? "bg-[var(--accent-100)] text-[var(--accent-700)]" : "bg-[#e3e3e5] text-[#3b3b3d]"}>
                {holiday.type === "empresa" ? "Empresa" : "Nacional"}
              </Badge>
            </td>
            <td className="px-3 py-2">
              <div className="flex items-center gap-2">
                <Badge className={holiday.blocks_shifts ? "bg-[#e3e3e5] text-[#3b3b3d]" : "bg-[var(--accent-100)] text-[var(--accent-800)]"}>
                  {holiday.blocks_shifts ? "Bloquea turnos" : "Se trabaja"}
                </Badge>
                <RoleGate>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onToggleBlocksShifts(holiday)}
                    disabled={actionsDisabled}
                  >
                    Cambiar
                  </Button>
                </RoleGate>
              </div>
            </td>
            <td className="px-3 py-2">
              {holiday.type === "empresa" && (
                <RoleGate>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => onDelete(holiday)}
                    disabled={actionsDisabled}
                  >
                    Eliminar
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
