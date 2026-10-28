"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Corners } from "@/components/dashboard/Corners";
import { RoleGate } from "@/components/auth/RoleGate";
import { EmployeeScheduleModal } from "@/components/schedules/EmployeeScheduleModal";
import { ScheduleRangeBlock } from "@/components/schedules/ScheduleRangeBlock";
import { getInitials } from "@/components/employees/EmployeesView";
import { useAreas } from "@/lib/hooks/useAreas";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { useScheduleFilters } from "@/lib/hooks/useScheduleFilters";
import { useNowTick } from "@/lib/hooks/useNowTick";
import { applyScheduleFilters } from "@/lib/utils/scheduleFilters";
import { toH } from "@/lib/utils/time";
import { ROUTE_PATHS } from "@/lib/utils/constants";
import {
  nowAsDecimalHour,
  rangeProgressPct,
  rangeRuntimeStatus,
  rangeStatusLabel,
  statusVisualProps,
  type RangeRuntimeStatus,
} from "@/lib/utils/scheduleStatus";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import type { AsyncResourceState } from "@/lib/hooks/useAsyncResource";
import type { EmployeeWeekSchedule, WeekScheduleResponse } from "@/types/schedule";

interface HorariosViewProps {
  state: AsyncResourceState<WeekScheduleResponse>;
  retry: () => void;
  offset: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const LEGEND: { status: RangeRuntimeStatus | "sin_horario"; label: string }[] = [
  { status: "programado", label: "Programado" },
  { status: "en_curso", label: "En curso" },
  { status: "finalizado", label: "Finalizado" },
  { status: "sin_horario", label: "Sin horario (vacaciones, licencia, permiso…)" },
];

function formatDayHeader(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "short" });
}

