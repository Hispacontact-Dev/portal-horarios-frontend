"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Corners } from "@/components/dashboard/Corners";
import { TurnosHoy, type Turno } from "@/components/dashboard/TurnosHoy";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { useAreas } from "@/lib/hooks/useAreas";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { useHistory } from "@/lib/hooks/useHistory";
import { ENTITY_TYPE_LABELS } from "@/lib/utils/constants";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";

// Sin backend de Horarios todavía (AGENTS.md) — ver placeholder dentro de TurnosHoy.
const TURNOS: Turno[] = [];

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function DashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { status: employeesStatus, employees, error: employeesError } = useEmployees();
  const { status: areasStatus, areas, error: areasError } = useAreas();
  const { status: statusesStatus, statuses, error: statusesError } = useStatuses();
  const { status: historyStatus, entries, error: historyError } = useHistory();

  const fecha = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/empleados?q=${encodeURIComponent(query)}` : "/empleados");
  }

  const kpis = [
    {
      label: "Empleados",
      value: employeesStatus === "success" ? String(employees.length) : "—",
      sub: employeesStatus === "success" ? `activos: ${employees.filter((e) => e.is_active).length}` : "",
    },
    {
      label: "Áreas habilitadas",
      value: areasStatus === "success" ? String(areas.filter((a) => a.is_enabled).length) : "—",
      sub: areasStatus === "success" ? `/ ${areas.length}` : "",
    },
    {
      label: "Estados habilitados",
      value: statusesStatus === "success" ? String(statuses.filter((s) => s.is_enabled).length) : "—",
      sub: statusesStatus === "success" ? `/ ${statuses.length}` : "",
    },
    {
      label: "Eventos de auditoría",
      value: historyStatus === "success" ? String(entries.length) : "—",
      sub: "recientes",
    },
  ];

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
    .slice(0, 6);

  return (
    <>
      <header className="anim-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">{fecha}</p>
          <h1 className="font-heading mt-0.5 text-[42px] font-semibold uppercase leading-none">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <form onSubmit={handleSearch}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar empleado…"
              className="min-h-[38px] w-[240px] border border-[var(--divider)] bg-[#e9e9ea] px-2.5 text-sm outline-none hover:border-[rgba(29,31,32,.45)] focus-visible:border-[var(--accent)]"
            />
          </form>
          <Link
            href="/horarios"
            className="font-heading relative flex h-[38px] items-center whitespace-nowrap border border-[var(--accent)] bg-[var(--accent)] px-4 font-semibold text-[var(--bg)] hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)]"
          >
            <Corners />+ Nuevo horario
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 border border-[var(--divider)] lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className="anim-up border-r border-[var(--divider)] px-5 py-4 last:border-r-0"
            style={{ animationDelay: `${0.1 + i * 0.07}s` }}
          >
            <p className="whitespace-nowrap text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">
              {k.label}
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-heading text-[44px] font-semibold leading-none">{k.value}</span>
              <span className="whitespace-nowrap text-[13px] text-[var(--neutral-700)]">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {(employeesStatus === "error" || areasStatus === "error" || statusesStatus === "error") && (
        <ErrorState
          message={employeesError?.message ?? areasError?.message ?? statusesError?.message ?? "Error inesperado"}
        />
      )}

      <div className="grid flex-1 gap-[22px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <TurnosHoy turnos={TURNOS} />

        <section className="panel anim-up flex flex-col gap-1.5 px-5 py-[18px]" style={{ animationDelay: ".4s" }}>
          <Corners />
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">Auditoría</h2>
            <Link href="/auditoria" className="whitespace-nowrap text-[13px] text-[var(--accent-700)] hover:text-[var(--accent-800)]">
              Todo →
            </Link>
          </div>

          {historyStatus === "loading" && <Spinner />}
          {historyStatus === "error" && <ErrorState message={historyError.message} />}
          {historyStatus === "success" && recentEntries.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--neutral-700)]">No hay actividad registrada todavía.</p>
          )}
          {historyStatus === "success" &&
            recentEntries.map((entry, i) => (
              <div
                key={entry.id}
                className="anim-up grid grid-cols-[44px_minmax(0,1fr)] gap-2.5 border-t border-[var(--divider)] py-2.5"
                style={{ animationDelay: `${0.5 + i * 0.07}s` }}
              >
                <span className="text-xs tabular-nums text-[var(--neutral-700)]">{formatTime(entry.occurred_at)}</span>
                <span className="text-[13px] leading-snug">
                  <b className="font-medium">{entry.actor_name}</b> {entry.action} · {ENTITY_TYPE_LABELS[entry.entity_type]}
                </span>
              </div>
            ))}
        </section>
      </div>
    </>
  );
}
