import { rangeToBarPosition } from "@/lib/utils/scheduleLayout";
import { rangeStatusLabel, statusVisualProps, type ClassifiedRange } from "@/lib/utils/scheduleStatus";
import { cn } from "@/lib/utils/cn";

interface TurnosHoyBarProps {
  classifiedRange: ClassifiedRange;
  fullName: string;
  areaName: string;
}

export function TurnosHoyBar({ classifiedRange, fullName, areaName }: TurnosHoyBarProps) {
  const { leftPct, widthPct } = rangeToBarPosition(classifiedRange);
  if (widthPct <= 0) return null;

  const { range, status, isLeftCut, isRightCut } = classifiedRange;
  const visual = statusVisualProps(status);
  const statusLabel = rangeStatusLabel(status);
  const horario = `${range.start}–${range.end}`;

  return (
    <div
      className={cn(
        "absolute top-1/2 flex h-[22px] -translate-y-1/2 items-center overflow-hidden px-2 text-[11px] whitespace-nowrap",
        visual.className,
      )}
      style={{ left: `${leftPct}%`, width: `${widthPct}%`, ...visual.style }}
      title={`${fullName} · ${horario} · ${statusLabel}`}
      aria-label={`${fullName}, ${areaName}, ${range.start} a ${range.end}, ${statusLabel}`}
    >
      {isLeftCut && <span className="mr-1">‹</span>}
      <span className="truncate">
        {horario} · {statusLabel}
      </span>
      {isRightCut && <span className="ml-1">›</span>}
    </div>
  );
}
