import { rangeStatusLabel, statusVisualProps, type RangeRuntimeStatus } from "@/lib/utils/scheduleStatus";

interface ScheduleRangeBlockProps {
  label: string;
  status: RangeRuntimeStatus | "sin_horario";
  progressPct?: number;
  title?: string;
  delay?: number;
}

export function ScheduleRangeBlock({ label, status, progressPct = 0, title, delay = 0 }: ScheduleRangeBlockProps) {
  const visual = statusVisualProps(status);
  const live = status === "en_curso";

  return (
    <div
      title={title}
      className={`anim-grow relative flex flex-wrap items-center justify-between gap-x-1.5 gap-y-0.5 overflow-hidden px-2 py-[5px] ${visual.className}`}
      style={{ ...visual.style, animationDelay: `${delay}s` }}
    >
      <span className="whitespace-nowrap text-xs font-medium tabular-nums">{label}</span>
      {status !== "sin_horario" && (
        <span className="flex items-center gap-[5px] whitespace-nowrap text-[10px] uppercase tracking-[.08em]">
          {live && (
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--bg)]" style={{ animation: "pulseDot 1.6s infinite" }} />
          )}
          {rangeStatusLabel(status)}
        </span>
      )}
      {live && (
        <div className="absolute bottom-0 left-0 h-[2px] bg-[var(--bg)] opacity-85" style={{ width: `${progressPct}%` }} />
      )}
    </div>
  );
}
