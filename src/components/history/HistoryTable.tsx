import type { HistoryEntry } from "@/types/history";
import { Table } from "@/components/ui/Table";

interface HistoryTableProps {
  entries: HistoryEntry[];
}

// TODO: renderizar entity_type, action, actor_name, occurred_at y el detalle de changes.
export function HistoryTable({ entries }: HistoryTableProps) {
  return (
    <Table>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.id}>
            <td>{entry.action}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