function formatWeekLabel(weekStart: string, weekEnd: string): string {
  const start = new Date(`${weekStart}T00:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  const end = new Date(`${weekEnd}T00:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  return `${start} – ${end}`;
}

export function HorariosView({ state, retry, offset, canGoPrev, canGoNext, onPrev, onNext, onToday }: HorariosViewProps) {
  const [managedEmployeeId, setManagedEmployeeId] = useState<string | null>(null);
  const now = useNowTick();
  const nowHour = now ? nowAsDecimalHour(now) : null;

  const { areas } = useAreas();
  const { statuses } = useStatuses();
  const employees = state.status === "success" || state.status === "empty" ? state.data.employees : [];
  const { filters, setFilter, clearAll } = useScheduleFilters(employees);
  const filtered = applyScheduleFilters(employees, filters);
  const hasFilters = !!(filters.employee_id || filters.area_id || filters.status_id);

  const weekdays = employees[0]?.days ?? [];
  const serverToday = state.status === "success" || state.status === "empty" ? state.data.server_today : undefined;
  const todayDate = offset === 0 ? serverToday : undefined;
  const managedEmployee = employees.find((e) => e.employee_id === managedEmployeeId);

  const areaOptions = areas.filter((a) => a.is_enabled);
  const statusOptions = statuses.filter((s) => s.is_enabled);

  const kpis = useMemo(() => {
    const allRanges = filtered.flatMap((e) => e.days.flatMap((d) => d.time_ranges));
    const totalHours = allRanges.reduce((sum, r) => sum + toH(r.end) - toH(r.start), 0);
    const sinHorarioDays = filtered.flatMap((e) => e.days).filter((d) => d.time_ranges.length === 0).length;
    const enCursoAhora =
      nowHour !== null
        ? filtered.filter((e) =>
            e.days.some(
              (d) => d.date === todayDate && d.time_ranges.some((r) => rangeRuntimeStatus(r, nowHour) === "en_curso"),
            ),
          ).length
        : 0;
    return [
      { label: "Turnos en la semana", value: allRanges.length, sub: "" },
      { label: "En curso ahora", value: enCursoAhora, sub: "personas" },
      { label: "Sin horario", value: sinHorarioDays, sub: "días" },
      { label: "Horas programadas", value: Math.round(totalHours), sub: "h" },
    ];
  }, [filtered, nowHour, todayDate]);

  const sel = "min-h-[38px] border border-[var(--divider)] bg-[#e9e9ea] px-2.5 text-sm outline-none hover:border-[rgba(29,31,32,.45)] focus-visible:border-[var(--accent)]";
  const lbl = "mb-[5px] block text-xs text-[rgba(29,31,32,.7)]";

  return (
    <>
      <header className="anim-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">03 · Planeación semanal</p>
          <h1 className="font-heading mt-0.5 text-[42px] font-semibold uppercase leading-none">Horarios</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center border border-[var(--divider)]">
            <button type="button" onClick={onPrev} disabled={!canGoPrev} aria-label="Semana anterior" className="h-[38px] w-[38px] text-[var(--accent-700)] hover:bg-[var(--accent-100)] disabled:opacity-45">
              ‹
            </button>
            <div className="flex min-w-[170px] flex-col items-center border-x border-[var(--divider)] px-3.5">
              <span className="text-[10px] uppercase tracking-[.12em] text-[var(--neutral-700)]">
                {offset === 0 ? "Esta semana" : `${offset > 0 ? "+" : ""}${offset} semana${Math.abs(offset) > 1 ? "s" : ""}`}
              </span>
              {(state.status === "success" || state.status === "empty") && (
                <span className="font-heading whitespace-nowrap text-base font-semibold">
                  {formatWeekLabel(state.data.week_start, state.data.week_end)}
                </span>
              )}
            </div>
            <button type="button" onClick={onNext} disabled={!canGoNext} aria-label="Semana siguiente" className="h-[38px] w-[38px] text-[var(--accent-700)] hover:bg-[var(--accent-100)] disabled:opacity-45">
              ›
            </button>
          </div>
          <button type="button" disabled={offset === 0} onClick={onToday} className="h-[38px] border border-[var(--accent)] px-4 text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)] disabled:opacity-45">
            Hoy
          </button>
          <RoleGate>
            <Link
              href={`${ROUTE_PATHS.horarios}/administrar`}
              className="font-heading relative flex h-[38px] items-center whitespace-nowrap border border-[var(--accent)] bg-[var(--accent)] px-4 font-semibold text-[var(--bg)] hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)]"
            >
              <Corners />
              Administrar horarios
            </Link>
          </RoleGate>
        </div>
      </header>

      {state.status === "loading" && <Spinner />}
      {state.status === "error" && <ErrorState message={state.error.message} onRetry={retry} />}

      {(state.status === "success" || state.status === "empty") && (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] border border-[var(--divider)]">
            {kpis.map((k, i) => (
              <div key={k.label} className="anim-up border-r border-[var(--divider)] px-5 py-3.5 last:border-r-0" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
                <p className="whitespace-nowrap text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">{k.label}</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-heading text-[38px] font-semibold leading-none">{k.value}</span>
                  <span className="whitespace-nowrap text-[13px] text-[var(--neutral-700)]">{k.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <section className="panel anim-up flex min-w-0 flex-col gap-3.5 px-5 py-[18px]" style={{ animationDelay: ".3s" }}>
            <Corners />
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className={lbl}>Persona</label>
                <select value={filters.employee_id ?? ""} onChange={(e) => setFilter("employee_id", e.target.value || null)} className={`${sel} min-w-[200px]`}>
                  <option value="">Todas</option>
                  {employees.map((e) => (
                    <option key={e.employee_id} value={e.employee_id}>
                      {e.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Área</label>
                <select value={filters.area_id ?? ""} onChange={(e) => setFilter("area_id", e.target.value || null)} className={sel}>
                  <option value="">Todas</option>
                  {areaOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Estado</label>
                <select value={filters.status_id ?? ""} onChange={(e) => setFilter("status_id", e.target.value || null)} className={sel}>
                  <option value="">Todos</option>
                  {statusOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              {hasFilters && (
                <button type="button" onClick={clearAll} className="h-[38px] px-3 text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)]">
                  Limpiar filtros ×
                </button>
              )}
              <span className="ml-auto self-center whitespace-nowrap text-xs text-[var(--neutral-700)]">
                {filtered.length} de {employees.length} personas
              </span>
            </div>

            {employees.length === 0 && <EmptyWeekMessage />}
            {employees.length > 0 && filtered.length === 0 && <EmptyWeekMessage filtered onClear={clearAll} />}

            {filtered.length > 0 && (
              <div className="overflow-x-auto">
                <div className="min-w-[980px]">
                  <div className="grid grid-cols-[220px_repeat(5,minmax(0,1fr))] gap-x-2 border-b border-[rgba(29,31,32,.35)]">
                    <div className="py-2.5 text-[11px] uppercase tracking-[.1em] text-[var(--neutral-700)]">Persona</div>
                    {weekdays.map((day, i) => {
                      const isToday = day.date === todayDate;
                      return (
                        <div key={day.date} className={`flex items-center justify-between gap-1.5 px-2.5 py-2 ${isToday ? "bg-[var(--accent-100)]" : ""}`}>
                          <span className="font-heading whitespace-nowrap text-sm font-semibold capitalize leading-tight">{formatDayHeader(day.date)}</span>
                          {isToday && <span className="bg-[var(--accent-100)] px-2 py-0.5 text-[11px] text-[var(--accent-800)] ring-1 ring-[var(--accent)]">Hoy</span>}
                          <span className="sr-only">{i}</span>
                        </div>
                      );
                    })}
                  </div>

                  {filtered.map((employee, ri) => (
                    <div
                      key={employee.employee_id}
                      className="anim-in grid grid-cols-[220px_repeat(5,minmax(0,1fr))] gap-x-2 border-b border-[var(--divider)] hover:bg-[rgba(238,246,255,.6)]"
                      style={{ animationDelay: `${0.35 + Math.min(ri, 10) * 0.04}s` }}
                    >
                      <div className="flex min-w-0 items-center justify-between gap-2 py-2.5">
                        <Link href={`${ROUTE_PATHS.empleados}/${employee.employee_id}`} className="flex min-w-0 items-center gap-2.5">
                          <div className="font-heading grid h-8 w-8 flex-none place-items-center border border-[#8fadcc] text-xs font-semibold text-[var(--accent-700)]">
                            {getInitials(employee.full_name)}
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-medium">{employee.full_name}</span>
                            <span className="whitespace-nowrap text-[11px] text-[var(--neutral-700)]">{employee.area_name}</span>
                          </div>
                        </Link>
                        <RoleGate>
                          <button
                            type="button"
                            onClick={() => setManagedEmployeeId(employee.employee_id)}
                            className="flex-none whitespace-nowrap px-2 py-1 text-[11px] text-[var(--accent-700)] hover:bg-[var(--accent-100)]"
                          >
                            Administrar
                          </button>
                        </RoleGate>
                      </div>
                      {employee.days.map((day, di) => {
                        const isToday = day.date === todayDate;
                        const delay = 0.4 + Math.min(ri, 10) * 0.04 + di * 0.03;
                        return (
                          <div key={day.date} className={`flex flex-col justify-center gap-1 px-1.5 py-2 ${isToday ? "bg-[rgba(238,246,255,.7)]" : ""}`}>
                            {day.time_ranges.length === 0 ? (
                              <ScheduleRangeBlock label={day.status_name} status="sin_horario" title={`${employee.full_name} · ${day.status_name}`} delay={delay} />
                            ) : (
                              day.time_ranges.map((range, i) => {
                                const status = isToday && nowHour !== null ? rangeRuntimeStatus(range, nowHour) : "programado";
                                const pct = isToday && nowHour !== null ? rangeProgressPct(range, nowHour) : 0;
                                return (
                                  <ScheduleRangeBlock
                                    key={i}
                                    label={`${range.start}–${range.end}`}
                                    status={status}
                                    progressPct={pct}
                                    title={`${employee.full_name} · ${range.start}–${range.end} · ${rangeStatusLabel(status)}`}
                                    delay={delay}
                                  />
                                );
                              })
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-[18px] pt-1 text-xs text-[var(--neutral-700)]">
              {LEGEND.map(({ status, label }) => {
                const visual = statusVisualProps(status);
                return (
                  <span key={status} className="flex items-center gap-[7px]">
                    <span className={`h-3 w-[22px] ${visual.className}`} style={visual.style} />
                    {label}
                  </span>
                );
              })}
            </div>
          </section>
        </>
      )}

      <EmployeeScheduleModal
        isOpen={managedEmployeeId !== null}
        employee={managedEmployee}
        onClose={() => setManagedEmployeeId(null)}
        onSaved={retry}
      />
    </>
  );
}

function EmptyWeekMessage({ filtered, onClear }: { filtered?: boolean; onClear?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <span className="font-heading text-[22px] font-semibold">Sin horarios</span>
      <span className="text-[13px] text-[var(--neutral-700)]">
        {filtered ? "Ningún empleado coincide con los filtros." : "No hay datos de horarios para esta semana."}
      </span>
      {filtered && onClear && (
        <button type="button" onClick={onClear} className="px-3 py-1.5 text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)]">
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
