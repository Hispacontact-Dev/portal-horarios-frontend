"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Corners } from "@/components/dashboard/Corners";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { useBulkAssignment } from "@/lib/hooks/useBulkAssignment";
import { uniqueAreaNames } from "@/lib/utils/catalog";
import { toH } from "@/lib/utils/time";
import { addWeeks, businessDaysBetween, mondayOf, toISODate } from "@/lib/utils/week";
import { ROUTE_PATHS } from "@/lib/utils/constants";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import type { Weekday } from "@/types/schedule";

type Kind = "shift" | "status";
type Modality = "presencial" | "virtual";

interface Plantilla {
  id: string;
  name: string;
  blocks: [string, string][];
}

const PLANTILLAS: Plantilla[] = [
  { id: "jc", name: "Jornada completa", blocks: [["08:00", "17:00"]] },
  { id: "jp", name: "Jornada partida", blocks: [["08:00", "12:00"], ["13:00", "17:00"]] },
  { id: "t9", name: "Turno 9 a 18", blocks: [["09:00", "18:00"]] },
  { id: "mj", name: "Media jornada", blocks: [["08:00", "13:00"]] },
];

const WEEKDAY_OPTIONS: { value: Weekday; label: string }[] = [
  { value: "monday", label: "L" },
  { value: "tuesday", label: "M" },
  { value: "wednesday", label: "X" },
  { value: "thursday", label: "J" },
  { value: "friday", label: "V" },
];

const span = (b: [string, string]) => Math.max(0, toH(b[1]) - toH(b[0]));

function Paso({ n, t, children }: { n: string; t: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2.5">
      <span className="font-heading text-[13px] font-semibold text-[var(--accent-700)]">{n}</span>
      <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">{t}</h2>
      {children}
    </div>
  );
}

