"use client";

import { useState } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { RoleGate } from "@/components/auth/RoleGate";
import { HolidayForm } from "@/components/holidays/HolidayForm";
import { HolidayList } from "@/components/holidays/HolidayList";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useHolidays } from "@/lib/hooks/useHolidays";
import {
  useDeleteHoliday,
  useImportNationalHolidays,
  useToggleHolidayBlocksShifts,
} from "@/lib/hooks/useHolidayActions";
import { useNowTick } from "@/lib/hooks/useNowTick";
import { useToast } from "@/lib/hooks/useToast";
import type { Holiday } from "@/types/holiday";

// `en-CA` formatea como YYYY-MM-DD, el mismo formato con el que viaja la fecha.
function toIsoDate(value: Date): string {
  return value.toLocaleDateString("en-CA");
}

export function FestivosTab() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { state, retry } = useHolidays(year);
  const [localHolidays, setLocalHolidays] = useState<Holiday[] | null>(null);
  const toast = useToast();

  // `null` en el primer render: evita que servidor y cliente calculen un "hoy"
  // distinto y rompan la hidratación.
  const now = useNowTick(60_000);
  const today = now === null ? null : toIsoDate(now);

  const toggleAction = useToggleHolidayBlocksShifts();
  const deleteAction = useDeleteHoliday();
  const importAction = useImportNationalHolidays();

  const baseHolidays = state.status === "success" || state.status === "empty" ? state.data : [];
  const holidays = localHolidays ?? baseHolidays;

  function upsertHoliday(entry: Holiday) {
    // Forma de updater (no lee `localHolidays` del closure) porque una importación
    // puede llamar esto varias veces en el mismo tick — leer el closure perdería
    // todas las entradas menos la última.
    setLocalHolidays((current) => {
      const base = current ?? baseHolidays;
      const exists = base.some((item) => item.date === entry.date);
      return exists ? base.map((item) => (item.date === entry.date ? entry : item)) : [...base, entry];
    });
  }

  function removeHoliday(date: string) {
    setLocalHolidays((current) => (current ?? baseHolidays).filter((item) => item.date !== date));
  }

  async function handleCreated(entry: Holiday) {
    upsertHoliday(entry);
    toast.show(`«${entry.name}» agregado`);
  }

  async function handleToggle(holiday: Holiday) {
    const result = await toggleAction.submit({
      date: holiday.date,
      blocksShifts: !holiday.blocks_shifts,
    });
    if (!result) return;
    upsertHoliday(result);
    toast.show(result.blocks_shifts ? "El día bloquea turnos" : "El día queda laborable");
  }

  async function handleDelete(holiday: Holiday) {
    const deletedDate = await deleteAction.submit(holiday.date);
    if (!deletedDate) return;
    removeHoliday(deletedDate);
    toast.show(`«${holiday.name}» eliminado`);
  }

  async function handleImport() {
    const result = await importAction.submit(year);
    if (!result) return;
    result.imported.forEach(upsertHoliday);
    toast.show(
      result.imported.length === 0
        ? "No había festivos nuevos para importar"
        : `${result.imported.length} festivos importados`
    );
  }

  const isImporting = importAction.state.status === "submitting";
  const actionsDisabled =
    toggleAction.state.status === "submitting" || deleteAction.state.status === "submitting";

  return (
    <section className="panel anim-up flex flex-col gap-[18px] px-[22px] py-5">
      <Corners />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold">Festivos {year}</h2>
          <span className="text-[13px] text-[var(--neutral-700)]">
            Los días que bloquean turnos quedan marcados en Horarios y no admiten asignación.
          </span>
        </div>
        <div className="flex border border-[var(--divider)]">
          {[year - 1, year, year + 1].map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={option === year}
              onClick={() => {
                setYear(option);
                setLocalHolidays(null);
              }}
              className={`h-9 px-3.5 text-[13px] tabular-nums ${
                option === year
                  ? "bg-[var(--accent)] text-[var(--bg)]"
                  : "text-[var(--neutral-700)] hover:bg-[var(--accent-100)]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <RoleGate>
        <HolidayForm
          key={year}
          year={year}
          takenDates={holidays.map((entry) => entry.date)}
          onSuccess={handleCreated}
        />
      </RoleGate>

      {state.status === "loading" && <Spinner />}
      {state.status === "error" && <ErrorState message={state.error.message} onRetry={retry} />}

      {(state.status === "success" || state.status === "empty") && holidays.length === 0 && (
        <div className="flex flex-col items-center gap-2.5 py-9 text-center">
          <b className="font-heading text-[22px] font-semibold">Sin festivos cargados</b>
          <span className="text-[13px] text-[var(--neutral-700)]">
            Importá los festivos nacionales y agregá a mano los días de la empresa.
          </span>
          <RoleGate>
            <Button type="button" variant="secondary" onClick={handleImport} disabled={isImporting}>
              {isImporting ? "Importando..." : "Importar festivos nacionales"}
            </Button>
          </RoleGate>
        </div>
      )}

      {(state.status === "success" || state.status === "empty") && holidays.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <HolidayList
              holidays={holidays}
              today={today}
              onToggleBlocksShifts={handleToggle}
              onDelete={handleDelete}
              actionsDisabled={actionsDisabled}
            />
          </div>
          <RoleGate>
            <Button
              type="button"
              variant="secondary"
              onClick={handleImport}
              disabled={isImporting}
              className="self-start"
            >
              {isImporting ? "Importando..." : "Importar festivos nacionales"}
            </Button>
          </RoleGate>
        </>
      )}

      <span className="text-[11px] leading-relaxed text-[var(--neutral-700)]">
        Un festivo nacional no se puede eliminar, solo marcarlo como laborable. Los días de la
        empresa sí se eliminan.
      </span>

      {toggleAction.state.status === "error" && (
        <ErrorState message={toggleAction.state.error.message} />
      )}
      {deleteAction.state.status === "error" && (
        <ErrorState message={deleteAction.state.error.message} />
      )}
      {importAction.state.status === "error" && (
        <ErrorState message={importAction.state.error.message} />
      )}

      {toast.message && <Toast message={toast.message} />}
    </section>
  );
}
