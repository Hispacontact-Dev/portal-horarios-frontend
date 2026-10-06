"use client";

import { useState } from "react";
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

export default function AreasPage() {
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
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Áreas</h1>
      <RoleGate>
        <AreaForm
          key={editingArea?.id ?? "create"}
          mode={editingArea ? "edit" : "create"}
          area={editingArea ?? undefined}
          onSuccess={handleSuccess}
        />
      </RoleGate>

      {status === "loading" && <Spinner />}
      {status === "error" && <ErrorState message={error.message} />}
      {status === "success" && displayedAreas.length === 0 && (
        <EmptyState message="No hay áreas registradas." />
      )}
      {status === "success" && displayedAreas.length > 0 && (
        <AreaTable
          areas={displayedAreas}
          onEdit={handleEdit}
          onDisable={catalogDisable.requestDisable}
          onEnable={catalogDisable.enable}
          actionsDisabled={catalogDisable.isSubmitting || employeesStatus === "loading"}
        />
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
