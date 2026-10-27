"use client";

import Link from "next/link";
import { Corners } from "@/components/dashboard/Corners";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmployeeStatusBadge } from "@/components/employees/EmployeeStatusBadge";
import { getInitials } from "@/components/employees/EmployeesView";
import { useEmployeeDefaultSchedule } from "@/lib/hooks/useEmployeeDefaultSchedule";
import { WEEKDAY_LABELS } from "@/components/schedules/DefaultScheduleEditor";
import { POSITION_LABELS, ROUTE_PATHS } from "@/lib/utils/constants";
import type { Weekday } from "@/types/schedule";
import type { Employee } from "@/types/employee";

const WEEKDAYS: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const DAY_ABBR: Record<Weekday, string> = {
  monday: "L",
  tuesday: "M",
  wednesday: "X",
  thursday: "J",
  friday: "V",
};
const MODALITY_COLOR: Record<"presencial" | "virtual", string> = {
  presencial: "var(--accent)",
  virtual: "#c7dbf3",
};
const OFF = "repeating-linear-gradient(45deg,#cfcfd1 0 3px,transparent 3px 6px)";

export function EmployeeDetail({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const { state: schedule } = useEmployeeDefaultSchedule(employee.id);

  return (
    <aside className="panel anim-slide sticky top-7 flex flex-col gap-[18px] p-[22px]">
      <Corners />
      <div className="flex items-start justify-between">
        <div className="font-heading grid h-14 w-14 place-items-center border border-[var(--accent)] text-[22px] font-semibold text-[var(--accent-700)]">
          {getInitials(employee.full_name)}
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="h-8 w-8 text-lg text-[var(--accent-700)] hover:bg-[var(--accent-100)]">
          ×
        </button>
      </div>

      <div>
        <h2 className="font-heading text-[28px] font-semibold leading-[1.05]">{employee.full_name}</h2>
        <p className="mt-1 text-[13px] text-[var(--neutral-700)]">
          {POSITION_LABELS[employee.position]} · {employee.area_name}
        </p>
      </div>

      <div className="flex gap-2 border border-[var(--divider)] px-3 py-2.5">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[.12em] text-[var(--neutral-700)]">Estado</p>
          <div className="mt-1">
            <EmployeeStatusBadge statusName={employee.status_name} />
          </div>
        </div>
        <div className="flex-1 border-l border-[var(--divider)] pl-3">
          <p className="text-[10px] uppercase tracking-[.12em] text-[var(--neutral-700)]">Activo</p>
          <p className="mt-1.5 flex items-center gap-[7px] text-sm">
            <span className={`h-2 w-2 border border-[#6f93b8] ${employee.is_active ? "bg-[var(--accent)]" : ""}`} />
            {employee.is_active ? "Activo" : "Inactivo"}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">Horario habitual</p>

        {schedule.status === "loading" && <Spinner />}
        {schedule.status === "error" && <ErrorState message={schedule.error.message} />}
        {schedule.status === "empty" && <EmptyState message="Sin horario habitual definido." />}

        {schedule.status === "success" && (
          <div className="grid grid-cols-5 gap-1">
            {WEEKDAYS.map((weekday, j) => {
              const day = schedule.data.days.find((d) => d.weekday === weekday);
              const active = day?.works && day.modality;
              const range = day?.time_ranges[0];
              return (
                <div key={weekday} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase tracking-[.08em] text-[var(--neutral-700)]">{DAY_ABBR[weekday]}</span>
                  <div
                    className="anim-up h-11 w-full border border-[#8fadcc]"
                    style={{ background: active ? MODALITY_COLOR[day!.modality!] : OFF, animationDelay: `${0.1 + j * 0.05}s` }}
                    title={
                      active
                        ? day!.time_ranges.map((r) => `${r.start} a ${r.end}`).join(", ")
                        : "No trabaja"
                    }
                  />
                  <span className="text-[10px] tabular-nums text-[var(--neutral-700)]">
                    {active && range ? `${range.start.slice(0, 2)}–${range.end.slice(0, 2)}` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href={`${ROUTE_PATHS.empleados}/${employee.id}`}
          className="font-heading relative flex h-[38px] flex-1 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] font-semibold text-[var(--bg)] hover:bg-[var(--accent-600)]"
        >
          <Corners />
          Editar
        </Link>
        <Link
          href={`${ROUTE_PATHS.empleados}/${employee.id}`}
          className="flex h-[38px] flex-1 items-center justify-center border border-[var(--accent)] text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)]"
        >
          Ver horario completo
        </Link>
      </div>
    </aside>
  );
}
