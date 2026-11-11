"use client";

import { Corners } from "@/components/dashboard/Corners";
import { Button } from "@/components/ui/Button";
import { SESSION_END_COPY, type SessionEndReason } from "@/lib/session/session-end";

interface SessionExpiredModalProps {
  reason: SessionEndReason;
  onConfirm: () => void;
}

// No reusa `ui/Modal` a propósito: ese cierra con Escape y con clic fuera, y acá la sesión ya
// está cerrada — el único camino posible es volver a iniciarla.
export function SessionExpiredModal({ reason, onConfirm }: SessionExpiredModalProps) {
  const { title, body } = SESSION_END_COPY[reason];

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      className="anim-in fixed inset-0 z-50 grid place-items-center bg-[rgba(29,31,32,.55)] p-4 backdrop-blur-sm"
    >
      <div className="panel anim-up flex w-full max-w-[480px] flex-col items-center gap-4 bg-[var(--bg)] px-8 py-9 text-center shadow-[0_12px_40px_rgba(29,31,32,.22)]">
        <Corners />

        <h2
          id="session-expired-title"
          className="font-heading text-[34px] font-semibold leading-tight"
        >
          {title}
        </h2>

        <p className="text-sm leading-relaxed text-[var(--neutral-700)]">{body}</p>

        <Button type="button" onClick={onConfirm} autoFocus className="mt-1 w-full">
          Iniciar sesión de nuevo
        </Button>
      </div>
    </div>
  );
}
