import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { RoleGate } from "@/components/auth/RoleGate";
import type { Holiday } from "@/types/holiday";

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface HolidayListProps {
  holidays: Holiday[];
  /** Fecha de hoy en formato YYYY-MM-DD, o `null` en el primer render del cliente. */
  today: string | null;
  onToggleBlocksShifts: (holiday: Holiday) => void;
  onDelete: (holiday: Holiday) => void;
  actionsDisabled?: boolean;
}

// El día se lee como una hoja de calendario: número grande, mes y día de la semana.
export function HolidayList({
  holidays,
  today,
  onToggleBlocksShifts,
  onDelete,
  actionsDisabled = false,
}: HolidayListProps) {
  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));
  const nextDate = today === null ? undefined : sorted.find((entry) => entry.date >= today)?.date;

  return (
    <div className="min-w-[620px]">
      {sorted.map((holiday) => {
        const [year, month, day] = holiday.date.split("-").map(Number);
        const isPast = today !== null && holiday.date < today;
        // `Date` local solo para el nombre del día; la fecha ya viene desarmada.
        const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];

        return (
          <div
            key={holiday.date}
            className={`grid min-h-[52px] grid-cols-[72px_minmax(0,1fr)_110px_180px_36px] items-center gap-x-[18px] border-t border-[var(--divider)] ${
              isPast ? "opacity-55" : ""
            }`}
          >
            <div className="flex flex-col leading-none">
              <b className="font-heading text-[22px] font-semibold tabular-nums">
                {String(day).padStart(2, "0")}
              </b>
              <span className="mt-[3px] text-[10px] uppercase tracking-[.1em] text-[var(--neutral-700)]">
                {MONTHS[month - 1]} · {weekday}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-medium">{holiday.name}</span>
              {holiday.date === nextDate && (
                <Badge className="bg-[var(--accent-100)] text-[var(--accent-800)]">Próximo</Badge>
              )}
            </div>

            <Badge
              className={
                holiday.type === "empresa"
                  ? "border border-[var(--accent-600)] text-[var(--accent-700)]"
                  : "bg-[#e3e3e5] text-[#3b3b3d]"
              }
            >
              {holiday.type === "empresa" ? "Empresa" : "Nacional"}
            </Badge>

            <div className="flex items-center gap-2.5">
              <RoleGate>
                <Switch
                  checked={holiday.blocks_shifts}
                  label={`Bloquear turnos el ${holiday.name}`}
                  onChange={() => onToggleBlocksShifts(holiday)}
                  disabled={actionsDisabled}
                />
              </RoleGate>
              <span className="text-xs text-[var(--neutral-700)]">
                {holiday.blocks_shifts ? "Bloquea turnos" : "Se trabaja"}
              </span>
            </div>

            {holiday.type === "empresa" ? (
              <RoleGate>
                <button
                  type="button"
                  aria-label={`Eliminar ${holiday.name}`}
                  onClick={() => onDelete(holiday)}
                  disabled={actionsDisabled}
                  className="grid h-[30px] w-[30px] place-items-center border border-[var(--divider)] text-base text-[var(--accent-800)] hover:bg-[var(--accent-100)] disabled:pointer-events-none disabled:opacity-45"
                >
                  ×
                </button>
              </RoleGate>
            ) : (
              <span />
            )}
          </div>
        );
      })}
    </div>
  );
}
