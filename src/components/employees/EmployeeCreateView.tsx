"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Corners } from "@/components/dashboard/Corners";
import { getInitials } from "@/components/employees/EmployeesView";
import { useEmployeeForm } from "@/lib/hooks/useEmployeeForm";
import { useAreas } from "@/lib/hooks/useAreas";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { selectableOptions } from "@/lib/utils/catalog";
import { ErrorState } from "@/components/ui/ErrorState";
import { POSITION_LABELS, ROUTE_PATHS } from "@/lib/utils/constants";
import type { Employee, EmployeePosition } from "@/types/employee";

const POSITION_OPTIONS: EmployeePosition[] = ["lider", "recursos_humanos", "practicante"];

export function EmployeeCreateView() {
  const [createdEmployee, setCreatedEmployee] = useState<Employee | null>(null);

  if (createdEmployee) {
    return <CreatedPanel employee={createdEmployee} onAgain={() => setCreatedEmployee(null)} />;
  }

  return <CreateForm onCreated={setCreatedEmployee} />;
}

function CreateForm({ onCreated }: { onCreated: (employee: Employee) => void }) {
  const { values, isSubmitting, error, setField, submit } = useEmployeeForm({
    mode: "create",
    onSuccess: onCreated,
  });

  const { status: areasStatus, areas, error: areasError } = useAreas();
  const { status: statusesStatus, statuses, error: statusesError } = useStatuses();
  const [tried, setTried] = useState(false);

  const catalogsLoading = areasStatus === "loading" || statusesStatus === "loading";
  const catalogsError = areasStatus === "error" ? areasError : statusesStatus === "error" ? statusesError : null;

  const areaOptions = selectableOptions(areas, undefined);
  const statusOptions = selectableOptions(statuses, undefined);
  const selectedArea = areas.find((a) => a.id === values.area_id);
  const selectedStatus = statuses.find((s) => s.id === values.status_id);

  const nameValid = values.full_name.trim().split(/\s+/).filter(Boolean).length >= 2;
  const areaValid = !!values.area_id;
  const statusValid = !!values.status_id;
  const doneCount = [nameValid, areaValid, statusValid].filter(Boolean).length;

  const nameError = tried && !nameValid ? (values.full_name.trim() ? "Ingresa nombre y apellido." : "El nombre es obligatorio.") : undefined;
  const areaError = tried && !areaValid ? "Selecciona un área." : undefined;
  const statusError = tried && !statusValid ? "Selecciona un estado." : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTried(true);
    if (!nameValid || !areaValid || !statusValid) return;
    void submit(values);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[22px]">
      <header className="anim-up flex flex-wrap items-end justify-between gap-5">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-2.5">
          <Link href={ROUTE_PATHS.empleados} className="text-[11px] uppercase tracking-[.12em] text-[var(--accent-700)] hover:text-[#1a2b3b]">
            ← Empleados
          </Link>
          <h1 className="font-heading text-[42px] font-semibold uppercase leading-none">Nuevo empleado</h1>
        </div>
        <div className="flex gap-2.5">
          <Link
            href={ROUTE_PATHS.empleados}
            className="flex h-[38px] items-center whitespace-nowrap border border-[var(--accent)] px-4 text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || catalogsLoading}
            className="font-heading relative flex h-[38px] items-center whitespace-nowrap border border-[var(--accent)] bg-[var(--accent)] px-4 font-semibold text-[var(--bg)] hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)] disabled:opacity-45"
          >
            <Corners />
            {isSubmitting ? "Guardando…" : "Crear empleado"}
          </button>
        </div>
      </header>

      {error && <p className="text-[13px] text-[var(--accent-800)]">{error.message}</p>}

      <div className="flex flex-wrap items-start gap-[22px]">
        <div className="flex min-w-0 max-w-full flex-[999_1_560px] flex-col gap-[22px]">
          <section className="panel anim-up flex flex-col gap-[18px] px-[22px] py-5" style={{ animationDelay: ".1s" }}>
            <Corners />
            <div className="flex items-baseline gap-2.5">
              <span className="font-heading text-[13px] font-semibold text-[var(--accent-700)]">01</span>
              <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">Información</h2>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-5 gap-y-4">
              <div className="col-span-full">
                <label htmlFor="full_name" className="mb-[5px] block text-xs text-[rgba(29,31,32,.7)]">
                  Nombre completo *
                </label>
                <input
                  id="full_name"
                  value={values.full_name}
                  onChange={(event) => setField("full_name", event.target.value)}
                  placeholder="Nombres y apellidos"
                  autoFocus
                  autoComplete="off"
                  aria-invalid={!!nameError}
                  className={`input-ui w-full text-[15px] ${nameError ? "border-[var(--accent-800)]" : ""}`}
                />
                {nameError && <p className="mt-1 text-xs text-[var(--accent-800)]">{nameError}</p>}
              </div>

              <div>
                <label htmlFor="area_id" className="mb-[5px] block text-xs text-[rgba(29,31,32,.7)]">
                  Área *
                </label>
                <select
                  id="area_id"
                  value={values.area_id}
                  onChange={(event) => setField("area_id", event.target.value)}
                  disabled={catalogsLoading}
                  aria-invalid={!!areaError}
                  className={`input-ui w-full ${areaError ? "border-[var(--accent-800)]" : ""}`}
                >
                  <option value="" disabled>
                    Selecciona un área
                  </option>
                  {areaOptions.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
                {areaError && <p className="mt-1 text-xs text-[var(--accent-800)]">{areaError}</p>}
              </div>

              <div>
                <span className="mb-[5px] block text-xs text-[rgba(29,31,32,.7)]">Cargo *</span>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-1.5">
                  {POSITION_OPTIONS.map((position) => (
                    <OptionButton
                      key={position}
                      active={values.position === position}
                      onClick={() => setField("position", position)}
                      title={POSITION_LABELS[position]}
                    />
                  ))}
                </div>
              </div>
            </div>

            {catalogsError && <ErrorState message={catalogsError.message} />}
          </section>

          <section className="panel anim-up flex flex-col gap-[14px] px-[22px] py-5" style={{ animationDelay: ".2s" }}>
            <Corners />
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="font-heading text-[13px] font-semibold text-[var(--accent-700)]">02</span>
              <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">Estado</h2>
              <span className="text-xs text-[var(--neutral-700)]">Selecciona el Estado inicial del empleado.</span>
            </div>

            {statusesStatus === "success" && (
              <div role="radiogroup" aria-label="Estado inicial" className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-1.5">
                {statusOptions.map((statusOption) => (
                  <OptionButton
                    key={statusOption.id}
                    active={values.status_id === statusOption.id}
                    onClick={() => setField("status_id", statusOption.id)}
                    title={statusOption.name}
                  />
                ))}
              </div>
            )}
            {statusError && <p className="text-xs text-[var(--accent-800)]">{statusError}</p>}
          </section>
        </div>

        <aside className="panel anim-up flex max-w-full flex-[1_1_280px] flex-col gap-3.5 px-[22px] py-5 sm:sticky sm:top-7" style={{ animationDelay: ".3s" }}>
          <Corners />
          <span className="text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">Vista previa</span>
          <div className="flex items-center gap-3.5">
            <div className="panel font-heading grid h-14 w-14 flex-none place-items-center text-[22px] font-semibold text-[var(--accent-700)]">
              <Corners />
              {getInitials(values.full_name) || "—"}
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className={`font-heading text-xl font-semibold leading-tight ${values.full_name.trim() ? "" : "text-[var(--neutral-700)]"}`}>
                {values.full_name.trim() || "Nombre del empleado"}
              </span>
              <span className="truncate text-[13px] text-[var(--neutral-700)]">
                {POSITION_LABELS[values.position]} · {selectedArea?.name ?? "Área"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] bg-[var(--accent-100)] text-[var(--accent-800)]">
              {selectedStatus?.name ?? "Sin estado"}
            </span>
          </div>
          <div className="flex flex-col gap-2 border-t border-[var(--divider)] pt-3">
            <div className="flex justify-between text-xs tabular-nums text-[var(--neutral-700)]">
              <span>Campos obligatorios</span>
              <span>{doneCount} / 3</span>
            </div>
            <div className="h-[3px] bg-[var(--accent-100)]">
              <div className="h-full bg-[var(--accent)] transition-[width]" style={{ width: `${(doneCount / 3) * 100}%` }} />
            </div>
            {[
              ["Nombre y apellido", nameValid],
              ["Área", areaValid],
              ["Estado inicial", statusValid],
            ].map(([label, done]) => (
              <div key={label as string} className={`flex items-center gap-2.5 text-[13px] ${done ? "" : "text-[var(--neutral-700)]"}`}>
                <span className="grid h-3 w-3 flex-none place-items-center border border-[var(--accent)]">
                  <span className={`h-1.5 w-1.5 ${done ? "bg-[var(--accent)]" : ""}`} />
                </span>
                {label as string}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </form>
  );
}

function OptionButton({ active, onClick, title }: { active: boolean; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex items-center gap-3 border px-3 py-2.5 text-left transition-colors hover:bg-[var(--accent-100)] ${
        active ? "border-[var(--accent)] bg-[var(--accent-100)]" : "border-[var(--divider)]"
      }`}
    >
      <span className="grid h-3.5 w-3.5 flex-none place-items-center border border-[var(--accent)]">
        <span className={`h-2 w-2 ${active ? "bg-[var(--accent)]" : ""}`} />
      </span>
      <span className="flex-1 text-sm font-medium">{title}</span>
    </button>
  );
}

function CreatedPanel({ employee, onAgain }: { employee: Employee; onAgain: () => void }) {
  return (
    <div className="flex flex-col gap-[22px]">
      <Link href={ROUTE_PATHS.empleados} className="anim-up text-[11px] uppercase tracking-[.12em] text-[var(--accent-700)] hover:text-[#1a2b3b]">
        ← Empleados
      </Link>
      <section className="panel anim-up mx-auto flex w-full max-w-[560px] flex-col gap-5 px-8 py-8" style={{ animationDelay: ".1s" }}>
        <Corners />
        <span className="text-[11px] uppercase tracking-[.12em] text-[var(--accent-700)]">Empleado creado</span>

        <div className="flex items-center gap-[18px]">
          <div className="panel font-heading grid h-[72px] w-[72px] flex-none place-items-center text-[28px] font-semibold text-[var(--accent-700)]">
            <Corners />
            {getInitials(employee.full_name)}
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 className="font-heading text-[28px] font-semibold leading-none">{employee.full_name}</h2>
            <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-[var(--neutral-700)]">
              <span className="whitespace-nowrap">{POSITION_LABELS[employee.position]}</span>
              <span>·</span>
              <span className="whitespace-nowrap">{employee.area_name}</span>
              <span
                className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 text-[11px] ${
                  employee.is_active ? "bg-[var(--accent-100)] text-[var(--accent-800)]" : "bg-[#e3e3e5] text-[#3b3b3d]"
                }`}
              >
                <span className={`h-[7px] w-[7px] border border-[#6f93b8] ${employee.is_active ? "bg-[var(--accent)]" : ""}`} />
                {employee.status_name}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[var(--neutral-700)]">
          Aún no tiene horario asignado. Puedes asignarlo ahora desde Administrar horarios.
        </p>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`${ROUTE_PATHS.horarios}/administrar`}
            className="font-heading relative flex h-[38px] flex-1 items-center justify-center whitespace-nowrap border border-[var(--accent)] bg-[var(--accent)] px-4 font-semibold text-[var(--bg)] hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)]"
          >
            <Corners />
            Asignar horario →
          </Link>
          <button
            type="button"
            onClick={onAgain}
            className="flex h-[38px] flex-1 items-center justify-center whitespace-nowrap border border-[var(--accent)] px-4 text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)]"
          >
            Crear otro
          </button>
        </div>

        <Link href={`${ROUTE_PATHS.empleados}/${employee.id}`} className="text-center text-[13px] text-[var(--accent-700)] hover:text-[#1a2b3b]">
          Ver ficha del empleado →
        </Link>
      </section>
    </div>
  );
}
