"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { Corners } from "@/components/dashboard/Corners";
import { cn } from "@/lib/utils/cn";

interface DialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Ancho máximo del panel; por defecto el de un formulario corto. */
  className?: string;
}

// Panel del lenguaje visual blueprint sobre el `Modal` (que aporta el overlay, el
// cierre con Escape y el clic fuera).
export function Dialog({ isOpen, title, onClose, children, className }: DialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "panel anim-up flex w-[calc(100vw-32px)] flex-col gap-4 bg-[var(--bg)] px-[22px] py-5 shadow-[0_12px_40px_rgba(29,31,32,.22)]",
          className ?? "max-w-[480px]"
        )}
      >
        <Corners />
        <h3 className="font-heading text-2xl font-semibold">{title}</h3>
        {children}
      </div>
    </Modal>
  );
}
