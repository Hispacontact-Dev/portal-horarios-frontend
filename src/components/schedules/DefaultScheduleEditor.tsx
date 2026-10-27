"use client";

import { useState, type FormEvent } from "react";
import { RoleGate } from "@/components/auth/RoleGate";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/ErrorState";
import { SuccessState } from "@/components/ui/SuccessState";
import { useDefaultScheduleChange } from "@/lib/hooks/useDefaultScheduleChange";
import { useSuccessFlag } from "@/lib/hooks/useSuccessFlag";
import { useDismissibleNotice } from "@/lib/hooks/useDismissibleNotice";
import type { DefaultScheduleDay, EmployeeDefaultSchedule, TimeRange, Weekday } from "@/types/schedule";

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
};

// Plantilla en blanco para completar: no existe todavía un endpoint que devuelva el horario habitual
// real de la persona (ninguna tarea 1-20 lo define), así que no se puede precargar su valor actual sin
// inventar datos de negocio (docs/constitution.md punto 5). Gestión Humana completa desde acá.
const BLANK_DEFAULT_DAYS: DefaultScheduleDay[] = (
  Object.keys(WEEKDAY_LABELS) as Weekday[]
).map((weekday) => ({
  weekday,
  works: true,
  modality: "presencial",
  time_ranges: [{ start: "08:00", end: "17:00" }],
}));

interface DefaultScheduleEditorProps {
  employeeId: string;
  onSaved: (schedule: EmployeeDefaultSchedule) => void;
}

function DefaultScheduleEditorForm({ employeeId, onSaved }: DefaultScheduleEditorProps) {
  const [days, setDays] = useState<DefaultScheduleDay[]>(BLANK_DEFAULT_DAYS);
  const { state, submit } = useDefaultScheduleChange();
  const successFlag = useSuccessFlag();
  const notice = useDismissibleNotice("horarios_admin_default_schedule_notice_dismissed");

  const isSubmitting = state.status === "submitting";

  function updateDay(weekday: Weekday, patch: Partial<DefaultScheduleDay>) {
    successFlag.hide();
    setDays((prev) => prev.map((day) => (day.weekday === weekday ? { ...day, ...patch } : day)));
  }

  function updateTimeRange(weekday: Weekday, index: number, patch: Partial<TimeRange>) {
    successFlag.hide();
    setDays((prev) =>
      prev.map((day) =>
        day.weekday === weekday
          ? { ...day, time_ranges: day.time_ranges.map((range, i) => (i === index ? { ...range, ...patch } : range)) }
          : day,
      ),
    );
  }

  function addTimeRange(weekday: Weekday) {
    successFlag.hide();
    setDays((prev) =>
      prev.map((day) =>
        day.weekday === weekday
          ? { ...day, time_ranges: [...day.time_ranges, { start: "08:00", end: "17:00" }] }
          : day,
      ),
    );
  }

  function removeTimeRange(weekday: Weekday, index: number) {
    successFlag.hide();
    setDays((prev) =>
      prev.map((day) =>
        day.weekday === weekday ? { ...day, time_ranges: day.time_ranges.filter((_, i) => i !== index) } : day,
      ),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    successFlag.hide();
    const result = await submit({ employee_id: employeeId, days });
    if (result) {
      successFlag.show();
      onSaved(result);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {notice.visible && (
        <div role="status" className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>Este formulario parte de una plantilla nueva, no del horario real vigente de esta persona.</p>
          <div className="mt-2">
            <Button type="button" variant="secondary" onClick={notice.dismiss}>
              Entendido
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {days.map((day) => (
        <div key={day.weekday} className="flex flex-col gap-2 border-b pb-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={day.works}
                onChange={(event) =>
                  updateDay(day.weekday, {
                    works: event.target.checked,
                    modality: event.target.checked ? (day.modality ?? "presencial") : null,
                  })
                }
              />
              {WEEKDAY_LABELS[day.weekday]}
            </label>

            {day.works && (
              <select
                className="rounded border px-2 py-1 text-sm"
                value={day.modality ?? "presencial"}
                onChange={(event) => updateDay(day.weekday, { modality: event.target.value as "presencial" | "virtual" })}
              >
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual/Casa</option>
              </select>
            )}
          </div>

          {day.works && (
            <div className="flex flex-col gap-2 pl-6">
              {day.time_ranges.map((range, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={range.start}
                    onChange={(event) => updateTimeRange(day.weekday, index, { start: event.target.value })}
                  />
                  <span className="text-sm text-gray-500">a</span>
                  <Input
                    type="time"
                    value={range.end}
                    onChange={(event) => updateTimeRange(day.weekday, index, { end: event.target.value })}
                  />
                  <Button type="button" variant="secondary" onClick={() => removeTimeRange(day.weekday, index)}>
                    Quitar
                  </Button>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => addTimeRange(day.weekday)}>
                Agregar rango
              </Button>
            </div>
          )}
        </div>
      ))}

      {successFlag.visible && <SuccessState message="Cambios guardados" />}

      {state.status === "error" && <ErrorState message={state.error.message} />}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar horario habitual"}
      </Button>
    </form>
    </div>
  );
}

export function DefaultScheduleEditor(props: DefaultScheduleEditorProps) {
  return (
    <RoleGate>
      <DefaultScheduleEditorForm {...props} />
    </RoleGate>
  );
}
