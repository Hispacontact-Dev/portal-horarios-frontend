"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";

interface RenameConfirmModalProps {
  isOpen: boolean;
  currentName: string;
  newName: string;
  isSubmitting: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RenameConfirmModal({
  isOpen,
  currentName,
  newName,
  isSubmitting,
  error,
  onConfirm,
  onCancel,
}: RenameConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm">
        <p className="text-sm">
          ¿Seguro que quieres renombrar a <strong>{currentName}</strong> por <strong>{newName}</strong>?
        </p>

        {error && <ErrorState message={error} />}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Confirmar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
