import type { Area } from "@/types/area";
import { Table } from "@/components/ui/Table";

interface AreaTableProps {
  areas: Area[];
}

// TODO: agregar columnas de estado (habilitada/deshabilitada) y acciones enable/disable.
export function AreaTable({ areas }: AreaTableProps) {
  return (
    <Table>
      <tbody>
        {areas.map((area) => (
          <tr key={area.id}>
            <td>{area.name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
