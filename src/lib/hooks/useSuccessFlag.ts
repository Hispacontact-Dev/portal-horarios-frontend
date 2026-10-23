"use client";

import { useState } from "react";

// Flag de éxito compartido por los editores del panel de administración — RF-1, RNF-1
// (specs/006-correcciones-panel-horarios-y-auditoria/plan.md sección 3.1). Visible hasta la
// próxima interacción (editar un campo o reintentar guardar), no por un temporizador.
export function useSuccessFlag() {
  const [visible, setVisible] = useState(false);

  function show(): void {
    setVisible(true);
  }

  function hide(): void {
    setVisible(false);
  }

  return { visible, show, hide };
}
