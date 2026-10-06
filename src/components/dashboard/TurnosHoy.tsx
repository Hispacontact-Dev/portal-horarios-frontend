"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Corners } from "./Corners";

export type Estado = "Presente" | "Tarde" | "Descanso" | "Ausente" | "Programado";
export type Turno = { id: string; nombre: string; area: string; inicio: number; fin: number; estado: Estado };

const START = 6;
const END = 22;
const SPAN = END - START;
const HOURS = ["06", "08", "10", "12", "14", "16", "18", "20", "22"];

const STYLE: Record<Estado, { bg: string; ink: string }> = {
  Presente: { bg: "var(--accent)", ink: "var(--bg)" },
  Tarde: { bg: "var(--accent-700)", ink: "var(--bg)" },
  Descanso: { bg: "#c7dbf3", ink: "#1a2b3b" },
  Ausente: { bg: "repeating-linear-gradient(45deg,#cfcfd1 0 4px,transparent 4px 8px)", ink: "#3b3b3d" },
  Programado: { bg: "transparent", ink: "var(--accent-800)" },
};
const p = (n: number) => String(n).padStart(2, "0");

export function TurnosHoy({ turnos }: { turnos: Turno[] }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const frac = now ? Math.min(1, Math.max(0, (now.getHours() + now.getMinutes() / 60 - START) / SPAN)) : null;

  return (
    <section className="panel anim-up flex flex-col gap-3 px-5 py-[18px]" style={{ animationDelay: ".3s" }}>
      <Corners />
      <div className="flex items-baseline justify-between">
        <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">Turnos de hoy</h2>
        <Link href="/horarios" className="whitespace-nowrap text-[13px] text-[var(--accent-700)] hover:text-[var(--accent-800)]">
          Ver horarios →
        </Link>
      </div>

      {turnos.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--neutral-700)]">
          Módulo de horarios próximamente: esta vista se completará cuando el backend exponga los turnos del día.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-[190px_minmax(0,1fr)] text-[10px] tracking-[.06em] text-[#76767a]">
            <span />
            <div className="flex justify-between">
              {HOURS.map((h) => (
                <span key={h} className="w-0 whitespace-nowrap">
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col">
            {turnos.map((t, i) => {
              const s = STYLE[t.estado];
              return (
                <div key={t.id} className="grid h-[46px] grid-cols-[190px_minmax(0,1fr)] items-center border-t border-[var(--divider)]">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{t.nombre}</span>
                    <span className="text-[11px] text-[var(--neutral-700)]">{t.area}</span>
                  </div>
                  <div className="relative h-[22px]">
                    <div
                      className="anim-grow absolute inset-y-0 flex items-center overflow-hidden whitespace-nowrap border border-[#6f93b8] px-2 text-[11px]"
                      style={{
                        left: `${((t.inicio - START) / SPAN) * 100}%`,
                        width: `${((t.fin - t.inicio) / SPAN) * 100}%`,
                        background: s.bg,
                        color: s.ink,
                        animationDelay: `${0.35 + i * 0.07}s`,
                      }}
                    >
                      {p(t.inicio)}:00–{p(t.fin)}:00 · {t.estado}
                    </div>
                  </div>
                </div>
              );
            })}

            {frac !== null && now && (
              <div
                className="anim-in pointer-events-none absolute -top-1.5 bottom-0 border-l border-dashed border-[var(--accent-700)]"
                style={{ left: `calc(190px + (100% - 190px) * ${frac})`, animationDelay: "1s" }}
              >
                <span className="absolute -left-6 -top-3.5 bg-[var(--accent-700)] px-[5px] py-px text-[10px] tracking-[.08em] text-[var(--bg)]">
                  {p(now.getHours())}:{p(now.getMinutes())}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
