"use client";

import { type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { TodayScheduleEntry } from "@/lib/hooks/useTodaySchedule";
import { classifyDayEntry } from "@/lib/utils/scheduleStatus";
import { TurnosHoyBar } from "./TurnosHoyBar";

interface TurnosHoyRowProps {
  entry: TodayScheduleEntry;
  nowHour: number;
  animationDelay: string;
}

function initialsOf(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function TurnosHoyRow({ entry, nowHour, animationDelay }: TurnosHoyRowProps) {
  const router = useRouter();
  const classification = classifyDayEntry(entry.day, nowHour);

  function goToEmployee() {
    router.push(`/empleados/${entry.employee_id}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToEmployee();
    }
  }

  let track: ReactNode;
  if (classification.kind === "sin_horario") {
    track = (
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden rounded border border-[var(--divider)] px-2 text-[11px] text-[#3b3b3d]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #cfcfd1 0 4px, transparent 4px 8px)" }}
        title={entry.day.status_name}
      >
        <span className="truncate">{entry.day.status_name}</span>
      </div>
    );
  } else {
    const visibleRanges = classification.ranges.filter((r) => !r.isOutOfView);
    if (visibleRanges.length === 0) {
      const horario = classification.ranges.map((r) => `${r.range.start}–${r.range.end}`).join(", ");
      track = (
        <div
          className="flex h-full items-center justify-center text-[11px] text-[var(--neutral-700)]"
          title={horario}
        >
          Fuera de rango
        </div>
      );
    } else {
      track = visibleRanges.map((cr, i) => (
        <TurnosHoyBar key={i} classifiedRange={cr} fullName={entry.full_name} areaName={entry.area_name} />
      ));
    }
  }

  return (
    <div
      role="listitem"
      tabIndex={0}
      onClick={goToEmployee}
      onKeyDown={handleKeyDown}
      className="grid h-[46px] cursor-pointer grid-cols-[120px_minmax(0,1fr)] items-center gap-2 border-t border-[var(--divider)] py-2.5 outline-none hover:bg-[var(--accent-100)] focus-visible:bg-[var(--accent-100)] md:grid-cols-[190px_minmax(0,1fr)]"
    >
      <div className="flex flex-col overflow-hidden" title={`${entry.full_name} · ${entry.area_name}`}>
        <span className="truncate text-sm font-medium md:hidden">{initialsOf(entry.full_name)}</span>
        <span className="hidden truncate text-sm font-medium md:inline">{entry.full_name}</span>
        <span className="hidden truncate text-[11px] text-[var(--neutral-700)] md:inline">{entry.area_name}</span>
      </div>
      <div className="anim-grow relative h-[22px]" style={{ animationDelay }}>
        {track}
      </div>
    </div>
  );
}
