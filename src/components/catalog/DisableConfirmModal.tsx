"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";

interface DisableConfirmModalProps {
  isOpen: boolean;
  entryName: string;
  affectedCount: number;
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
      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm">
        <p className="text-sm">
          ¿Deshabilitar <strong>{entryName}</strong>?{" "}
          {affectedCount > 0
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
