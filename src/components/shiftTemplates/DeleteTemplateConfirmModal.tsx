"use client";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";

interface DeleteTemplateConfirmModalProps {
  isOpen: boolean;
  templateName: string;
  isSubmitting: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

// Eliminar una plantilla no se puede deshacer: el documento desaparece del backend y solo queda
// la entrada de Auditoría. Por eso la acción pasa por confirmación, a diferencia de los Festivos.
export function DeleteTemplateConfirmModal({
  isOpen,
  templateName,
  isSubmitting,
  error,
  onConfirm,
  onCancel,
}: DeleteTemplateConfirmModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title={`Eliminar «${templateName}»`}
      onClose={onCancel}
      className="max-w-[420px]"
    >
      <p className="text-sm text-[var(--neutral-700)]">
        La plantilla se elimina de forma permanente. Los horarios ya asignados no cambian.
      </p>

      {error && <ErrorState message={error} />}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>
    </Dialog>
  );
}
