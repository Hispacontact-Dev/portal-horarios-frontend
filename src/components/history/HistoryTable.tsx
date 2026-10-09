import type { HistoryEntry } from "@/types/history";
import { Table } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { HistoryEntryRow } from "@/components/history/HistoryEntryRow";

interface HistoryTableProps {
  entries: HistoryEntry[];
}

export function HistoryTable({ entries }: HistoryTableProps) {
  if (entries.length === 0) {
    return <EmptyState message="No hay eventos de auditoría para los filtros aplicados." />;
  }

  return (
    <Table>
      <tbody>
        {entries.map((entry) => (
          <HistoryEntryRow key={entry.id} entry={entry} />
        ))}
      </tbody>
    </Table>
  );
}
