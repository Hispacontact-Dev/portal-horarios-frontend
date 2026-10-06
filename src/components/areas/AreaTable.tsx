import type { Area } from "@/types/area";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RoleGate } from "@/components/auth/RoleGate";

interface AreaTableProps {
  areas: Area[];
  onEdit: (area: Area) => void;
  onDisable: (area: Area) => void;
  onEnable: (area: Area) => void;
  actionsDisabled?: boolean;
}

export function AreaTable({
  areas,
  onEdit,
  onDisable,
  onEnable,
  actionsDisabled = false,
}: AreaTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <th className="px-3 py-2 font-medium">Nombre</th>
          <th className="px-3 py-2 font-medium">Condición</th>
          <th className="px-3 py-2 font-medium">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {areas.map((area) => (
          <tr key={area.id} className="border-t">
            <td className="px-3 py-2">{area.name}</td>
            <td className="px-3 py-2">
              <Badge
                className={
                  area.is_enabled ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                }
              >
                {area.is_enabled ? "Habilitada" : "Deshabilitada"}
              </Badge>
            </td>
            <td className="px-3 py-2">
              <RoleGate>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onEdit(area)}
                    disabled={actionsDisabled}
                  >
                    Editar
                  </Button>
                  {area.is_enabled ? (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => onDisable(area)}
                      disabled={actionsDisabled}
                    >
                      Deshabilitar
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onEnable(area)}
                      disabled={actionsDisabled}
                    >
                      Habilitar
                    </Button>
                  )}
                </div>
              </RoleGate>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
