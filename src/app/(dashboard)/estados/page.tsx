import { StatusTable } from "@/components/statuses/StatusTable";
import { StatusForm } from "@/components/statuses/StatusForm";

// TODO: cargar estados vía useStatuses() (mapea al recurso /statuses del backend).
export default function EstadosPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Estados</h1>
      <StatusForm />
      <StatusTable statuses={[]} />
    </div>
  );
}
