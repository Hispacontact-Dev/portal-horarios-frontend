import { TIMELINE_END_HOUR, TIMELINE_START_HOUR } from "@/lib/utils/scheduleStatus";

const HOURS = Array.from(
  { length: (TIMELINE_END_HOUR - TIMELINE_START_HOUR) / 2 + 1 },
  (_, i) => TIMELINE_START_HOUR + i * 2,
);

export function TurnosHoyHourRow() {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2 md:grid-cols-[190px_minmax(0,1fr)]" aria-hidden="true">
      <div />
      <div className="relative h-4">
        {HOURS.map((hour) => {
          const leftPct = ((hour - TIMELINE_START_HOUR) / (TIMELINE_END_HOUR - TIMELINE_START_HOUR)) * 100;
          return (
            <span
              key={hour}
              className="absolute whitespace-nowrap text-[10px] text-[#76767a]"
              style={{ left: `${leftPct}%` }}
            >
              {String(hour).padStart(2, "0")}
            </span>
          );
        })}
      </div>
    </div>
  );
}
