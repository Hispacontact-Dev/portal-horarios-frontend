import { AreaTable } from "@/components/areas/AreaTable";
import { AreaForm } from "@/components/areas/AreaForm";

// TODO: cargar áreas vía useAreas() y pasarlas a AreaTable.
export default function AreasPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Áreas</h1>
      <AreaForm />
      <AreaTable areas={[]} />
    </div>
  );
}
