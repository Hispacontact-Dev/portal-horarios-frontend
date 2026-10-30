"use client";

import { useState } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { RoleGate } from "@/components/auth/RoleGate";
import { HolidayForm } from "@/components/holidays/HolidayForm";
import { HolidayTable } from "@/components/holidays/HolidayTable";
import { useHolidays } from "@/lib/hooks/useHolidays";
import {
  useDeleteHoliday,
  useImportNationalHolidays,
  useToggleHolidayBlocksShifts,
} from "@/lib/hooks/useHolidayActions";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Holiday } from "@/types/holiday";

export function FestivosTab() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { state, retry } = useHolidays(year);
  const [localHolidays, setLocalHolidays] = useState<Holiday[] | null>(null);

  const toggleAction = useToggleHolidayBlocksShifts();
  const deleteAction = useDeleteHoliday();
  const importAction = useImportNationalHolidays();

  const baseHolidays = state.status === "success" || state.status === "empty" ? state.data : [];
  const displayedHolidays = localHolidays ?? baseHolidays;

  function upsertHoliday(entry: Holiday) {
    // Forma de updater (no lee `localHolidays` del closure) porque una importación puede llamar
    // esto varias veces en el mismo tick — leer el closure perdería todas las entradas menos la última.
    setLocalHolidays((current) => {
      const base = current ?? baseHolidays;
      const exists = base.some((item) => item.date === entry.date);
      return exists ? base.map((item) => (item.date === entry.date ? entry : item)) : [...base, entry];
    });
  }

  function removeHoliday(date: string) {
    setLocalHolidays((current) => (current ?? baseHolidays).filter((item) => item.date !== date));
  }

  async function handleToggle(holiday: Holiday) {
    const result = await toggleAction.submit({ date: holiday.date, blocksShifts: !holiday.blocks_shifts });
    if (result) upsertHoliday(result);
  }

  async function handleDelete(holiday: Holiday) {
    const deletedDate = await deleteAction.submit(holiday.date);
    if (deletedDate) removeHoliday(deletedDate);
  }

  async function handleImport() {
    const result = await importAction.submit(year);
    if (result) {
      result.imported.forEach(upsertHoliday);
    }
  }

  const actionsDisabled = toggleAction.state.status === "submitting" || deleteAction.state.status === "submitting";

  return (
    <div className="flex flex-col gap-[22px]">
      <section className="panel anim-up flex flex-col gap-3.5 px-5 py-[18px]" style={{ animationDelay: ".05s" }}>
        <Corners />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-[22px] font-semibold">Festivos {year}</h2>
          <div className="flex border border-[var(--divider)]">
            {[year - 1, year, year + 1].map((y) => (
              <button
                key={y}
                type="button"
                aria-pressed={y === year}
                onClick={() => {
                  setYear(y);
                  setLocalHolidays(null);
                }}
                className={`h-9 px-3.5 text-[13px] ${y === year ? "bg-[var(--accent)] text-[var(--bg)]" : "hover:bg-[var(--accent-100)]"}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <RoleGate>
          <HolidayForm year={year} onSuccess={upsertHoliday} />
        </RoleGate>
      </section>

      {state.status === "loading" && <Spinner />}
      {state.status === "error" && <ErrorState message={state.error.message} onRetry={retry} />}

      {(state.status === "success" || state.status === "empty") && displayedHolidays.length === 0 && (
        <section className="panel anim-up flex flex-col items-center gap-3 px-5 py-9 text-center" style={{ animationDelay: ".1s" }}>
          <Corners />
          <EmptyState message="Todavía no hay festivos cargados para este año." />
          <RoleGate>
            <Button
              type="button"
              variant="secondary"
              onClick={handleImport}
              disabled={importAction.state.status === "submitting"}
            >
              {importAction.state.status === "submitting" ? "Importando..." : "Importar festivos nacionales"}
            </Button>
          </RoleGate>
        </section>
      )}

      {(state.status === "success" || state.status === "empty") && displayedHolidays.length > 0 && (
        <section className="panel anim-up flex flex-col gap-3.5 overflow-x-auto px-5 py-[18px]" style={{ animationDelay: ".1s" }}>
          <Corners />
          <HolidayTable
            holidays={displayedHolidays}
            onToggleBlocksShifts={handleToggle}
            onDelete={handleDelete}
            actionsDisabled={actionsDisabled}
          />
          <RoleGate>
            <Button
              type="button"
              variant="secondary"
              onClick={handleImport}
              disabled={importAction.state.status === "submitting"}
              className="self-start"
            >
              {importAction.state.status === "submitting" ? "Importando..." : "Importar festivos nacionales"}
            </Button>
          </RoleGate>
        </section>
      )}

      {toggleAction.state.status === "error" && <ErrorState message={toggleAction.state.error.message} />}
      {deleteAction.state.status === "error" && <ErrorState message={deleteAction.state.error.message} />}
      {importAction.state.status === "error" && <ErrorState message={importAction.state.error.message} />}
    </div>
  );
}
