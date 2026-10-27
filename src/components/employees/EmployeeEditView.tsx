"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Corners } from "@/components/dashboard/Corners";
import { EmployeeScheduleSummary } from "@/components/employees/EmployeeScheduleSummary";
import { EmployeeStatusPanel } from "@/components/employees/EmployeeStatusPanel";
import { RenameConfirmModal } from "@/components/employees/RenameConfirmModal";
import { getInitials } from "@/components/employees/EmployeesView";
import { useEmployeeForm } from "@/lib/hooks/useEmployeeForm";
import { useAreas } from "@/lib/hooks/useAreas";
import { selectableOptions } from "@/lib/utils/catalog";
import { ErrorState } from "@/components/ui/ErrorState";
import { POSITION_LABELS, ROUTE_PATHS } from "@/lib/utils/constants";
import type { Employee, EmployeePosition } from "@/types/employee";

export function EmployeeEditView({
  employee,
  onEmployeeChange,
}: {
  employee: Employee;
  onEmployeeChange: (updated: Employee) => void;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const [pendingRename, setPendingRename] = useState<{ currentName: string; newName: string } | null>(null);

  const { status: areasStatus, areas, error: areasError } = useAreas();

  const { values, isSubmitting, error, setField, submit } = useEmployeeForm({
    mode: "edit",
    employeeId: employee.id,
    initialEmployee: employee,
    onSuccess: (updated) => {
      onEmployeeChange(updated);
      flash("Cambios guardados");
    },
  });

  const original = {
    full_name: employee.full_name,
    position: employee.position,
    area_id: employee.area_id,
  };
  const dirty =
    values.full_name !== original.full_name ||
    values.position !== original.position ||
    values.area_id !== original.area_id;
  const nameEmpty = !values.full_name.trim();
  const canSave = dirty && !nameEmpty && !isSubmitting;
  const areaOptions = selectableOptions(areas, employee.area_id);
  const areaName = areas.find((a) => a.id === values.area_id)?.name ?? employee.area_name;

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function flash(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  }

  function discard() {
    setField("full_name", original.full_name);
    setField("position", original.position);
    setField("area_id", original.area_id);
  }

  function handleSave() {
    const trimmedName = values.full_name.trim();
    if (trimmedName !== employee.full_name) {
      setPendingRename({ currentName: employee.full_name, newName: trimmedName });
      return;
    }
    submit(values);
  }

  function handleConfirmRename() {
    setPendingRename(null);
    submit({ ...values, full_name: values.full_name.trim() });
  }

  return (
    <>
      <header className="anim-up flex flex-wrap items-end justify-between gap-5">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-3">
          <Link href={ROUTE_PATHS.empleados} className="text-[11px] uppercase tracking-[.12em] text-[var(--accent-700)] hover:text-[#1a2b3b]">
            ← Empleados
          </Link>
          <div className="flex items-center gap-[18px]">
            <div className="panel font-heading grid h-[72px] w-[72px] flex-none place-items-center text-[28px] font-semibold text-[var(--accent-700)]">
              <Corners />
              {getInitials(values.full_name || employee.full_name)}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <h1 className="font-heading text-[42px] font-semibold uppercase leading-none">
                {values.full_name.trim() || employee.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-[var(--neutral-700)]">
                <span className="whitespace-nowrap">{POSITION_LABELS[values.position]}</span>
                <span>·</span>
                <span className="whitespace-nowrap">{areaName}</span>
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
        </div>
        <div className="flex gap-2.5">
          <Link
            href={ROUTE_PATHS.horarios}
            className="flex h-[38px] items-center whitespace-nowrap border border-[var(--accent)] px-4 text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)]"
          >
            Ver horarios
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="font-heading relative flex h-[38px] items-center whitespace-nowrap border border-[var(--accent)] bg-[var(--accent)] px-4 font-semibold text-[var(--bg)] hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)] disabled:opacity-45"
          >
            <Corners />
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-start gap-[22px]">
        <div className="flex min-w-0 max-w-full flex-[999_1_560px] flex-col gap-[22px]">
          <section className="panel anim-up flex flex-col gap-[18px] px-[22px] py-5" style={{ animationDelay: ".1s" }}>
            <Corners />
            <div className="flex items-baseline gap-2.5">
              <span className="font-heading text-[13px] font-semibold text-[var(--accent-700)]">01</span>
              <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">Información</h2>
              {dirty && <span className="anim-in ml-auto bg-[var(--accent-100)] px-2 py-0.5 text-[11px] text-[var(--accent-800)]">Sin guardar</span>}
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-5 gap-y-4">
              <div className="col-span-full">
                <label htmlFor="full_name" className="mb-[5px] block text-xs text-[rgba(29,31,32,.7)]">
                  Nombre completo
                </label>
                <input
                  id="full_name"
                  value={values.full_name}
                  onChange={(event) => setField("full_name", event.target.value)}
                  placeholder="Nombres y apellidos"
                  aria-invalid={nameEmpty}
                  className={`input-ui w-full text-[15px] ${nameEmpty ? "border-[var(--accent-800)]" : ""}`}
                />
                {nameEmpty && <p className="mt-1 text-xs text-[var(--accent-800)]">El nombre es obligatorio.</p>}
              </div>
              <div>
                <label htmlFor="position" className="mb-[5px] block text-xs text-[rgba(29,31,32,.7)]">
                  Cargo
                </label>
                <select
                  id="position"
                  value={values.position}
                  onChange={(event) => setField("position", event.target.value as EmployeePosition)}
                  className="input-ui w-full"
                >
                  <option value="lider">{POSITION_LABELS.lider}</option>
                  <option value="recursos_humanos">{POSITION_LABELS.recursos_humanos}</option>
                  <option value="practicante">{POSITION_LABELS.practicante}</option>
                </select>
              </div>
              <div>
                <label htmlFor="area_id" className="mb-[5px] block text-xs text-[rgba(29,31,32,.7)]">
                  Área
                </label>
                <select
                  id="area_id"
                  value={values.area_id}
                  onChange={(event) => setField("area_id", event.target.value)}
                  disabled={areasStatus === "loading"}
                  className="input-ui w-full"
                >
                  {areaOptions.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {areasStatus === "error" && <ErrorState message={areasError.message} />}
            {error && <p className="text-[13px] text-[var(--accent-800)]">{error.message}</p>}
          </section>

          <EmployeeScheduleSummary employeeId={employee.id} />
        </div>

        <EmployeeStatusPanel key={employee.status_id} employee={employee} onDone={onEmployeeChange} />
      </div>

      {dirty && (
        <div className="panel anim-up sticky bottom-5 flex items-center gap-4 self-center bg-[var(--bg)] py-2.5 pl-[18px] pr-3 shadow-[0_12px_32px_rgba(29,31,32,.18)]">
          <Corners />
          <span className="whitespace-nowrap text-[13px]">Tienes cambios sin guardar</span>
          <button type="button" onClick={discard} className="h-[34px] px-3 text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)]">
            Descartar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="font-heading relative h-[34px] border border-[var(--accent)] bg-[var(--accent)] px-4 font-semibold text-[var(--bg)] hover:bg-[var(--accent-600)] disabled:opacity-45"
          >
            <Corners />
            {isSubmitting ? "Guardando…" : "Guardar"}
          </button>
        </div>
      )}

      {toast && (
        <div className="panel anim-slide fixed bottom-7 right-7 flex items-center gap-3 bg-[var(--bg)] px-[18px] py-3.5 shadow-[0_12px_32px_rgba(29,31,32,.18)]">
          <Corners />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span className="text-sm">{toast}</span>
        </div>
      )}

      <RenameConfirmModal
        isOpen={pendingRename !== null}
        currentName={pendingRename?.currentName ?? ""}
        newName={pendingRename?.newName ?? ""}
        isSubmitting={isSubmitting}
        error={error?.message}
        onConfirm={handleConfirmRename}
        onCancel={() => setPendingRename(null)}
      />
    </>
  );
}
