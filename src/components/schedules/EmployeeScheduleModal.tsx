"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DefaultScheduleEditor } from "@/components/schedules/DefaultScheduleEditor";
import { DayStatusEditor } from "@/components/schedules/DayStatusEditor";
import { DateRangeStatusEditor } from "@/components/schedules/DateRangeStatusEditor";
import type { EmployeeWeekSchedule } from "@/types/schedule";

interface EmployeeScheduleModalProps {
  isOpen: boolean;
  employee: EmployeeWeekSchedule | undefined;
  onClose: () => void;
  onSaved: () => void;
}

export function EmployeeScheduleModal({ isOpen, employee, onClose, onSaved }: EmployeeScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    setSelectedDate("");
  }, [employee?.employee_id]);

  if (!employee) return null;

  const selectedDay = employee.days.find((day) => day.date === selectedDate);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex max-h-[80vh] w-[32rem] flex-col gap-6 overflow-y-auto rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Administrar horario — {employee.full_name}</h2>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Horario habitual</h3>
          <DefaultScheduleEditor employeeId={employee.employee_id} onSaved={() => onSaved()} />
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Estado especial por día</h3>
          <label className="flex flex-col text-sm text-gray-700">
            Día
            <select
              className="rounded border px-3 py-2 text-sm"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            >
              <option value="">Seleccioná un día</option>
              {employee.days.map((day) => (
                <option key={day.date} value={day.date}>
                  {day.date}
                </option>
              ))}
            </select>
          </label>
          {selectedDay && (
            <DayStatusEditor employeeId={employee.employee_id} day={selectedDay} onSaved={() => onSaved()} />
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Estado especial por rango de fechas</h3>
          <DateRangeStatusEditor employeeId={employee.employee_id} onSaved={() => onSaved()} />
        </section>
      </div>
    </Modal>
  );
}
