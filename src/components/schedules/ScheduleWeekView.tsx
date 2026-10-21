import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import type { EmployeeWeekSchedule, ScheduleDayEntry } from "@/types/schedule";

interface ScheduleWeekViewProps {
  employees: EmployeeWeekSchedule[];
}

function formatDayHeader(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function DayCell({ day }: { day: ScheduleDayEntry }) {
  if (day.time_ranges.length > 0) {
    return (
      <div className="flex flex-col gap-1">
        <Badge className="bg-green-100 text-green-800">
          {day.modality === "virtual" ? "Virtual/Casa" : "Presencial"}
        </Badge>
        {day.time_ranges.map((range, index) => (
          <span key={index} className="text-xs text-gray-600">
            {range.start}–{range.end}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Badge className="bg-gray-100 text-gray-700">{day.status_name}</Badge>
      {day.observation && <span className="text-xs text-gray-500">{day.observation}</span>}
    </div>
  );
}

export function ScheduleWeekView({ employees }: ScheduleWeekViewProps) {
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
                <DayCell day={day} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
