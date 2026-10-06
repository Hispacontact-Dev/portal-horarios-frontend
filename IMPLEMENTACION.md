### Implementeacion Diseño completo DASHBOARD ###


# 1. app/globals.css: agrega al final

@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.anim-grow{transform-origin:left;animation:grow .7s cubic-bezier(.2,.7,.2,1) both}
.panel{position:relative;border:1px solid var(--divider)}


# 2. src/app/(dashboard)/layout.tsx

import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[232px_minmax(0,1fr)] bg-[var(--bg)] text-[var(--text)]">
      <Sidebar />
      <main className="flex min-w-0 flex-col gap-[22px] px-9 py-7">{children}</main>
    </div>
  );
}
# 3. src/components/dashboard/Corners.tsx

export const Corners = () => (
  <>
    <i className="corner -left-[6px] -top-[6px]" />
    <i className="corner -right-[6px] -top-[6px]" />
    <i className="corner -bottom-[6px] -left-[6px]" />
    <i className="corner -bottom-[6px] -right-[6px]" />
  </>
);
# 4. src/components/dashboard/Sidebar.tsx

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/empleados", label: "Empleados" },
  { href: "/horarios", label: "Horarios" },
  { href: "/areas", label: "Áreas" },
  { href: "/estados", label: "Estados" },
  { href: "/usuarios", label: "Usuarios" },
  { href: "/auditoria", label: "Auditoría" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="anim-in sticky top-0 flex h-screen flex-col gap-7 border-r border-[var(--divider)] px-[18px] py-[26px]">
      <div className="flex items-center gap-2.5 px-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h5" /><path d="M17.5 17.5 16 16.3V14" /><circle cx="16" cy="16" r="6" />
        </svg>
        <span className="font-heading whitespace-nowrap text-[15px] font-semibold uppercase tracking-[.08em]">Portal de Horarios</span>
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
              <span className="text-[10px] tabular-nums tracking-[.1em] text-[#76767a]">{String(i + 1).padStart(2, "0")}</span>
              {it.label}
            </Link>
          );
        })}
      </nav>

      {/* TODO: datos del usuario en sesión */}
      <div className="mt-auto flex items-center gap-2.5 border-t border-[var(--divider)] px-2 py-3">
        <div className="font-heading grid h-[34px] w-[34px] place-items-center border border-[var(--accent)] font-semibold text-[var(--accent-700)]">DM</div>
        <div className="flex flex-col">
          <span className="text-[13px] font-medium">Diana Mora</span>
          <span className="text-[11px] text-[var(--neutral-700)]">Supervisora</span>
        </div>
      </div>
    </aside>
  );
}
# 5. src/components/dashboard/TurnosHoy.tsx

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Corners } from "./Corners";

export type Estado = "Presente" | "Tarde" | "Descanso" | "Ausente" | "Programado";
export type Turno = { id: string; nombre: string; area: string; inicio: number; fin: number; estado: Estado };

const START = 6, END = 22, SPAN = END - START;
const HOURS = ["06", "08", "10", "12", "14", "16", "18", "20", "22"];

const STYLE: Record<Estado, { bg: string; ink: string }> = {
  Presente: { bg: "var(--accent)", ink: "var(--bg)" },
  Tarde: { bg: "var(--accent-700)", ink: "var(--bg)" },
  Descanso: { bg: "#c7dbf3", ink: "#1a2b3b" },
  Ausente: { bg: "repeating-linear-gradient(45deg,#cfcfd1 0 4px,transparent 4px 8px)", ink: "#3b3b3d" },
  Programado: { bg: "transparent", ink: "var(--accent-800)" },
};
const p = (n: number) => String(n).padStart(2, "0");

