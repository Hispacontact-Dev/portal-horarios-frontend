import type { Status } from "@/types/status";
import { Table } from "@/components/ui/Table";

interface StatusTableProps {
  statuses: Status[];
}

// TODO: agregar columnas de estado (habilitado/deshabilitado) y acciones enable/disable.
export function StatusTable({ statuses }: StatusTableProps) {
  return (
    <Table>
      <tbody>
        {statuses.map((status) => (
          <tr key={status.id}>
            <td>{status.name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
