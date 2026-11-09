import { TIMELINE_END_HOUR, TIMELINE_START_HOUR } from "@/lib/utils/scheduleStatus";

const HOURS = Array.from(
  { length: (TIMELINE_END_HOUR - TIMELINE_START_HOUR) / 2 + 1 },
  (_, i) => TIMELINE_START_HOUR + i * 2,
);

// Las medidas de la rejilla (--thy-name-col, --thy-gap) las declara TurnosHoy en su raíz:
// la regla, las filas y la línea de "ahora" tienen que compartirlas o se desalinean.
export function TurnosHoyHourRow() {
  return (
    <div className="grid grid-cols-[var(--thy-name-col)_minmax(0,1fr)] gap-[var(--thy-gap)]" aria-hidden="true">
      <div />
      <div className="relative h-4">
        {HOURS.map((hour) => {
          const leftPct = ((hour - TIMELINE_START_HOUR) / (TIMELINE_END_HOUR - TIMELINE_START_HOUR)) * 100;
          // Centrada sobre su marca, salvo en los extremos: ahí se alinea hacia adentro
          // para no desbordarse del panel.
          const shift = leftPct === 0 ? "0" : leftPct === 100 ? "-100%" : "-50%";
          return (
            <span
              key={hour}
              className="absolute whitespace-nowrap text-[10px] text-[#76767a]"
              style={{ left: `${leftPct}%`, transform: `translateX(${shift})` }}
            >
              {String(hour).padStart(2, "0")}
            </span>
          );
        })}
      </div>
    </div>
  );
}
