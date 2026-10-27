"use client";

import { useEffect, useState } from "react";

// Reloj de UI recalculado periódicamente, solo en cliente — evita error de hidratación SSR
// (el servidor y el navegador verían horas distintas si se calculara en el primer render).
export function useNowTick(intervalMs = 30_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