export function AdministrarHorariosView() {
  const { status: employeesStatus, employees, error: employeesError } = useEmployees();
  const { statuses } = useStatuses();
  const { state, submit } = useBulkAssignment();
  const areaOptions = uniqueAreaNames(employees);

  const [sel, setSel] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");

  const [kind, setKind] = useState<Kind>("shift");
  const [plantillaId, setPlantillaId] = useState(PLANTILLAS[0]?.id ?? "custom");
  const [modality, setModality] = useState<Modality>("presencial");
  const [customStart, setCustomStart] = useState("07:00");
  const [customEnd, setCustomEnd] = useState("15:00");
  const [statusId, setStatusId] = useState("");
  const [weekdays, setWeekdays] = useState<Set<Weekday>>(new Set(WEEKDAY_OPTIONS.map((w) => w.value)));

  const nextMonday = mondayOf(addWeeks(new Date(), 1));
  const [desde, setDesde] = useState(toISODate(nextMonday));
  const [hasta, setHasta] = useState(toISODate(addWeeks(nextMonday, 3)));

  const [lastResult, setLastResult] = useState<Awaited<ReturnType<typeof submit>> | null>(null);

  const visibles = employees.filter(
    (e) => (!q || e.full_name.toLowerCase().includes(q.toLowerCase())) && (!area || e.area_name === area),
  );
  const elegidos = employees.filter((e) => sel.has(e.id));
  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleWeekday = (w: Weekday) =>
    setWeekdays((s) => {
      const n = new Set(s);
      n.has(w) ? n.delete(w) : n.add(w);
      return n;
    });

  const todasPlantillas: Plantilla[] = [...PLANTILLAS, { id: "custom", name: "Personalizado", blocks: [[customStart, customEnd]] }];
  const bloques = todasPlantillas.find((p) => p.id === plantillaId)?.blocks ?? [];
  const isShift = kind === "shift";

  const candidateDates = useMemo(() => {
    if (!desde || !hasta || weekdays.size === 0) return [];
    const start = new Date(`${desde}T00:00:00`);
    const end = new Date(`${hasta}T00:00:00`);
    if (start > end) return [];
    return businessDaysBetween(start, end, weekdays);
  }, [desde, hasta, weekdays]);

  const horasPorSemana = isShift ? bloques.reduce((a, b) => a + span(b), 0) * weekdays.size : 0;
  const estimadas = elegidos.length * candidateDates.length;

  const puedeGuardar =
    elegidos.length > 0 &&
    candidateDates.length > 0 &&
    (isShift ? bloques.length > 0 : statusId !== "") &&
    state.status !== "submitting";

  async function guardar() {
    const timeRanges = bloques.map(([start, end]) => ({ start, end }));
    const result = await submit(
      isShift
        ? {
            employee_ids: [...sel],
            start_date: desde,
            end_date: hasta,
            weekdays: [...weekdays],
            kind: "shift",
            modality,
            time_ranges: timeRanges,
          }
        : {
            employee_ids: [...sel],
            start_date: desde,
            end_date: hasta,
            weekdays: [...weekdays],
            kind: "status",
            status_id: statusId,
          },
    );
    if (result) setLastResult(result);
  }

  const inp =
    "min-h-[36px] border border-[var(--divider)] bg-[#e9e9ea] px-2.5 text-sm outline-none hover:border-[rgba(29,31,32,.45)] focus-visible:border-[var(--accent)]";
  const lbl = "mb-[5px] block text-xs text-[rgba(29,31,32,.7)]";
  const card = (on: boolean) =>
    `flex flex-col gap-2 border p-3 text-left transition-colors hover:bg-[var(--accent-100)] ${on ? "border-[var(--accent)] bg-[var(--accent-100)]" : "border-[var(--divider)]"}`;

  return (
    <>
      <header className="anim-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href={ROUTE_PATHS.horarios} className="text-[11px] uppercase tracking-[.12em] text-[var(--accent-700)] hover:text-[#1a2b3b]">
            ← Horarios
          </Link>
          <h1 className="font-heading mt-0.5 text-[42px] font-semibold uppercase leading-none">Administrar horarios</h1>
        </div>
        <div className="flex gap-2.5">
          <Link href={ROUTE_PATHS.horarios} className="flex h-[38px] items-center border border-[var(--accent)] px-4 text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)]">
            Cancelar
          </Link>
          <button
            type="button"
            onClick={guardar}
            disabled={!puedeGuardar}
            className="font-heading relative flex h-[38px] items-center whitespace-nowrap border border-[var(--accent)] bg-[var(--accent)] px-4 font-semibold text-[var(--bg)] hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)] disabled:opacity-45"
          >
            <Corners />
            {state.status === "submitting" ? "Guardando…" : elegidos.length ? `Guardar · ${elegidos.length} empleado${elegidos.length > 1 ? "s" : ""}` : "Guardar asignación"}
          </button>
        </div>
      </header>

      {state.status === "error" && <ErrorState message={state.error.message} />}

      {lastResult && (
        <section className="panel anim-up flex flex-col gap-2 px-5 py-4" style={{ animationDelay: "0s" }}>
          <Corners />
          <p className="text-sm">
            <strong className="font-heading">{lastResult.created.length}</strong> asignación(es) creada(s)
            {lastResult.skipped.length > 0 && (
              <>
                {" "}
                · <strong className="font-heading text-[var(--accent-800)]">{lastResult.skipped.length}</strong> saltada(s) por conflicto
              </>
            )}
            .
          </p>
          {lastResult.skipped.length > 0 && (
            <ul className="flex flex-col gap-1 text-[13px] text-[var(--neutral-700)]">
              {lastResult.skipped.map((s, i) => {
                const name = employees.find((e) => e.id === s.employee_id)?.full_name ?? s.employee_id;
                return (
                  <li key={i}>
                    {name}
                    {s.skipped_date ? ` · ${s.skipped_date}` : ""} — {s.reason}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <div className="flex flex-wrap items-start gap-[22px]">
        <section className="panel anim-up flex max-w-full flex-[1_1_280px] flex-col gap-3 p-[18px] xl:sticky xl:top-7 xl:max-w-[320px]" style={{ animationDelay: ".1s" }}>
          <Corners />
          <Paso n="01" t="Empleados">
            <span className="ml-auto bg-[var(--accent-100)] px-2 py-0.5 text-[11px] text-[var(--accent-800)]">{elegidos.length} sel.</span>
          </Paso>

          {employeesStatus === "loading" && <Spinner />}
          {employeesStatus === "error" && <ErrorState message={employeesError.message} />}

          {employeesStatus === "success" && (
            <>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar empleado…" className={inp} />
              <select value={area} onChange={(e) => setArea(e.target.value)} className={inp}>
                <option value="">Todas las áreas</option>
                {areaOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="flex justify-between">
                <button type="button" onClick={() => setSel((s) => new Set([...s, ...visibles.map((v) => v.id)]))} className="h-[26px] px-1.5 text-xs text-[var(--accent-700)] hover:bg-[var(--accent-100)]">
                  Seleccionar visibles
                </button>
                <button type="button" onClick={() => setSel(new Set())} className="h-[26px] px-1.5 text-xs text-[var(--accent-700)] hover:bg-[var(--accent-100)]">
                  Quitar todos
                </button>
              </div>
              <div className="flex max-h-[480px] flex-col overflow-y-auto border-t border-[var(--divider)]">
                {visibles.map((e) => (
                  <label key={e.id} className={`flex cursor-pointer items-center gap-2.5 border-b border-[var(--divider)] px-1 py-[9px] hover:bg-[var(--accent-100)] ${sel.has(e.id) ? "bg-[var(--accent-100)]" : ""}`}>
                    <input type="checkbox" checked={sel.has(e.id)} onChange={() => toggle(e.id)} className="h-[15px] w-[15px] flex-none accent-[var(--accent)]" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-[13px] font-medium">{e.full_name || "—"}</span>
                      <span className="text-[11px] text-[var(--neutral-700)]">{e.area_name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </section>

        <div className="flex min-w-0 max-w-full flex-[999_1_560px] flex-col gap-[22px]">
          <section className="panel anim-up flex flex-col gap-4 px-5 py-[18px]" style={{ animationDelay: ".2s" }}>
            <Corners />
            <Paso n="02" t="Qué asignar">
              <div className="ml-auto flex border border-[var(--divider)]">
                {(["shift", "status"] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={kind === v} onClick={() => setKind(v)} className={`h-9 px-3.5 text-[13px] ${kind === v ? "bg-[var(--accent)] text-[var(--bg)]" : "hover:bg-[var(--accent-100)]"}`}>
                    {v === "shift" ? "Turno" : "Novedad"}
                  </button>
                ))}
              </div>
            </Paso>

            {isShift ? (
              <>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2.5">
                  {todasPlantillas.map((p) => {
                    const hrs = p.blocks.reduce((a, b) => a + span(b), 0);
                    return (
                      <button key={p.id} type="button" onClick={() => setPlantillaId(p.id)} className={card(plantillaId === p.id)}>
                        <div className="flex items-baseline justify-between gap-1.5">
                          <span className="font-heading text-base font-semibold">{p.name}</span>
                          <span className="whitespace-nowrap text-[11px] text-[var(--neutral-700)]">{+hrs.toFixed(1)} h</span>
                        </div>
                        <span className="text-xs tabular-nums text-[#3b3b3d]">{p.blocks.map((b) => b.join("–")).join(" · ")}</span>
                      </button>
                    );
                  })}
                </div>
                {plantillaId === "custom" && (
                  <div className="anim-up flex flex-wrap gap-3">
                    <div>
                      <label className={lbl}>Inicio</label>
                      <input type="time" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Fin</label>
                      <input type="time" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className={inp} />
                    </div>
                  </div>
                )}
                <div>
                  <label className={lbl}>Modalidad</label>
                  <div className="flex border border-[var(--divider)]">
                    {(["presencial", "virtual"] as const).map((m) => (
                      <button key={m} type="button" aria-pressed={modality === m} onClick={() => setModality(m)} className={`h-9 px-3.5 text-[13px] capitalize ${modality === m ? "bg-[var(--accent)] text-[var(--bg)]" : "hover:bg-[var(--accent-100)]"}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
                {statuses.filter((s) => s.is_enabled).map((s) => (
                  <button key={s.id} type="button" onClick={() => setStatusId(s.id)} className={card(statusId === s.id)}>
                    <span className="font-heading text-base font-semibold">{s.name}</span>
                  </button>
                ))}
                {statuses.filter((s) => s.is_enabled).length === 0 && (
                  <p className="text-[13px] text-[var(--neutral-700)]">No hay Estados habilitados en el catálogo.</p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-end gap-4 border-t border-[var(--divider)] pt-4">
              <div>
                <label className={lbl}>Desde</label>
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Hasta</label>
                <input type="date" value={hasta} min={desde} onChange={(e) => setHasta(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Días</label>
                <div className="flex flex-wrap gap-1">
                  {WEEKDAY_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={weekdays.has(value)}
                      onClick={() => toggleWeekday(value)}
                      className={`font-heading grid h-[38px] w-[38px] flex-none place-items-center border border-[var(--accent)] text-sm font-semibold transition-colors ${weekdays.has(value) ? "bg-[var(--accent)] text-[var(--bg)]" : "text-[var(--accent-700)] hover:bg-[var(--accent-100)]"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="panel anim-up flex min-w-0 flex-col gap-3.5 px-5 py-[18px]" style={{ animationDelay: ".3s" }}>
            <Corners />
            <Paso n="03" t="Resumen">
              <span className="text-xs text-[var(--neutral-700)]">Estimado — los conflictos se resuelven al guardar</span>
            </Paso>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] border border-[var(--divider)]">
              {[
                ["Empleados seleccionados", elegidos.length],
                ["Días hábiles en el rango", candidateDates.length],
                [isShift ? "Horas por persona / semana" : "Asignaciones estimadas", isShift ? `${+horasPorSemana.toFixed(1)} h` : estimadas],
              ].map(([l, v], i) => (
                <div key={i} className="border-r border-[var(--divider)] px-4 py-3 last:border-r-0">
                  <p className="text-[10px] uppercase tracking-[.12em] text-[var(--neutral-700)]">{l}</p>
                  <p className="font-heading text-[30px] font-semibold leading-tight">{v}</p>
                </div>
              ))}
            </div>

            {elegidos.length === 0 ? (
              <p className="py-9 text-center text-[13px] text-[var(--neutral-700)]">Selecciona al menos un empleado para ver el resumen.</p>
            ) : candidateDates.length === 0 ? (
              <p className="py-9 text-center text-[13px] text-[var(--neutral-700)]">El rango y los días elegidos no incluyen ningún día hábil.</p>
            ) : (
              <p className="text-[13px] text-[var(--neutral-700)]">
                Se intentará {isShift ? "asignar el turno" : "registrar la novedad"} a <strong>{elegidos.length}</strong> empleado(s) en{" "}
                <strong>{candidateDates.length}</strong> día(s) hábil(es) del rango. Si algún día ya tiene algo asignado para un empleado,
                se salta ese día (o ese empleado, si no existe) y se guarda el resto — el detalle aparece arriba después de guardar.
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
