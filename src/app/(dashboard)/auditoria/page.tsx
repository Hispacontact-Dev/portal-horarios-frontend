import { HistoryFilters } from "@/components/history/HistoryFilters";
import { HistoryTable } from "@/components/history/HistoryTable";

// TODO: cargar entradas vía useHistory() según los filtros seleccionados.
export default function AuditoriaPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Auditoría</h1>
      <HistoryFilters />
      <HistoryTable entries={[]} />
    </div>
  );
}
