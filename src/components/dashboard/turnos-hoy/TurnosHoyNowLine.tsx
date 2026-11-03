"use client";

import { useNowTick } from "@/lib/hooks/useNowTick";
import { nowLineFraction } from "@/lib/utils/scheduleLayout";
import { nowAsDecimalHour } from "@/lib/utils/scheduleStatus";

export function TurnosHoyNowLine() {
  const now = useNowTick();
  if (!now) return null;

  const frac = nowLineFraction(nowAsDecimalHour(now));
  if (frac === null) return null;

  const label = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });

  // Cerca de los extremos la etiqueta se alinea hacia adentro para no desbordar el panel.
  const shift = frac < 0.08 ? "0" : frac > 0.92 ? "-100%" : "-50%";

  return (
    <div
      aria-hidden="true"
      className="anim-in pointer-events-none absolute inset-y-0 z-10 border-l border-dashed border-[var(--accent-700)]"
      style={{
        // La franja empieza después de la columna de nombres Y del gap de la rejilla: sin
        // sumar el gap, la línea quedaba corrida respecto de las barras.
        left: `calc(var(--thy-name-col) + var(--thy-gap) + (100% - var(--thy-name-col) - var(--thy-gap)) * ${frac})`,
        animationDelay: "1s",
      }}
    >
      {/* `sticky` para que la hora siga visible sobre la regla al desplazar la lista.
          `w-max` porque la línea mide 0 px de ancho: sin eso el fondo no cubriría el texto. */}
      <span
        className="sticky top-0 block w-max rounded bg-[var(--accent-700)] px-1 py-0.5 text-[10px] font-medium leading-4 text-[var(--bg)]"
        style={{ transform: `translateX(${shift})` }}
      >
        {label}
      </span>
    </div>
  );
}
