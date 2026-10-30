"use client";

import { useEffect, type MouseEvent, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function stopPropagation(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
  }

  return (
    <div
      role="presentation"
      className="anim-in fixed inset-0 z-20 flex items-center justify-center bg-[rgba(29,31,32,.45)] p-4"
      onClick={onClose}
    >
      <div onClick={stopPropagation}>{children}</div>
    </div>
  );
}
