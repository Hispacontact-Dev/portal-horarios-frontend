import type { ShiftTemplate } from "@/types/shiftTemplate";
import type { Weekday } from "@/types/schedule";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { RoleGate } from "@/components/auth/RoleGate";

const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "L",
  tuesday: "M",
  wednesday: "X",
  thursday: "J",
  friday: "V",
};

const WEEKDAY_ORDER: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];

function formatBlocks(template: ShiftTemplate): string {
  return template.blocks.map((block) => `${block.start}–${block.end}`).join(" · ");
}

function formatWeekdays(template: ShiftTemplate): string {
  return WEEKDAY_ORDER.filter((day) => template.weekdays.includes(day))
    .map((day) => WEEKDAY_LABELS[day])
    .join(" ");
}

interface ShiftTemplateTableProps {
  templates: ShiftTemplate[];
  onEdit: (template: ShiftTemplate) => void;
  onDuplicate: (template: ShiftTemplate) => void;
  actionsDisabled?: boolean;
}

export function ShiftTemplateTable({
  templates,
  onEdit,
  onDuplicate,
  actionsDisabled = false,
}: ShiftTemplateTableProps) {
  return (
    <Table>
      <thead>
        <tr className="border-b border-[rgba(29,31,32,.35)]">
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Nombre</th>
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Horario</th>
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Días</th>
          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {templates.map((template) => (
          <tr key={template.id} className="border-t border-[var(--divider)] hover:bg-[rgba(238,246,255,.6)]">
            <td className="px-3 py-2 font-medium">{template.name}</td>
            <td className="px-3 py-2 tabular-nums text-[var(--neutral-700)]">{formatBlocks(template)}</td>
            <td className="px-3 py-2 tabular-nums text-[var(--neutral-700)]">{formatWeekdays(template)}</td>
            <td className="px-3 py-2">
              <RoleGate>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onEdit(template)}
                    disabled={actionsDisabled}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onDuplicate(template)}
                    disabled={actionsDisabled}
                  >
                    Duplicar
                  </Button>
                </div>
              </RoleGate>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
