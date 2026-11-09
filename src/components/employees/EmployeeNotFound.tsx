import Link from "next/link";
import { ROUTE_PATHS } from "@/lib/utils/constants";

export function EmployeeNotFound() {
  return (
    <div className="flex flex-col items-start gap-3 py-12">
      <h1 className="font-heading text-[42px] font-semibold uppercase leading-none">Empleado no encontrado</h1>
      <Link href={ROUTE_PATHS.empleados} className="text-sm text-[var(--accent-700)] hover:text-[var(--accent-800)]">
        ← Volver a Empleados
      </Link>
    </div>
  );
}
