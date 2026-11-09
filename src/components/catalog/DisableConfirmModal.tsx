"use client";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";

interface DisableConfirmModalProps {
  isOpen: boolean;
  entryName: string;
  /** `null` cuando el catálogo no tiene forma de calcular empleados afectados todavía (ej. Cargos). */
  affectedCount: number | null;
  isSubmitting: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DisableConfirmModal({
  isOpen,
  entryName,
  affectedCount,
  isSubmitting,
  error,
  onConfirm,
  onCancel,
}: DisableConfirmModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title={`Deshabilitar «${entryName}»`}
      onClose={onCancel}
      className="max-w-[420px]"
    >
      <p className="text-sm text-[var(--neutral-700)]">
        {affectedCount === null
          ? "No es posible calcular cuántos empleados están afectados todavía."
          : affectedCount > 0
            ? `Hay ${affectedCount} empleado${affectedCount === 1 ? "" : "s"} asignado${
                affectedCount === 1 ? "" : "s"
              } que conservarán esta referencia.`
            : "No tiene empleados asignados actualmente."}
      </p>

      {error && <ErrorState message={error} />}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Deshabilitando..." : "Confirmar"}
        </Button>
      </div>
    </Dialog>
  );
}
