"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Corners } from "@/components/dashboard/Corners";

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
      <div className="panel anim-up flex w-full max-w-[420px] flex-col gap-3.5 px-5 py-5">
        <Corners />
        <h3 className="font-heading text-xl font-semibold">Renombrar</h3>
        <p className="text-sm text-[var(--neutral-700)]">
          ¿Seguro que quieres renombrar a <strong className="text-[var(--text)]">{currentName}</strong> por{" "}
          <strong className="text-[var(--text)]">{newName}</strong>?
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
