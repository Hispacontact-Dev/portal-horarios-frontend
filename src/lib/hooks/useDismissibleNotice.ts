"use client";

import { useEffect, useState } from "react";

// Aviso descartable respaldado por sessionStorage, respetando "esta sesión del navegador" — RF-2
// (specs/006-correcciones-panel-horarios-y-auditoria/plan.md sección 3.3). El valor inicial es
// `false` y se corrige en un efecto al montar: `/horarios/administrar` se prerenderiza como
// contenido estático, y leer `sessionStorage` durante ese render de servidor rompería el build.
export function useDismissibleNotice(key: string) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.sessionStorage.getItem(key) !== "true");
  }, [key]);

  function dismiss(): void {
    window.sessionStorage.setItem(key, "true");
    setVisible(false);
  }

  return { visible, dismiss };
}
