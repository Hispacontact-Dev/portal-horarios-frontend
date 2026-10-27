"use client";

import Link from "next/link";
import { Corners } from "@/components/dashboard/Corners";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useEmployeeDefaultSchedule } from "@/lib/hooks/useEmployeeDefaultSchedule";
import { WEEKDAY_LABELS } from "@/components/schedules/DefaultScheduleEditor";
import { toH } from "@/lib/utils/time";
import { ROUTE_PATHS } from "@/lib/utils/constants";
import type { Weekday } from "@/types/schedule";

const WEEKDAYS: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const START = 6;
const SPAN = 16;
const TICKS = ["06", "10", "14", "18", "22"];
const OFF_PATTERN = "repeating-linear-gradient(45deg,#cfcfd1 0 3px,transparent 3px 6px)";
const MODALITY_LABELS: Record<"presencial" | "virtual", string> = {
  presencial: "Presencial",
  virtual: "Virtual/Casa",
};

export function EmployeeScheduleSummary({ employeeId }: { employeeId: string }) {
  const { state } = useEmployeeDefaultSchedule(employeeId);

  return (
    <section className="panel anim-up flex flex-col gap-3.5 px-[22px] py-5" style={{ animationDelay: ".2s" }}>
      <Corners />
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className="font-heading text-[13px] font-semibold text-[var(--accent-700)]">02</span>
        <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">Horario habitual</h2>
        {state.status === "success" &&
          (() => {
            const totalHours = state.data.days.reduce(
              (total, day) => total + day.time_ranges.reduce((sum, r) => sum + toH(r.end) - toH(r.start), 0),
              0,
            );
            const totalDays = state.data.days.filter((d) => d.works && d.modality).length;
            return (
              <span className="text-xs text-[var(--neutral-700)]">
                {+totalHours.toFixed(1)} h / semana · {totalDays} días
              </span>
            );
          })()}
        <Link
          href={`${ROUTE_PATHS.horarios}/administrar`}
          className="ml-auto whitespace-nowrap text-[13px] text-[var(--accent-700)] hover:text-[var(--accent-800)]"
        >
          Editar en Administrar horarios →
        </Link>
      </div>

      {state.status === "loading" && <Spinner />}
      {state.status === "error" && <ErrorState message={state.error.message} />}
      {state.status === "empty" && <EmptyState message="Sin horario habitual definido." />}

      {state.status === "success" && (
        <>
          <div className="grid grid-cols-[96px_minmax(0,1fr)_150px] gap-x-3.5 text-[10px] tracking-[.06em] text-[#76767a]">
            <span />
            <div className="flex justify-between">
              {TICKS.map((t) => (
                <span key={t} className="w-0 whitespace-nowrap">
                  {t}
                </span>
              ))}
            </div>
            <span />
          </div>

          <div className="flex flex-col">
            {WEEKDAYS.map((weekday, j) => {
              const day = state.data.days.find((d) => d.weekday === weekday);
              const ranges = day?.works && day.modality ? day.time_ranges : [];
              const off = ranges.length === 0;
              const modalityLabel = off ? "Descanso" : MODALITY_LABELS[day!.modality!];
              return (
                <div
                  key={weekday}
                  className="grid h-11 grid-cols-[96px_minmax(0,1fr)_150px] items-center gap-x-3.5 border-t border-[var(--divider)]"
                >
                  <span className={`text-sm font-medium ${off ? "text-[#76767a]" : ""}`}>{WEEKDAY_LABELS[weekday]}</span>
                  <div
                    className="relative h-5"
                    style={{
                      backgroundImage: "linear-gradient(90deg,var(--divider) 1px,transparent 1px)",
                      backgroundSize: "6.25% 100%",
                    }}
                  >
                    {off ? (
                      <div className="absolute inset-0 border border-[#b3b3b6]" style={{ background: OFF_PATTERN }} title="Descanso" />
                    ) : (
                      ranges.map((range, k) => (
                        <div
                          key={k}
                          title={`${range.start}–${range.end} · ${modalityLabel}`}
                          className={`anim-grow absolute inset-y-0 border border-[#6f93b8] ${
                            day!.modality === "virtual" ? "bg-[#c7dbf3]" : "bg-[var(--accent)]"
                          }`}
                          style={{
                            left: `${((toH(range.start) - START) / SPAN) * 100}%`,
                            width: `${((toH(range.end) - toH(range.start)) / SPAN) * 100}%`,
                            animationDelay: `${0.25 + j * 0.05 + k * 0.05}s`,
                          }}
                        />
                      ))
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className={`whitespace-nowrap text-xs tabular-nums ${off ? "text-[#76767a]" : ""}`}>
                      {off ? "—" : ranges.map((r) => `${r.start}–${r.end}`).join(" · ")}
                    </span>
                    <span className="text-[10px] uppercase tracking-[.1em] text-[var(--neutral-700)]">{modalityLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
