import type { Employee } from "@/types/employee";
import { Table } from "@/components/ui/Table";

interface EmployeeTableProps {
  employees: Employee[];
}

// TODO: implementar filas y columnas reales (nombre, cargo, área, estado, activo).
export function EmployeeTable({ employees }: EmployeeTableProps) {
  return (
    <Table>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee.id}>
            <td>{employee.full_name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
