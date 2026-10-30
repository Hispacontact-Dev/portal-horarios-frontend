"use client";

import { useState } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { RoleGate } from "@/components/auth/RoleGate";
import { AreaTable } from "@/components/areas/AreaTable";
import { AreaForm } from "@/components/areas/AreaForm";
import { DisableConfirmModal } from "@/components/catalog/DisableConfirmModal";
import { useAreas } from "@/lib/hooks/useAreas";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { useAreaDisable } from "@/lib/hooks/useCatalogDisable";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Area } from "@/types/area";

export function AreasTab() {
  const { status, areas, error } = useAreas();
  const { status: employeesStatus, employees } = useEmployees();
  const [localAreas, setLocalAreas] = useState<Area[] | null>(null);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const displayedAreas = localAreas ?? areas;

  function upsertArea(area: Area) {
    const base = localAreas ?? areas;
    const exists = base.some((entry) => entry.id === area.id);
    setLocalAreas(
      exists ? base.map((entry) => (entry.id === area.id ? area : entry)) : [...base, area]
    );
    if (editingArea?.id === area.id) setEditingArea(null);
  }

  const catalogDisable = useAreaDisable(employees, upsertArea, upsertArea);

  function handleSuccess(area: Area) {
    upsertArea(area);
    setEditingArea(null);
  }

  function handleEdit(area: Area) {
    setEditingArea(area);
  }

  return (
    <div className="flex flex-col gap-[22px]">
      <section className="panel anim-up flex flex-col gap-3.5 px-5 py-[18px]" style={{ animationDelay: ".05s" }}>
        <Corners />
        <h2 className="font-heading text-[22px] font-semibold">Áreas</h2>
        <RoleGate>
          <AreaForm
            key={editingArea?.id ?? "create"}
            mode={editingArea ? "edit" : "create"}
            area={editingArea ?? undefined}
            onSuccess={handleSuccess}
          />
        </RoleGate>
      </section>

      {status === "loading" && <Spinner />}
      {status === "error" && <ErrorState message={error.message} />}
      {status === "success" && displayedAreas.length === 0 && (
        <EmptyState message="No hay áreas registradas." />
      )}
      {status === "success" && displayedAreas.length > 0 && (
        <section className="panel anim-up overflow-x-auto" style={{ animationDelay: ".1s" }}>
          <Corners />
          <AreaTable
            areas={displayedAreas}
            onEdit={handleEdit}
            onDisable={catalogDisable.requestDisable}
            onEnable={catalogDisable.enable}
            actionsDisabled={catalogDisable.isSubmitting || employeesStatus === "loading"}
          />
        </section>
      )}

      {!catalogDisable.pendingEntry && catalogDisable.error && (
        <ErrorState message={catalogDisable.error.message} />
      )}

      <DisableConfirmModal
        isOpen={catalogDisable.pendingEntry !== null}
        entryName={catalogDisable.pendingEntry?.name ?? ""}
        affectedCount={catalogDisable.affectedCount}
        isSubmitting={catalogDisable.isSubmitting}
        error={catalogDisable.pendingEntry ? catalogDisable.error?.message ?? null : null}
        onConfirm={catalogDisable.confirmDisable}
        onCancel={catalogDisable.cancelDisable}
      />
    </div>
  );
}
