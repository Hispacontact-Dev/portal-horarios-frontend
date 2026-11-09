import Link from "next/link";
import { Table, Th, TheadRow } from "@/components/ui/Table";
import {
  burstCountLabel,
  createPreviewValues,
  type AuditEvent,
  type AuditRow,
  type TargetResolver,
} from "@/lib/utils/audit";
import { formatDateTime, formatTimeShort } from "@/lib/utils/date";
import { ENTITY_TYPE_LABELS, fieldLabel, formatFieldValue } from "@/lib/utils/history-labels";
import { ROUTE_PATHS } from "@/lib/utils/constants";

interface AuditRowDetailProps {
  row: AuditRow;
  resolveTarget: TargetResolver;
}

function employeeHref(event: AuditEvent): string | null {
  const { entity_type, entity_id } = event.entry;
  return entity_type === "employee" && entity_id !== null
    ? `${ROUTE_PATHS.empleados}/${entity_id}`
    : null;
}

function MetaLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] uppercase tracking-[.06em] text-[var(--neutral-700)]">
      {children}
    </div>
  );
}

export function AuditRowDetail({ row, resolveTarget }: AuditRowDetailProps) {
  if (row.kind === "burst") {
    const first = row.events[0].entry.occurred_at;
    const last = row.events[row.events.length - 1].entry.occurred_at;
    // Sin un solo nombre resuelto (las altas de festivos vienen sin cambios) la lista serían
    // N renglones vacíos: se deja solo la línea de meta.
    const hasNames = row.events.some((event) => resolveTarget(event.entry) !== null);

    return (
      <div className="anim-slide flex flex-col gap-3 py-3 pl-2 pr-2 sm:pl-[104px]">
        {hasNames && (
          <div className="grid max-w-[760px] gap-x-6 sm:grid-cols-2">
            {row.events.map((event) => {
              const href = employeeHref(event);
              const name =
                resolveTarget(event.entry) ?? ENTITY_TYPE_LABELS[event.entry.entity_type];
              return (
                <div
                  key={event.id}
                  className="flex items-baseline justify-between gap-3 border-b border-[var(--divider)] py-[7px] text-[13px]"
                >
                  {href ? (
                    <Link href={href} className="font-medium text-[var(--accent-700)] hover:text-[var(--accent-800)]">
                      {name}
                    </Link>
                  ) : (
                    <span className="font-medium">{name}</span>
                  )}
                  <span className="text-xs text-[var(--neutral-700)]">
                    {createPreviewValues(event).join(" · ")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <MetaLine>
          <span className="tabular-nums">
            {formatDateTime(last)} – {formatTimeShort(first)}
          </span>
          <span>{burstCountLabel(row)}</span>
        </MetaLine>
      </div>
    );
  }

  const { event } = row;
  const href = employeeHref(event);
  const targetName = resolveTarget(event.entry);

  return (
    <div className="anim-slide flex flex-col gap-3 py-3 pl-2 pr-2 sm:pl-[104px]">
      {event.changes.length > 0 && (
        <div className="max-w-[640px] overflow-x-auto">
          <Table>
            <thead>
              <TheadRow>
                <Th className="w-[30%]">Campo</Th>
                <Th>Antes</Th>
                <Th>Después</Th>
              </TheadRow>
            </thead>
            <tbody>
              {event.changes.map((change, index) => (
                <tr key={`${change.field}-${index}`} className="border-t border-[var(--divider)]">
                  <td className="px-3 py-2">{fieldLabel(change.field)}</td>
                  <td className="px-3 py-2 text-[13px] text-[var(--neutral-700)]">
                    {formatFieldValue(change.old_value)}
                  </td>
                  <td className="px-3 py-2 font-medium">{formatFieldValue(change.new_value)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      <MetaLine>
        <span className="tabular-nums">{formatDateTime(event.entry.occurred_at)}</span>
        {/* Un alta de empleado son dos entradas en el backend: se muestran las dos. */}
        {event.entryIds.map((id) => (
          <span key={id} className="tabular-nums">
            {id}
          </span>
        ))}
        {href && (
          <Link
            href={href}
            className="ml-auto text-xs normal-case tracking-normal text-[var(--accent-700)] hover:text-[var(--accent-800)]"
          >
            Ver ficha de {targetName?.split(" ")[0] ?? "el empleado"} →
          </Link>
        )}
      </MetaLine>
    </div>
  );
}
