"use client";

import { useEffect, useState } from "react";

export function LiveClock({ variant }: { variant: "clock" | "date" }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return <div className={variant === "clock" ? "h-[130px]" : "h-4"} />;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (variant === "date") {
    return (
      <span className="text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">
        {now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
      </span>
    );
  }

  return (
    <div className="anim-up flex flex-col items-center gap-2">
      <div className="font-heading flex items-baseline text-[clamp(80px,14vw,120px)] font-semibold leading-[.9] tracking-[-.02em] tabular-nums">
        <span>{pad(now.getHours())}</span>
        <span className="text-[var(--accent)]" style={{ animation: "blink 1s steps(1) infinite" }}>
          :
        </span>
        <span>{pad(now.getMinutes())}</span>
      </div>
      <div className="relative h-[2px] w-[260px] max-w-full bg-[var(--divider)]">
        <div
          className="absolute inset-0 origin-left bg-[var(--accent)] transition-transform duration-1000 ease-linear"
          style={{ transform: `scaleX(${now.getSeconds() / 59})` }}
        />
      </div>
    </div>
  );
}
