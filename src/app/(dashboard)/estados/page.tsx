"use client";

import { useState } from "react";
import { RoleGate } from "@/components/auth/RoleGate";
import { StatusTable } from "@/components/statuses/StatusTable";
import { StatusForm } from "@/components/statuses/StatusForm";
import { DisableConfirmModal } from "@/components/catalog/DisableConfirmModal";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { useStatusDisable } from "@/lib/hooks/useCatalogDisable";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Status } from "@/types/status";

export default function EstadosPage() {
  const { status, statuses, error } = useStatuses();
  const { status: employeesStatus, employees } = useEmployees();
  const [localStatuses, setLocalStatuses] = useState<Status[] | null>(null);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const displayedStatuses = localStatuses ?? statuses;

  function upsertStatus(entry: Status) {
    const base = localStatuses ?? statuses;
    const exists = base.some((item) => item.id === entry.id);
    setLocalStatuses(
      exists ? base.map((item) => (item.id === entry.id ? entry : item)) : [...base, entry]
    );
    if (editingStatus?.id === entry.id) setEditingStatus(null);
  }

  const catalogDisable = useStatusDisable(employees, upsertStatus, upsertStatus);

  function handleSuccess(entry: Status) {
    upsertStatus(entry);
    setEditingStatus(null);
  }

  function handleEdit(entry: Status) {
    setEditingStatus(entry);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Estados</h1>
      <RoleGate>
        <StatusForm
          key={editingStatus?.id ?? "create"}
          mode={editingStatus ? "edit" : "create"}
          status={editingStatus ?? undefined}
          onSuccess={handleSuccess}
        />
      </RoleGate>

      {status === "loading" && <Spinner />}
      {status === "error" && <ErrorState message={error.message} />}
      {status === "success" && displayedStatuses.length === 0 && (
        <EmptyState message="No hay estados registrados." />
      )}
      {status === "success" && displayedStatuses.length > 0 && (
        <StatusTable
          statuses={displayedStatuses}
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
