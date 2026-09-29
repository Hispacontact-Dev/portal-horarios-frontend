import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

// TODO: implementar overlay, foco atrapado y cierre con Escape.
export function Modal({ isOpen, children }: ModalProps) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 flex items-center justify-center">{children}</div>;
}
