"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Corners } from "@/components/dashboard/Corners";

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
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="panel anim-up flex w-full max-w-[420px] flex-col gap-3.5 px-5 py-5">
        <Corners />
        <h3 className="font-heading text-xl font-semibold">Deshabilitar «{entryName}»</h3>
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
      </div>
    </Modal>
  );
}
