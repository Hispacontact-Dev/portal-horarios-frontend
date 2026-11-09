import Image from "next/image";

const LOGO_SRC = "/logo-hispacontact.svg";
// Proporción del lockup original (563×69 px): la altura se deriva del ancho pedido
// para que el logo nunca se deforme.
const LOGO_RATIO = 563 / 69;

/**
 * Lockup de marca: logo de la empresa arriba y el nombre del producto debajo,
 * separados por un hairline. Se usa en la esquina superior del sidebar y del login.
 */
export function Brand({ width = 180 }: { width?: number }) {
  return (
    <div className="flex flex-col gap-2 px-2">
      <Image
        src={LOGO_SRC}
        alt="Hispacontact"
        width={width}
        height={Math.round(width / LOGO_RATIO)}
        priority
        unoptimized
      />
      <span className="font-heading border-t border-[var(--divider)] pt-2 text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">
        Portal de Horarios
      </span>
    </div>
  );
}
