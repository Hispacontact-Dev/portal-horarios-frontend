"use client";

import { useNowTick } from "@/lib/hooks/useNowTick";
import { nowLineFraction } from "@/lib/utils/scheduleLayout";
import { nowAsDecimalHour } from "@/lib/utils/scheduleStatus";

export function TurnosHoyNowLine() {
  const now = useNowTick();
  if (!now) return null;

  const frac = nowLineFraction(nowAsDecimalHour(now));
  if (frac === null) return null;

  const label = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div
      aria-hidden="true"
      className="anim-in pointer-events-none absolute -top-1.5 bottom-0 z-10 border-l border-dashed border-[var(--accent-700)] [--thy-name-col:120px] md:[--thy-name-col:190px]"
      style={{
        left: `calc(var(--thy-name-col) + (100% - var(--thy-name-col)) * ${frac})`,
        animationDelay: "1s",
      }}
    >
      <span className="absolute -top-1.5 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-[var(--accent-700)] px-1 py-0.5 text-[10px] font-medium text-[var(--bg)]">
        {label}
      </span>
    </div>
  );
}
