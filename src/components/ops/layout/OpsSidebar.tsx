"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/layout/Brand";
import { useAuth } from "@/lib/hooks/useAuth";
import { ROLE_LABELS } from "@/lib/utils/constants";
import { OPS_SECTIONS } from "@/lib/utils/ops/sections";
import type { Role } from "@/types/session";

const ROLE_INITIALS: Record<Role, string> = {
  gestion_humana: "GH",
  lider: "LI",
  planeacion: "PL",
};

// Menú propio del módulo: mismo lenguaje visual que el del portal de Junta Directiva, pero
// con sus propias entradas. Se copia el molde a propósito, no se comparte el componente.
export function OpsSidebar() {
  const path = usePathname();
  const { session, logout } = useAuth();

  return (
    <aside className="anim-in sticky top-0 flex h-screen flex-col gap-7 border-r border-[var(--divider)] px-[18px] py-[26px]">
      <Brand />

      <nav className="flex flex-col gap-0.5">
        {OPS_SECTIONS.map((it, i) => {
          const on = path.startsWith(it.path);
          return (
            <Link
              key={it.key}
              href={it.path}
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
