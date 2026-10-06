"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ROUTE_PATHS, ROLE_LABELS } from "@/lib/utils/constants";
import type { Role } from "@/types/session";

const NAV = [
  { href: ROUTE_PATHS.dashboard, label: "Dashboard" },
  { href: ROUTE_PATHS.empleados, label: "Empleados" },
  { href: ROUTE_PATHS.horarios, label: "Horarios" },
  { href: ROUTE_PATHS.areas, label: "Áreas" },
  { href: ROUTE_PATHS.estados, label: "Estados" },
  { href: ROUTE_PATHS.usuarios, label: "Usuarios" },
  { href: ROUTE_PATHS.auditoria, label: "Auditoría" },
];

const ROLE_INITIALS: Record<Role, string> = {
  gestion_humana: "GH",
  lider: "LI",
};

export function Sidebar() {
  const path = usePathname();
  const { session, logout } = useAuth();

  return (
    <aside className="anim-in sticky top-0 flex h-screen flex-col gap-7 border-r border-[var(--divider)] px-[18px] py-[26px]">
      <div className="flex items-center gap-2.5 px-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h5" />
          <path d="M17.5 17.5 16 16.3V14" />
          <circle cx="16" cy="16" r="6" />
        </svg>
        <span className="font-heading whitespace-nowrap text-[15px] font-semibold uppercase tracking-[.08em]">
          Portal de Horarios
        </span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((it, i) => {
          const on = path.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-3 border-l-2 px-2.5 py-[9px] text-sm transition-colors hover:bg-[var(--accent-100)] ${
                on ? "border-[var(--accent)] bg-[var(--accent-100)] text-[var(--accent-800)]" : "border-transparent"
              }`}
            >
              <span className="text-[10px] tabular-nums tracking-[.1em] text-[#76767a]">
                {String(i + 1).padStart(2, "0")}
              </span>
              {it.label}
            </Link>
          );
        })}
      </nav>

      {session && (
        <div className="mt-auto flex items-center gap-2.5 border-t border-[var(--divider)] px-2 py-3">
          <div className="font-heading grid h-[34px] w-[34px] place-items-center border border-[var(--accent)] font-semibold text-[var(--accent-700)]">
            {ROLE_INITIALS[session.role]}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium">{ROLE_LABELS[session.role]}</span>
            <button
              type="button"
              onClick={() => logout()}
              className="w-fit text-[11px] text-[var(--neutral-700)] hover:text-[var(--accent-700)]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
