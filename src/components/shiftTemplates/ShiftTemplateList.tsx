import { Button } from "@/components/ui/Button";
import { RoleGate } from "@/components/auth/RoleGate";
import type { ShiftTemplate } from "@/types/shiftTemplate";
import type { TimeRange, Weekday } from "@/types/schedule";

const WEEKDAY_ORDER: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "L",
  tuesday: "M",
  wednesday: "X",
  thursday: "J",
  friday: "V",
};

const HOUR_TICKS = ["00", "04", "08", "12", "16", "20", "24"];

function toHours(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
}

function totalHours(blocks: TimeRange[]): number {
  const total = blocks.reduce((sum, block) => sum + toHours(block.end) - toHours(block.start), 0);
  return Number(total.toFixed(1));
}

function formatBlocks(blocks: TimeRange[]): string {
  return blocks.map((block) => `${block.start}–${block.end}`).join(" · ");
}

interface ShiftTemplateListProps {
  templates: ShiftTemplate[];
  onEdit: (template: ShiftTemplate) => void;
  onDuplicate: (template: ShiftTemplate) => void;
  actionsDisabled?: boolean;
}

// Cada plantilla se lee como una franja sobre un día de 24 h: de un vistazo se ve
// si una cubre la mañana, la tarde o una jornada partida.
export function ShiftTemplateList({
  templates,
  onEdit,
  onDuplicate,
  actionsDisabled = false,
}: ShiftTemplateListProps) {
  return (
    <div className="min-w-[760px]">
      <div className="grid grid-cols-[200px_minmax(0,1fr)_120px_160px] items-center gap-x-[18px] border-b border-[var(--divider)] pb-1.5 text-[10px] uppercase tracking-[.1em] text-[var(--neutral-700)]">
        <span>Plantilla</span>
        <div className="flex justify-between" aria-hidden="true">
          {HOUR_TICKS.map((tick) => (
            <span key={tick} className="w-0 whitespace-nowrap">
              {tick}
            </span>
          ))}
        </div>
        <span>Días</span>
        <span />
      </div>

      {templates.map((template) => (
        <div
          key={template.id}
          className="grid min-h-[56px] grid-cols-[200px_minmax(0,1fr)_120px_160px] items-center gap-x-[18px] border-b border-[var(--divider)]"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{template.name}</span>
            <span className="text-xs tabular-nums text-[var(--neutral-700)]">
              {formatBlocks(template.blocks)} · {totalHours(template.blocks)} h
            </span>
          </div>

          <div className="track-ui" aria-hidden="true">
            {template.blocks.map((block, index) => (
              <div
                key={`${block.start}-${block.end}-${index}`}
                className="track-block"
                style={{
                  left: `${(toHours(block.start) / 24) * 100}%`,
                  width: `${((toHours(block.end) - toHours(block.start)) / 24) * 100}%`,
                }}
              />
            ))}
          </div>

          <div className="flex gap-[3px]">
            {WEEKDAY_ORDER.map((day) => {
              const active = template.weekdays.includes(day);
              return (
                <span
                  key={day}
                  className={`grid h-[22px] w-[22px] place-items-center border text-[10px] font-semibold ${
                    active
                      ? "border-[var(--accent-700)] bg-[var(--accent-700)] text-[var(--bg)]"
                      : "border-[var(--divider)] text-[var(--neutral-700)]"
                  }`}
                >
                  {WEEKDAY_LABELS[day]}
                </span>
              );
            })}
          </div>

          <RoleGate>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-[30px] px-3 text-[13px]"
                onClick={() => onEdit(template)}
                disabled={actionsDisabled}
              >
                Editar
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-[30px] px-3 text-[13px]"
                onClick={() => onDuplicate(template)}
                disabled={actionsDisabled}
              >
                Duplicar
              </Button>
            </div>
          </RoleGate>
        </div>
      ))}
    </div>
  );
}
