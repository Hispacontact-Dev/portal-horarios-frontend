"use client";

import { useState } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { RoleGate } from "@/components/auth/RoleGate";
import { PositionTable } from "@/components/positions/PositionTable";
import { PositionForm } from "@/components/positions/PositionForm";
import { DisableConfirmModal } from "@/components/catalog/DisableConfirmModal";
import { usePositions } from "@/lib/hooks/usePositions";
import { usePositionDisable } from "@/lib/hooks/useCatalogDisable";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Position } from "@/types/position";

export function CargosTab() {
  const { status, positions, error } = usePositions();
  const [localPositions, setLocalPositions] = useState<Position[] | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const displayedPositions = localPositions ?? positions;

  function upsertPosition(entry: Position) {
    const base = localPositions ?? positions;
    const exists = base.some((item) => item.id === entry.id);
    setLocalPositions(
      exists ? base.map((item) => (item.id === entry.id ? entry : item)) : [...base, entry]
    );
    if (editingPosition?.id === entry.id) setEditingPosition(null);
  }

  const catalogDisable = usePositionDisable(upsertPosition, upsertPosition);

  function handleSuccess(entry: Position) {
    upsertPosition(entry);
    setEditingPosition(null);
  }

  function handleEdit(entry: Position) {
    setEditingPosition(entry);
  }

  return (
    <div className="flex flex-col gap-[22px]">
      <section className="panel anim-up flex flex-col gap-3.5 px-5 py-[18px]" style={{ animationDelay: ".05s" }}>
        <Corners />
        <h2 className="font-heading text-[22px] font-semibold">Cargos</h2>
        <RoleGate>
          <PositionForm
            key={editingPosition?.id ?? "create"}
            mode={editingPosition ? "edit" : "create"}
            position={editingPosition ?? undefined}
            onSuccess={handleSuccess}
          />
        </RoleGate>
      </section>

      {status === "loading" && <Spinner />}
      {status === "error" && <ErrorState message={error.message} />}
      {status === "success" && displayedPositions.length === 0 && (
        <EmptyState message="No hay cargos registrados." />
      )}
      {status === "success" && displayedPositions.length > 0 && (
        <section className="panel anim-up overflow-x-auto" style={{ animationDelay: ".1s" }}>
          <Corners />
          <PositionTable
            positions={displayedPositions}
            onEdit={handleEdit}
            onDisable={catalogDisable.requestDisable}
            onEnable={catalogDisable.enable}
            actionsDisabled={catalogDisable.isSubmitting}
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
