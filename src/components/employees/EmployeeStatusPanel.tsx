"use client";

import { useState } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { useEmployeeStatusChange } from "@/lib/hooks/useEmployeeStatusChange";
import { selectableOptions } from "@/lib/utils/catalog";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import type { Employee } from "@/types/employee";

export function EmployeeStatusPanel({
  employee,
  onDone,
}: {
  employee: Employee;
  onDone: (updated: Employee) => void;
}) {
  const { status: statusesStatus, statuses, error: statusesError } = useStatuses();
  const [selected, setSelected] = useState(employee.status_id ?? "");
  const { isSubmitting, error, changeStatus } = useEmployeeStatusChange({
    employeeId: employee.id,
    onSuccess: (updated) => {
      setSelected(updated.status_id ?? "");
      onDone(updated);
    },
  });

  const same = selected === employee.status_id;
  const options = selectableOptions(statuses, employee.status_id ?? undefined);

  return (
    <section className="panel anim-up flex max-w-full flex-[1_1_300px] flex-col gap-3.5 px-[22px] py-5" style={{ animationDelay: ".3s" }}>
      <Corners />
      <div className="flex items-baseline gap-2.5">
        <span className="font-heading text-[13px] font-semibold text-[var(--accent-700)]">03</span>
        <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">Estado</h2>
      </div>

      <div className="flex items-center justify-between border border-[var(--divider)] px-3.5 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-[.12em] text-[var(--neutral-700)]">Vigente</p>
          <p className="font-heading text-2xl font-semibold">{employee.status_name}</p>
        </div>
        <span
          className={`px-2 py-0.5 text-[11px] ${
            employee.is_active ? "bg-[var(--accent-100)] text-[var(--accent-800)]" : "bg-[#e3e3e5] text-[#3b3b3d]"
          }`}
        >
          {employee.is_active ? "Activo" : "Inactivo"}
        </span>
      </div>

      {statusesStatus === "loading" && <Spinner />}
      {statusesStatus === "error" && <ErrorState message={statusesError.message} />}

      {statusesStatus === "success" && (
        <div role="radiogroup" aria-label="Estado del empleado" className="flex flex-col gap-1.5">
          {options.map((option) => {
            const on = selected === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setSelected(option.id)}
                className={`flex items-center gap-3 border px-3 py-2.5 text-left transition-colors hover:bg-[var(--accent-100)] ${
                  on ? "border-[var(--accent)] bg-[var(--accent-100)]" : "border-[var(--divider)]"
                }`}
              >
                <span className="grid h-3.5 w-3.5 flex-none place-items-center border border-[var(--accent)]">
                  <span className={`h-2 w-2 transition-colors ${on ? "bg-[var(--accent)]" : ""}`} />
                </span>
                <span className="flex-1 text-sm font-medium">{option.name}</span>
                {employee.status_id === option.id && (
                  <span className="text-[10px] uppercase tracking-[.1em] text-[var(--accent-700)]">Actual</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-[13px] text-[var(--accent-800)]">{error.message}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={same || isSubmitting}
          onClick={() => setSelected(employee.status_id ?? "")}
          className="h-[38px] flex-1 border border-[var(--accent)] text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)] disabled:opacity-45"
        >
          Descartar
        </button>
        <button
          type="button"
          disabled={same || isSubmitting}
          onClick={() => changeStatus(selected)}
          className="font-heading relative h-[38px] flex-1 whitespace-nowrap border border-[var(--accent)] bg-[var(--accent)] font-semibold text-[var(--bg)] hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)] disabled:opacity-45"
        >
          <Corners />
          {isSubmitting ? "Aplicando…" : "Aplicar estado"}
        </button>
      </div>
      <p className="text-[11px] leading-snug text-[var(--neutral-700)]">
        El cambio de Estado se aplica por separado y queda registrado en Auditoría. El campo Activo del empleado es
        independiente y hoy no se modifica desde aquí.
      </p>
    </section>
  );
}
