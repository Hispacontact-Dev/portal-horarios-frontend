import type { Employee, EmployeePosition } from "@/types/employee";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmployeeStatusBadge } from "@/components/employees/EmployeeStatusBadge";

interface EmployeeTableProps {
  employees: Employee[];
}

const POSITION_LABELS: Record<EmployeePosition, string> = {
  recursos_humanos: "Recursos Humanos",
  lider: "Líder",
};

export function EmployeeTable({ employees }: EmployeeTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <th className="px-3 py-2 font-medium">Nombre</th>
          <th className="px-3 py-2 font-medium">Cargo</th>
          <th className="px-3 py-2 font-medium">Área</th>
          <th className="px-3 py-2 font-medium">Estado</th>
          <th className="px-3 py-2 font-medium">Activo</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee.id} className="border-t">
            <td className="px-3 py-2">{employee.full_name}</td>
            <td className="px-3 py-2">{POSITION_LABELS[employee.position]}</td>
            <td className="px-3 py-2">{employee.area_name}</td>
            <td className="px-3 py-2">
              <EmployeeStatusBadge statusName={employee.status_name} />
            </td>
            <td className="px-3 py-2">
              <Badge
                className={
                  employee.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                }
              >
                {employee.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
