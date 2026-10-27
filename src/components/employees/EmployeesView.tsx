"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { RoleGate } from "@/components/auth/RoleGate";
import { EmployeeStatusBadge } from "@/components/employees/EmployeeStatusBadge";
import { EmployeeDetail } from "@/components/employees/EmployeeDetail";
import { downloadCsv } from "@/lib/utils/csv";
import { POSITION_LABELS, ROUTE_PATHS } from "@/lib/utils/constants";
import type { Employee } from "@/types/employee";

const PER_PAGE = 10;
type ActiveFilter = "todos" | "activos" | "inactivos";

const ACTIVE_FILTERS: ActiveFilter[] = ["todos", "activos", "inactivos"];

export const getInitials = (name: string | null | undefined) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

function exportToCsv(employees: Employee[]) {
  downloadCsv(
    "empleados.csv",
    ["Nombre", "Cargo", "Área", "Estado", "Activo"],
    employees.map((employee) => [
      employee.full_name,
      POSITION_LABELS[employee.position],
      employee.area_name,
      employee.status_name,
      employee.is_active ? "Activo" : "Inactivo",
    ]),
  );
}

export function EmployeesView({ employees }: { employees: Employee[] }) {
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("todos");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const areas = useMemo(() => [...new Set(employees.map((e) => e.area_name))].sort(), [employees]);
  const statuses = useMemo(() => [...new Set(employees.map((e) => e.status_name))].sort(), [employees]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter(
      (e) =>
        (!query ||
          `${e.full_name} ${POSITION_LABELS[e.position]} ${e.area_name}`.toLowerCase().includes(query)) &&
        (!areaFilter || e.area_name === areaFilter) &&
        (!statusFilter || e.status_name === statusFilter) &&
        (activeFilter === "todos" || (activeFilter === "activos") === e.is_active),
    );
  }, [employees, search, areaFilter, statusFilter, activeFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page_ = Math.min(page, pages);
  const rows = filtered.slice((page_ - 1) * PER_PAGE, page_ * PER_PAGE);
  const selected = employees.find((e) => e.id === selectedId) ?? null;
  const hasFilters = !!(search || areaFilter || statusFilter || activeFilter !== "todos");

  const withReset = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };
  const clearFilters = () => {
    setSearch("");
    setAreaFilter("");
    setStatusFilter("");
    setActiveFilter("todos");
    setPage(1);
  };

  const total = employees.length;
  const activeCount = employees.filter((e) => e.is_active).length;
  const countByPosition = (position: Employee["position"]) =>
    employees.filter((e) => e.position === position).length;
  const pct = (n: number) => (total ? `${Math.round((n / total) * 100)}%` : "0%");

  const practicantes = countByPosition("practicante");
  const kpis = [
    { label: "Total empleados", value: total, sub: "registrados", pct: "100%" },
    { label: "Activos", value: activeCount, sub: `de ${total}`, pct: pct(activeCount) },
    { label: "Inactivos", value: total - activeCount, sub: `de ${total}`, pct: pct(total - activeCount) },
    {
      label: "Practicantes",
      value: practicantes,
      sub: `Líderes ${countByPosition("lider")} · RH ${countByPosition("recursos_humanos")}`,
      pct: pct(practicantes),
    },
  ];

  return (
    <>
      <header className="anim-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">
            02 · Gestión de personal
          </p>
          <h1 className="font-heading mt-0.5 text-[42px] font-semibold uppercase leading-none">Empleados</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportToCsv(filtered)}
            disabled={filtered.length === 0}
            className="flex h-[38px] items-center gap-2 whitespace-nowrap border border-[var(--accent)] px-4 text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)] active:bg-[#dfeaf7] disabled:opacity-45"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
            Exportar
          </button>
          <RoleGate>
            <Link
              href={`${ROUTE_PATHS.empleados}/nuevo`}
              className="font-heading relative flex h-[38px] items-center whitespace-nowrap border border-[var(--accent)] bg-[var(--accent)] px-4 font-semibold text-[var(--bg)] hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)]"
            >
              <Corners />+ Nuevo empleado
            </Link>
          </RoleGate>
        </div>
      </header>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] border border-[var(--divider)]">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="anim-up flex flex-col gap-2 border-r border-[var(--divider)] px-5 py-4 last:border-r-0"
            style={{ animationDelay: `${0.1 + i * 0.07}s` }}
          >
            <p className="whitespace-nowrap text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">
              {kpi.label}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-[44px] font-semibold leading-none">{kpi.value}</span>
              <span className="whitespace-nowrap text-[13px] text-[var(--neutral-700)]">{kpi.sub}</span>
            </div>
            <div className="h-[3px] bg-[var(--accent-100)]">
              <div className="anim-grow h-full bg-[var(--accent)]" style={{ width: kpi.pct, animationDelay: `${0.1 + i * 0.07}s` }} />
            </div>
          </div>
        ))}
      </div>

      <div className={`grid items-start gap-[22px] ${selected ? "xl:grid-cols-[minmax(0,1fr)_340px]" : "grid-cols-1"}`}>
        <section className="panel anim-up flex min-w-0 flex-col gap-3.5 px-5 py-[18px]" style={{ animationDelay: ".3s" }}>
          <Corners />

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] max-w-[340px] flex-1">
              <svg className="absolute left-[11px] top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#76767a" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={search}
                onChange={(e) => withReset(setSearch)(e.target.value)}
                placeholder="Buscar por nombre, cargo o área…"
                className="input-ui w-full pl-9"
              />
            </div>
            <select value={areaFilter} onChange={(e) => withReset(setAreaFilter)(e.target.value)} className="input-ui">
              <option value="">Todas las áreas</option>
              {areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => withReset(setStatusFilter)(e.target.value)} className="input-ui">
              <option value="">Todo estado</option>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <div className="ml-auto flex border border-[var(--divider)]">
              {ACTIVE_FILTERS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => withReset(setActiveFilter)(v)}
                  aria-pressed={activeFilter === v}
                  className={`h-[36px] whitespace-nowrap px-3.5 text-[13px] capitalize transition-colors ${
                    activeFilter === v ? "bg-[var(--accent)] text-[var(--bg)]" : "hover:bg-[var(--accent-100)]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-baseline justify-between text-xs text-[var(--neutral-700)]">
            <span className="whitespace-nowrap">
              {filtered.length} de {total} empleados
            </span>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="h-[26px] px-2 text-xs text-[var(--accent-700)] hover:bg-[var(--accent-100)]">
                Limpiar filtros ×
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[rgba(29,31,32,.35)] text-left text-[11px] uppercase tracking-[.1em] text-[var(--neutral-700)]">
                  <th className="px-3 py-2.5 font-medium">Empleado</th>
                  <th className="px-3 py-2.5 font-medium">Cargo</th>
                  <th className="px-3 py-2.5 font-medium">Área</th>
                  <th className="px-3 py-2.5 font-medium">Estado</th>
                  <th className="px-3 py-2.5 font-medium">Activo</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map((e, i) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedId(e.id)}
                    className={`anim-in cursor-pointer border-b border-[var(--divider)] transition-colors hover:bg-[var(--accent-100)] ${
                      selectedId === e.id ? "bg-[var(--accent-100)]" : ""
                    }`}
                    style={{ animationDelay: `${0.35 + Math.min(i, 10) * 0.04}s` }}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="font-heading grid h-[34px] w-[34px] flex-none place-items-center border border-[#8fadcc] text-[13px] font-semibold text-[var(--accent-700)]">
                          {getInitials(e.full_name)}
                        </div>
                        <Link
                          href={`${ROUTE_PATHS.empleados}/${e.id}`}
                          onClick={(ev) => ev.stopPropagation()}
                          className="whitespace-nowrap font-medium underline decoration-transparent underline-offset-[3px] transition-colors hover:text-[var(--accent-700)] hover:decoration-[#8fadcc]"
                        >
                          {e.full_name || "—"}
                        </Link>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3">{POSITION_LABELS[e.position]}</td>
                    <td className="whitespace-nowrap px-3 text-[#3b3b3d]">{e.area_name}</td>
                    <td className="px-3">
                      <EmployeeStatusBadge statusName={e.status_name} />
                    </td>
                    <td className="px-3">
                      <span className={`inline-flex items-center gap-[7px] text-[13px] ${e.is_active ? "" : "text-[#76767a]"}`}>
                        <span className={`h-2 w-2 border border-[#6f93b8] ${e.is_active ? "bg-[var(--accent)]" : ""}`} />
                        {e.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-3 text-[#76767a]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="anim-up flex flex-col items-center gap-2 py-12 text-center">
                <span className="font-heading text-[22px] font-semibold">Sin resultados</span>
                <span className="text-[13px] text-[var(--neutral-700)]">
                  {hasFilters ? "Ningún empleado coincide con los filtros." : "No hay empleados registrados."}
                </span>
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="px-3 py-1.5 text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)]">
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-xs text-[var(--neutral-700)]">
                Página {page_} de {pages}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page_ <= 1}
                  onClick={() => setPage(page_ - 1)}
                  className="h-8 border border-[var(--accent)] px-3 text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)] disabled:opacity-45"
                >
                  ‹ Anterior
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`h-8 min-w-8 px-2 text-sm ${n === page_ ? "bg-[var(--accent)] text-[var(--bg)]" : "hover:bg-[var(--accent-100)]"}`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page_ >= pages}
                  onClick={() => setPage(page_ + 1)}
                  className="h-8 border border-[var(--accent)] px-3 text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)] disabled:opacity-45"
                >
                  Siguiente ›
                </button>
              </div>
            </div>
          )}
        </section>

        {selected && <EmployeeDetail key={selected.id} employee={selected} onClose={() => setSelectedId(null)} />}
      </div>
    </>
  );
}
