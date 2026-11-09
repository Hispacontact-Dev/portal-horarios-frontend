"use client";

import { useMemo, useState } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { RoleGate } from "@/components/auth/RoleGate";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { useEmployeeStatusChange } from "@/lib/hooks/useEmployeeStatusChange";
import { useEmployeeNovedad } from "@/lib/hooks/useEmployeeNovedad";
import { useNovedadSync } from "@/lib/hooks/useNovedadSync";
import { selectableOptions } from "@/lib/utils/catalog";
import { formatDayKey } from "@/lib/utils/date";
import { datesInRange } from "@/lib/utils/week";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import type { Employee } from "@/types/employee";
import type { Status } from "@/types/status";

const inp =
  "min-h-[36px] w-full border border-[var(--divider)] bg-[#e9e9ea] px-2.5 text-sm outline-none hover:border-[rgba(29,31,32,.45)] focus-visible:border-[var(--accent)]";
const lbl = "mb-[5px] block text-xs text-[rgba(29,31,32,.7)]";

function InfoBox({ caption, value, note }: { caption: string; value: string; note?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 border border-[var(--divider)] px-3.5 py-3">
      <p className="text-[10px] uppercase tracking-[.12em] text-[var(--neutral-700)]">{caption}</p>
      <p className="font-heading truncate text-xl font-semibold">{value}</p>
      {note && <p className="text-[11px] text-[var(--neutral-700)]">{note}</p>}
    </div>
  );
}

