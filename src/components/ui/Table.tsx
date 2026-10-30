import type { HTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type TableProps = HTMLAttributes<HTMLTableElement>;

// TODO: tabla genérica; las tablas por dominio (EmployeesView, UserTable, etc.) la envuelven.
export function Table({ className, ...props }: TableProps) {
  return <table className={cn("w-full text-left text-sm", className)} {...props} />;
}

type ThProps = ThHTMLAttributes<HTMLTableCellElement>;

// Cabecera de columna del lenguaje visual blueprint, para no repetir las mismas
// utilidades en cada <th> de las tablas por dominio.
export function Th({ className, ...props }: ThProps) {
  return (
    <th
      className={cn(
        "px-3 py-2 text-[11px] font-medium uppercase tracking-[.08em] text-[var(--neutral-700)]",
        className
      )}
      {...props}
    />
  );
}

type TrProps = HTMLAttributes<HTMLTableRowElement>;

// Fila de cabecera: el borde inferior más marcado que separa el thead del cuerpo.
export function TheadRow({ className, ...props }: TrProps) {
  return <tr className={cn("border-b border-[rgba(29,31,32,.35)]", className)} {...props} />;
}
