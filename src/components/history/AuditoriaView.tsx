"use client";

import { useState } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { AuditDayGroup } from "@/components/history/AuditDayGroup";
import { AuditFiltersPanel } from "@/components/history/AuditFiltersPanel";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { PAGE_SIZE, useAuditFilters } from "@/lib/hooks/useAuditFilters";
import { useAuditLog } from "@/lib/hooks/useAuditLog";
import { AUDIT_CSV_HEADERS } from "@/lib/utils/audit";
import { downloadCsv } from "@/lib/utils/csv";
import { todayDayKey } from "@/lib/utils/date";

export function AuditoriaView() {
  const {
    filters,
    draftQuery,
    setDraftQuery,
    activePreset,
    serverFilters,
    hasFilters,
    isPending,
    setCategory,
    setActor,
    setFrom,
    setTo,
    setPeriod,
    toggleLogins,
    loadMore,
    reset,
  } = useAuditFilters();

  const {
    state,
    retry,
    resolveTarget,
    actorOptions,
    counts,
    hiddenLogins,
    days,
    filteredCount,
    visibleCount,
    actorCount,
    csvRows,
  } = useAuditLog(serverFilters, {
    query: filters.query,
    category: filters.category,
    actorId: filters.actorId,
    includeLogins: filters.includeLogins,
    limit: filters.limit,
    hasFilters,
  });

  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  function toggleRow(id: string) {
    setOpenRows((previous) => ({ ...previous, [id]: previous[id] !== true }));
  }

  function handleExport() {
    downloadCsv(`auditoria-${todayDayKey()}.csv`, AUDIT_CSV_HEADERS, csvRows());
  }

  const loaded = state.status === "success" || state.status === "empty";

  return (
    <div className="flex flex-col gap-[22px]" aria-busy={isPending}>
      <header className="anim-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">
            05 · Historial de cambios
          </p>
          <h1 className="font-heading mt-0.5 text-[42px] font-semibold uppercase leading-none">
            Auditoría
          </h1>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleExport}
          disabled={!loaded || filteredCount === 0}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 15V3" />
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="m7 10 5 5 5-5" />
          </svg>
          Exportar CSV
        </Button>
      </header>

      <AuditFiltersPanel
        filters={filters}
        draftQuery={draftQuery}
        activePreset={activePreset}
        counts={counts}
        actorOptions={actorOptions}
        onQueryChange={setDraftQuery}
        onCategoryChange={setCategory}
        onActorChange={setActor}
        onFromChange={setFrom}
        onToChange={setTo}
        onPeriodChange={setPeriod}
        onToggleLogins={toggleLogins}
      />

      <section
        className={`panel anim-up flex flex-col px-[22px] pb-5 pt-1.5 ${isPending ? "opacity-60 transition-opacity" : ""}`}
        style={{ animationDelay: ".1s" }}
      >
        <Corners />

        {state.status === "loading" && (
          <div className="py-9 text-center">
            <Spinner />
          </div>
        )}

        {state.status === "error" && <ErrorState message={state.error.message} onRetry={retry} />}

        {loaded && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <span className="text-[13px] tabular-nums text-[var(--neutral-700)]">
                {filteredCount} {filteredCount === 1 ? "evento" : "eventos"} · {actorCount}{" "}
                {actorCount === 1 ? "usuario" : "usuarios"}
              </span>
              {hiddenLogins > 0 && (
                <button
                  type="button"
                  onClick={toggleLogins}
                  className="text-xs text-[var(--accent-700)] hover:text-[var(--accent-800)]"
                >
                  {hiddenLogins} {hiddenLogins === 1 ? "inicio" : "inicios"} de sesión oculto
                  {hiddenLogins === 1 ? "" : "s"} · Mostrar
                </button>
              )}
            </div>

            {days.map((day) => (
              <AuditDayGroup
                key={day.dayKey}
                day={day}
                resolveTarget={resolveTarget}
                openRows={openRows}
                onToggle={toggleRow}
              />
            ))}

            {filteredCount === 0 && (
              <div className="flex flex-col items-center gap-2.5 py-10 text-center">
                <b className="font-heading text-[22px] font-semibold">
                  {hasFilters ? "Sin eventos para estos filtros" : "Todavía no hay eventos registrados"}
                </b>
                <span className="text-[13px] text-[var(--neutral-700)]">
                  {hasFilters
                    ? "Ampliá el periodo o quitá algún filtro."
                    : "El historial se va llenando a medida que se hacen cambios en el portal."}
                </span>
                {hasFilters && (
                  <Button type="button" variant="secondary" onClick={reset}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}

            {filteredCount > visibleCount && (
              <div className="flex items-center justify-center gap-3.5 pt-4">
                <span className="text-xs tabular-nums text-[var(--neutral-700)]">
                  Mostrando {visibleCount} de {filteredCount}
                </span>
                <Button type="button" variant="secondary" onClick={loadMore} disabled={isPending}>
                  {isPending ? "Cargando…" : `Cargar ${PAGE_SIZE} más`}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