export function EmployeeStatusPanel({
  employee,
  onDone,
  onFlash,
}: {
  employee: Employee;
  onDone: (updated: Employee) => void;
  onFlash: (message: string) => void;
}) {
  const { status: statusesStatus, statuses, error: statusesError } = useStatuses();
  const { state: novedadState, refresh: refreshNovedad } = useEmployeeNovedad(employee.id);

  // `null` mientras Gestión Humana no toque el selector: así el Estado marcado es siempre el que
  // está vigente según el backend, incluso después de guardar y recargar.
  const [selectedOverride, setSelectedOverride] = useState<string | null>(null);
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  // Aviso de días que el backend no dejó tocar. `blocking` cuando no se aplicó ninguno.
  const [notice, setNotice] = useState<{ message: string; blocking: boolean } | null>(null);

  const baseChange = useEmployeeStatusChange({
    employeeId: employee.id,
    onSuccess: (updated) => {
      setSelectedOverride(null);
      onDone(updated);
      onFlash("Estado base actualizado");
    },
  });
  const sync = useNovedadSync();

  // `data` sigue disponible mientras se recarga, así que al guardar no parpadea: el panel muestra la
  // novedad anterior hasta que llega la nueva.
  const data = novedadState.data;
  const serverToday = data?.serverToday ?? null;
  const todayEntry = data?.todayEntry;
  const novedad = data?.novedad ?? null;
  const knownUpdatedAt = data?.knownUpdatedAt ?? {};

  // El Estado vigente: la novedad si la hay, el Estado base si no.
  const vigenteStatusId = novedad?.statusId ?? employee.status_id ?? "";
  const selected = selectedOverride ?? vigenteStatusId;

  const options = selectableOptions(statuses, employee.status_id ?? undefined);
  const groups = useMemo(
    () =>
      [
        {
          title: "Modalidad habitual",
          caption: "Aplica desde ahora, sin fecha",
          entries: options.filter((option) => !option.blocks_shifts),
        },
        {
          title: "Novedad",
          caption: "Aplica solo a los días que elijas",
          entries: options.filter((option) => option.blocks_shifts),
        },
      ].filter((group) => group.entries.length > 0),
    [options],
  );

  // Días de la novedad que el backend no deja editar ni quitar como día suelto: solo los turnos
  // asignados de forma masiva (`shift_override`), excluidos a propósito por la spec 008 RF-6 del
  // backend. Un día de rango sí se puede corregir individualmente.
  const lockedCount = novedad?.days.filter((day) => day.source === "shift_override").length ?? 0;
  const fullyLocked = novedad !== null && lockedCount === novedad.days.length;

  const selectedStatus: Status | undefined = statuses.find((entry) => entry.id === selected);
  const isNovedad = selectedStatus?.blocks_shifts === true;
  // Se está editando la novedad ya guardada (mismo Estado), no creando una nueva.
  const editingSaved = novedad !== null && novedad.statusId === selected;

  // Los inputs arrancan en el rango ya guardado; si no hay novedad, en el día del servidor (nunca
  // en el del navegador). Mientras la semana carga quedan vacíos y el guardado se deshabilita.
  const defaultStart = (editingSaved ? novedad.startDate : serverToday) ?? "";
  const defaultEnd = editingSaved ? novedad.endDate : defaultStart;
  const startDate = startInput || defaultStart;
  const rawEnd = endInput || defaultEnd || startDate;
  // Mover "Desde" más allá del "Hasta" vigente deja un rango de un solo día en vez de un rango
  // inválido: el input de "Hasta" ya tiene `min`, así que el único cruce posible viene de "Desde".
  const endDate = rawEnd < startDate ? startDate : rawEnd;
  const targetDates = isNovedad ? datesInRange(startDate, endDate) : [];

  const isSubmitting = baseChange.isSubmitting || sync.state.status === "submitting";
  // La recarga posterior al guardado también bloquea los botones: hasta que llegue, lo que se ve en
  // pantalla es el dato anterior, y actuar sobre él repetiría la operación.
  const isReloading = novedadState.status === "loading" && data !== null;
  const isBusy = isSubmitting || isReloading;
  const canSave =
    selected !== "" &&
    !isBusy &&
    (isNovedad ? targetDates.length > 0 : selected !== employee.status_id);

  function discard() {
    setSelectedOverride(null);
    setStartInput("");
    setEndInput("");
    setNotice(null);
  }

  function reportSkipped(skipped: { date: string; reason: string }[], applied: number) {
    if (skipped.length === 0) return;
    setNotice({
      message: `${skipped.length} día(s) quedaron sin cambiar: ${skipped
        .map((entry) => formatDayKey(entry.date))
        .join(", ")}. Motivo: ${skipped[0].reason}.`,
      blocking: applied === 0,
    });
  }

  async function handleSave() {
    setNotice(null);

    if (!isNovedad) {
      baseChange.changeStatus(selected);
      return;
    }

    // Los días que tenía la novedad y quedaron fuera del rango nuevo vuelven al horario habitual.
    const removeDates = (novedad?.days ?? [])
      .map((day) => day.date)
      .filter((date) => !targetDates.includes(date));

    const result = await sync.submit({
      employeeId: employee.id,
      statusId: selected,
      targetDates,
      removeDates,
      knownUpdatedAt,
    });
    if (!result) return;

    if (result.applied > 0 || result.removed > 0) {
      onFlash(`${selectedStatus?.name ?? "Novedad"} · ${result.applied} día(s) asignado(s)`);
      discard();
      refreshNovedad();
    }
    reportSkipped(result.skipped, result.applied + result.removed);
  }

  async function handleRemove() {
    if (novedad === null) return;
    setNotice(null);

    const result = await sync.submit({
      employeeId: employee.id,
      statusId: null,
      targetDates: [],
      removeDates: novedad.days.map((day) => day.date),
      knownUpdatedAt,
    });
    if (!result) return;

    if (result.removed > 0) {
      onFlash(`Novedad quitada de ${result.removed} día(s)`);
      discard();
      refreshNovedad();
    }
    reportSkipped(result.skipped, result.removed);
  }

  const writeError = baseChange.error ?? (sync.state.status === "error" ? sync.state.error : null);
  const errorMessage =
    writeError === null
      ? null
      : writeError.kind === "conflict"
        ? "Esos días cambiaron desde otra pantalla. Recargá la ficha antes de guardar."
        : writeError.message;

  const saveLabel = isBusy
    ? "Guardando…"
    : !isNovedad
      ? "Aplicar estado"
      : `Guardar · ${targetDates.length} día(s)`;

  return (
    <section className="panel anim-up flex max-w-full flex-[1_1_300px] flex-col gap-3.5 px-[22px] py-5" style={{ animationDelay: ".3s" }}>
      <Corners />
      <div className="flex items-baseline gap-2.5">
        <span className="font-heading text-[13px] font-semibold text-[var(--accent-700)]">03</span>
        <h2 className="font-heading whitespace-nowrap text-[22px] font-semibold">Estado</h2>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <InfoBox
          caption="Base"
          value={employee.status_name}
          note={employee.is_active ? "Empleado activo" : "Empleado inactivo"}
        />
        {novedadState.status === "loading" && data === null && (
          <div className="flex min-w-0 flex-1 items-center border border-[var(--divider)] px-3.5 py-3">
            <Spinner />
          </div>
        )}
        {novedadState.status === "error" && (
          <div className="min-w-0 flex-1">
            <ErrorState message={novedadState.error.message} />
          </div>
        )}
        {data !== null && (
          <InfoBox
            caption={novedad === null ? "Hoy" : "Novedad vigente"}
            value={novedad?.statusName ?? todayEntry?.status_name ?? employee.status_name}
            note={
              novedad !== null
                ? `${formatDayKey(novedad.startDate)} – ${formatDayKey(novedad.endDate)} · ${novedad.days.length} día(s)`
                : "Hereda el Estado base"
            }
          />
        )}
      </div>

      <RoleGate>
        {statusesStatus === "loading" && <Spinner />}
        {statusesStatus === "error" && <ErrorState message={statusesError.message} />}

        {statusesStatus === "success" && (
          <div role="radiogroup" aria-label="Estado del empleado" className="flex flex-col gap-3">
            {groups.map((group) => (
              <div key={group.title} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 border-b border-[var(--divider)] pb-1">
                  <span className="text-[11px] uppercase tracking-[.1em] text-[var(--accent-700)]">{group.title}</span>
                  <span className="text-[11px] text-[var(--neutral-700)]">{group.caption}</span>
                </div>
                {group.entries.map((option) => {
                  const on = selected === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setSelectedOverride(option.id)}
                      className={`flex items-center gap-3 border px-3 py-2.5 text-left transition-colors hover:bg-[var(--accent-100)] ${
                        on ? "border-[var(--accent)] bg-[var(--accent-100)]" : "border-[var(--divider)]"
                      }`}
                    >
                      <span className="grid h-3.5 w-3.5 flex-none place-items-center border border-[var(--accent)]">
                        <span className={`h-2 w-2 transition-colors ${on ? "bg-[var(--accent)]" : ""}`} />
                      </span>
                      <span className="flex-1 text-sm font-medium">{option.name}</span>
                      {option.id === vigenteStatusId && (
                        <span className="text-[10px] uppercase tracking-[.1em] text-[var(--accent-700)]">Vigente</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {isNovedad && (
          <div className="anim-up flex flex-col gap-2.5 border border-[var(--accent-600)] px-3.5 py-3">
            <span className={lbl}>Días con este Estado</span>
            <div className="flex flex-wrap gap-2.5">
              <div className="min-w-[128px] flex-1">
                <label htmlFor="novedad_desde" className={lbl}>
                  Desde
                </label>
                <input
                  id="novedad_desde"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartInput(event.target.value)}
                  className={inp}
                />
              </div>
              <div className="min-w-[128px] flex-1">
                <label htmlFor="novedad_hasta" className={lbl}>
                  Hasta
                </label>
                <input
                  id="novedad_hasta"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(event) => setEndInput(event.target.value)}
                  className={inp}
                />
              </div>
            </div>
            <p className="text-[12px] leading-snug text-[var(--neutral-700)]">
              {targetDates.length > 0
                ? `${targetDates.length} día(s), fin de semana incluido. El resto de la semana conserva su horario.`
                : "Elegí un rango válido: la fecha final no puede ser anterior a la inicial."}
            </p>
            {editingSaved && novedad.clipped && (
              <p className="text-[12px] leading-snug text-[var(--neutral-700)]">
                La novedad podría seguir más allá de las semanas que se alcanzaron a revisar; ajustá las fechas con
                cuidado.
              </p>
            )}
          </div>
        )}

        {lockedCount > 0 && (
          <p className="border border-[var(--accent-800)] px-3 py-2 text-[12px] leading-snug text-[var(--accent-800)]">
            {fullyLocked
              ? "Estos días son un turno asignado de forma masiva (Horarios → Administrar). El backend no permite editarlos ni quitarlos como día suelto, así que desde acá no se pueden modificar."
              : `${lockedCount} de los ${novedad?.days.length} días son turnos asignados de forma masiva: esos no se van a poder cambiar ni quitar.`}
          </p>
        )}

        {errorMessage && <p className="text-[13px] text-[var(--accent-800)]">{errorMessage}</p>}
        {notice && (
          <p
            className={`text-[13px] leading-snug ${
              notice.blocking ? "text-[var(--accent-800)]" : "text-[var(--neutral-700)]"
            }`}
          >
            {notice.message}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={discard}
            className="h-[38px] flex-1 border border-[var(--accent)] text-sm text-[var(--accent-700)] hover:bg-[var(--accent-100)] disabled:opacity-45"
          >
            Descartar
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="font-heading relative h-[38px] flex-1 whitespace-nowrap border border-[var(--accent)] bg-[var(--accent)] font-semibold text-[var(--bg)] hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)] disabled:opacity-45"
          >
            <Corners />
            {saveLabel}
          </button>
        </div>

        {novedad !== null && (
          <button
            type="button"
            disabled={isBusy || fullyLocked}
            onClick={handleRemove}
            className="h-[38px] border border-[var(--accent-800)] text-sm text-[var(--accent-800)] hover:bg-[var(--accent-100)] disabled:opacity-45"
          >
            Quitar {novedad.statusName} de los {novedad.days.length} día(s)
          </button>
        )}

        <p className="text-[11px] leading-snug text-[var(--neutral-700)]">
          Presencial y Virtual/Casa definen la modalidad habitual y se guardan como Estado base, sin fecha. Los demás
          Estados se asignan a un rango de días: no cambian el Estado base ni el horario habitual. Al volver a entrar, el
          Estado vigente aparece marcado con sus fechas, listo para mover el rango o quitarlo. Todo queda registrado en
          Auditoría.
        </p>
      </RoleGate>
    </section>
  );
}
