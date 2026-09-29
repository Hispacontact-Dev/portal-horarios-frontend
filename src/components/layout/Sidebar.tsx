import Link from "next/link";
import { ROUTE_PATHS } from "@/lib/utils/constants";

const NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: ROUTE_PATHS.dashboard, label: "Inicio" },
  { href: ROUTE_PATHS.empleados, label: "Empleados" },
  { href: ROUTE_PATHS.areas, label: "Áreas" },
  { href: ROUTE_PATHS.estados, label: "Estados" },
  { href: ROUTE_PATHS.usuarios, label: "Usuarios" },
  { href: ROUTE_PATHS.auditoria, label: "Auditoría" },
  { href: ROUTE_PATHS.horarios, label: "Horarios" },
];

export function Sidebar() {
  return (
    <nav className="flex w-56 flex-col gap-1 border-r p-4">
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className="rounded px-2 py-1 text-sm">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