export function TurnosHoy({ turnos }: { turnos: Turno[] }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const frac = now ? Math.min(1, Math.max(0, (now.getHours() + now.getMinutes() / 60 - START) / SPAN)) : null;

  return (
    <section className="panel anim-up flex flex-col gap-3 px-5 py-[18px]" style={{ animationDelay: ".3s" }}>
      <Corners />
      <div className="flex items-baseline justify-between">
        <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">Turnos de hoy</h2>
        <Link href="/horarios" className="whitespace-nowrap text-[13px] text-[var(--accent-700)] hover:text-[var(--accent-800)]">Ver horarios →</Link>
      </div>

      <div className="grid grid-cols-[190px_minmax(0,1fr)] text-[10px] tracking-[.06em] text-[#76767a]">
        <span />
        <div className="flex justify-between">{HOURS.map((h) => <span key={h} className="w-0 whitespace-nowrap">{h}</span>)}</div>
      </div>

      <div className="relative flex flex-col">
        {turnos.map((t, i) => {
          const s = STYLE[t.estado];
          return (
            <div key={t.id} className="grid h-[46px] grid-cols-[190px_minmax(0,1fr)] items-center border-t border-[var(--divider)]">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{t.nombre}</span>
                <span className="text-[11px] text-[var(--neutral-700)]">{t.area}</span>
              </div>
              <div className="relative h-[22px]">
                <div
                  className="anim-grow absolute inset-y-0 flex items-center overflow-hidden whitespace-nowrap border border-[#6f93b8] px-2 text-[11px]"
                  style={{
                    left: `${((t.inicio - START) / SPAN) * 100}%`,
                    width: `${((t.fin - t.inicio) / SPAN) * 100}%`,
                    background: s.bg, color: s.ink, animationDelay: `${0.35 + i * 0.07}s`,
                  }}
                >
                  {p(t.inicio)}:00–{p(t.fin)}:00 · {t.estado}
                </div>
              </div>
            </div>
          );
        })}

        {frac !== null && now && (
          <div className="anim-in pointer-events-none absolute -top-1.5 bottom-0 border-l border-dashed border-[var(--accent-700)]"
               style={{ left: `calc(190px + (100% - 190px) * ${frac})`, animationDelay: "1s" }}>
            <span className="absolute -left-6 -top-3.5 bg-[var(--accent-700)] px-[5px] py-px text-[10px] tracking-[.08em] text-[var(--bg)]">
              {p(now.getHours())}:{p(now.getMinutes())}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
# 6. src/app/(dashboard)/dashboard/page.tsx

import Link from "next/link";
import { Corners } from "@/components/dashboard/Corners";
import { TurnosHoy, type Turno } from "@/components/dashboard/TurnosHoy";

// TODO: reemplazar por llamadas a tu API
async function getData() {
  const kpis = [
    { label: "Presentes", value: "128", sub: "/ 146" },
    { label: "Tardanzas", value: "7", sub: "hoy" },
    { label: "Ausencias", value: "4", sub: "hoy" },
    { label: "Horas registradas", value: "1.024", sub: "h semana" },
  ];
  const turnos: Turno[] = [
    { id: "1", nombre: "Laura Gómez", area: "Producción", inicio: 6, fin: 14, estado: "Presente" },
    { id: "2", nombre: "Carlos Ruiz", area: "Bodega", inicio: 7, fin: 15, estado: "Tarde" },
    { id: "3", nombre: "Ana Torres", area: "Atención", inicio: 8, fin: 17, estado: "Presente" },
    { id: "4", nombre: "Jorge Peña", area: "Mantenimiento", inicio: 6, fin: 14, estado: "Descanso" },
    { id: "5", nombre: "Diana Mora", area: "Administración", inicio: 8, fin: 17, estado: "Presente" },
    { id: "6", nombre: "Sofía Herrera", area: "Atención", inicio: 10, fin: 19, estado: "Ausente" },
    { id: "7", nombre: "Felipe Castro", area: "Producción", inicio: 14, fin: 22, estado: "Programado" },
    { id: "8", nombre: "Miguel Rojas", area: "Bodega", inicio: 14, fin: 22, estado: "Programado" },
  ];
  const auditoria = [
    { id: "a1", hora: "08:42", usuario: "d.mora", accion: "editó el horario de C. Ruiz" },
    { id: "a2", hora: "08:15", usuario: "Sistema", accion: "marcó tardanza a C. Ruiz" },
    { id: "a3", hora: "07:58", usuario: "a.torres", accion: "registró entrada" },
    { id: "a4", hora: "07:30", usuario: "admin", accion: "creó el usuario s.herrera" },
    { id: "a5", hora: "06:40", usuario: "admin", accion: "movió a J. Peña a Mantenimiento" },
    { id: "a6", hora: "06:02", usuario: "l.gomez", accion: "registró entrada" },
  ];
  return { kpis, turnos, auditoria };
}

export default async function DashboardPage() {
  const { kpis, turnos, auditoria } = await getData();
  const fecha = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <header className="anim-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">{fecha}</p>
          <h1 className="font-heading mt-0.5 text-[42px] font-semibold uppercase leading-none">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <input
            placeholder="Buscar empleado…"
            className="min-h-[38px] w-[240px] border border-[var(--divider)] bg-[#e9e9ea] px-2.5 text-sm outline-none hover:border-[rgba(29,31,32,.45)] focus-visible:border-[var(--accent)]"
          />
          <Link href="/horarios/nuevo"
            className="font-heading relative flex h-[38px] items-center whitespace-nowrap border border-[var(--accent)] bg-[var(--accent)] px-4 font-semibold text-[var(--bg)] hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)]">
            <Corners />+ Nuevo horario
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 border border-[var(--divider)] lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className="anim-up border-r border-[var(--divider)] px-5 py-4 last:border-r-0" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
            <p className="whitespace-nowrap text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">{k.label}</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-heading text-[44px] font-semibold leading-none">{k.value}</span>
              <span className="whitespace-nowrap text-[13px] text-[var(--neutral-700)]">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid flex-1 gap-[22px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <TurnosHoy turnos={turnos} />

        <section className="panel anim-up flex flex-col gap-1.5 px-5 py-[18px]" style={{ animationDelay: ".4s" }}>
          <Corners />
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">Auditoría</h2>
            <Link href="/auditoria" className="whitespace-nowrap text-[13px] text-[var(--accent-700)] hover:text-[var(--accent-800)]">Todo →</Link>
          </div>
          {auditoria.map((l, i) => (
            <div key={l.id} className="anim-up grid grid-cols-[44px_minmax(0,1fr)] gap-2.5 border-t border-[var(--divider)] py-2.5" style={{ animationDelay: `${0.5 + i * 0.07}s` }}>
              <span className="text-xs tabular-nums text-[var(--neutral-700)]">{l.hora}</span>
              <span className="text-[13px] leading-snug"><b className="font-medium">{l.usuario}</b> {l.accion}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}