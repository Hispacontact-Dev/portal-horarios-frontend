import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { RoleGate } from "@/components/auth/RoleGate";
import { nowAsDecimalHour, rangeRuntimeStatus, rangeStatusLabel, statusVisualProps } from "@/lib/utils/scheduleStatus";
import type { EmployeeWeekSchedule, ScheduleDayEntry } from "@/types/schedule";

interface ScheduleWeekViewProps {
  employees: EmployeeWeekSchedule[];
  /** Fecha "YYYY-MM-DD" del día de hoy (server_today), si la semana mostrada lo incluye. */
  today?: string;
  /** Si se provee, agrega una columna "Administrar" con un botón por empleado. */
  onManage?: (employeeId: string) => void;
}

function formatDayHeader(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function DayCell({ day, isToday }: { day: ScheduleDayEntry; isToday: boolean }) {
  if (day.time_ranges.length === 0) {
    const visual = statusVisualProps("sin_horario");
    return (
      <div className="flex flex-col gap-1">
        <Badge className={visual.className} style={visual.style}>
          {day.status_name}
        </Badge>
        {day.observation && <span className="text-xs text-gray-500">{day.observation}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {day.time_ranges.map((range, index) => {
        const status = isToday ? rangeRuntimeStatus(range, nowAsDecimalHour()) : "programado";
        const visual = statusVisualProps(status);
        return (
          <Badge key={index} className={visual.className} style={visual.style}>
            {range.start}–{range.end} · {rangeStatusLabel(status)}
          </Badge>
        );
      })}
    </div>
  );
}

export function ScheduleWeekView({ employees, today, onManage }: ScheduleWeekViewProps) {
  const weekdays = employees[0]?.days ?? [];

  return (
    <Table>
      <thead>
        <tr>
          <th className="px-3 py-2 font-medium">Persona</th>
          {weekdays.map((day) => (
            <th key={day.date} className="px-3 py-2 font-medium capitalize">
              {formatDayHeader(day.date)}
            </th>
          ))}
          {onManage && <th className="px-3 py-2 font-medium">Administrar</th>}
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee.employee_id} className="border-t">
            <td className="px-3 py-2 align-top">
              <div className="font-medium">{employee.full_name}</div>
              <div className="text-xs text-gray-500">{employee.area_name}</div>
            </td>
            {employee.days.map((day) => (
              <td key={day.date} className="px-3 py-2 align-top">
                <DayCell day={day} isToday={day.date === today} />
              </td>
            ))}
            {onManage && (
              <td className="px-3 py-2 align-top">
                <RoleGate>
                  <Button type="button" variant="secondary" onClick={() => onManage(employee.employee_id)}>
                    Administrar
                  </Button>
                </RoleGate>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
