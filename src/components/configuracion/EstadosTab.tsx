"use client";

import { useMemo } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useStatuses } from "@/lib/hooks/useStatuses";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { countEmployeesByStatusId } from "@/lib/utils/catalog";
import type { Status } from "@/types/status";

interface StatusGroup {
  title: string;
  caption: string;
  blocksShifts: boolean;
  statuses: Status[];
}

// Pestaña de solo lectura: los Estados son del sistema y se consultan, no se
// administran desde acá. La agrupación sale de `blocks_shifts`, que viene del
// backend — no hay ninguna lista de estados escrita en el frontend.
export function EstadosTab() {
  const { status, statuses, error } = useStatuses();
  const { status: employeesStatus, employees } = useEmployees();

  const counts = useMemo(() => countEmployeesByStatusId(employees), [employees]);

  const groups: StatusGroup[] = useMemo(
    () => [
      {
        title: "Activos",
        caption: "Reciben turnos",
        blocksShifts: false,
        statuses: statuses.filter((entry) => !entry.blocks_shifts),
      },
      {
        title: "Inactivos",
        caption: "Bloquean turnos",
        blocksShifts: true,
        statuses: statuses.filter((entry) => entry.blocks_shifts),
      },
    ],
    [statuses]
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-[820px] border border-[var(--accent-600)] px-4 py-3.5 text-[13px] leading-relaxed text-[var(--accent-800)]">
        Los Estados son del sistema. Un Estado <b className="font-semibold">activo</b> define la
        modalidad de trabajo del día; uno <b className="font-semibold">inactivo</b> representa una
        ausencia y bloquea la asignación de turnos.
      </p>

      {status === "loading" && <Spinner />}
      {status === "error" && <ErrorState message={error.message} />}

      {status === "success" && statuses.length === 0 && (
        <section className="panel anim-up px-[22px] py-9 text-center">
          <Corners />
          <span className="text-[13px] text-[var(--neutral-700)]">
            No hay Estados registrados en el catálogo.
          </span>
        </section>
      )}

      {status === "success" && statuses.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[22px]">
          {groups.map((group, index) => (
            <section
              key={group.title}
              className="panel anim-up flex flex-col gap-1 px-[22px] py-5"
              style={{ animationDelay: `${0.05 + index * 0.05}s` }}
            >
              <Corners />
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-heading text-[22px] font-semibold">{group.title}</h2>
                <span className="text-xs text-[var(--neutral-700)]">{group.caption}</span>
              </div>

              {group.statuses.length === 0 ? (
                <span className="py-6 text-[13px] text-[var(--neutral-700)]">
                  Ningún Estado del catálogo está en este grupo.
                </span>
              ) : (
                group.statuses.map((entry) => {
                  const count = counts.get(entry.id) ?? 0;
                  return (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 border-t border-[var(--divider)] py-3"
                    >
                      <i className="dot-ui" data-size="lg" data-on={!group.blocksShifts} />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{entry.name}</span>
                        <span className="text-xs text-[var(--neutral-700)]">
                          {entry.is_enabled
                            ? "Disponible al asignar el estado de un día"
                            : "Deshabilitado: ya no aparece en los formularios nuevos"}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex flex-col items-end">
                          <b className="font-heading text-[22px] font-semibold leading-none tabular-nums">
                            {employeesStatus === "loading" ? "—" : count}
                          </b>
                          <span className="text-[10px] uppercase tracking-[.1em] text-[var(--neutral-700)]">
                            {count === 1 ? "empleado" : "empleados"}
                          </span>
                        </div>
                        {!entry.is_enabled && (
                          <Badge className="bg-[#e3e3e5] text-[#3b3b3d]">Deshabilitado</Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
