import type { Status } from "@/types/status";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RoleGate } from "@/components/auth/RoleGate";

interface StatusTableProps {
  statuses: Status[];
  onEdit: (status: Status) => void;
  onDisable: (status: Status) => void;
  onEnable: (status: Status) => void;
  actionsDisabled?: boolean;
}

export function StatusTable({
  statuses,
  onEdit,
  onDisable,
  onEnable,
  actionsDisabled = false,
}: StatusTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <th className="px-3 py-2 font-medium">Nombre</th>
          <th className="px-3 py-2 font-medium">Condición</th>
          <th className="px-3 py-2 font-medium">Origen</th>
          <th className="px-3 py-2 font-medium">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {statuses.map((status) => (
          <tr key={status.id} className="border-t">
            <td className="px-3 py-2">{status.name}</td>
            <td className="px-3 py-2">
              <Badge
                className={
                  status.is_enabled ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                }
              >
                {status.is_enabled ? "Habilitado" : "Deshabilitado"}
              </Badge>
            </td>
            <td className="px-3 py-2">
              {status.is_predefined ? (
                <Badge className="bg-blue-100 text-blue-800">Predefinido</Badge>
              ) : (
                "Personalizado"
              )}
            </td>
            <td className="px-3 py-2">
              {!status.is_predefined && (
                <RoleGate>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onEdit(status)}
                      disabled={actionsDisabled}
                    >
                      Editar
                    </Button>
                    {status.is_enabled ? (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => onDisable(status)}
                        disabled={actionsDisabled}
                      >
                        Deshabilitar
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onEnable(status)}
                        disabled={actionsDisabled}
                      >
                        Habilitar
                      </Button>
                    )}
                  </div>
                </RoleGate>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
