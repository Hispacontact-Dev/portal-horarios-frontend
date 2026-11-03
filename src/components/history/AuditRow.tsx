"use client";

import { Badge } from "@/components/ui/Badge";
import { AuditRowDetail } from "@/components/history/AuditRowDetail";
import { actorInitials, createPreviewValues, type AuditRow as Row, type TargetResolver } from "@/lib/utils/audit";
import { formatTimeShort } from "@/lib/utils/date";
import {
  CATEGORY_BY_ENTITY,
  describeAction,
  fieldLabel,
  formatFieldValue,
  type AuditCategoryFilter,
} from "@/lib/utils/history-labels";

const CATEGORY_BADGE: Record<AuditCategoryFilter, string> = {
  Empleados: "bg-[var(--accent-100)] text-[var(--accent-800)]",
  Catálogos: "bg-[#e3e3e5] text-[#3b3b3d]",
  Usuarios: "bg-[#e3e3e5] text-[#3b3b3d]",
  Accesos: "border border-[var(--divider)] text-[var(--neutral-700)]",
};

interface AuditRowProps {
  row: Row;
  resolveTarget: TargetResolver;
  isOpen: boolean;
  onToggle: (id: string) => void;
}

export function AuditRow({ row, resolveTarget, isOpen, onToggle }: AuditRowProps) {
  const leadEvent = row.kind === "burst" ? row.events[0] : row.event;
  const entry = leadEvent.entry;
  const category = CATEGORY_BY_ENTITY[entry.entity_type];
  const isLogin = entry.entity_type === "login";
  // Un inicio de sesión no tiene cambios que mostrar; una ráfaga siempre despliega su lista.
  const expandable = row.kind === "burst" || leadEvent.changes.length > 0;
  const targetName = resolveTarget(entry);
  const firstChange = leadEvent.changes[0];

  const preview = (() => {
    if (row.kind === "burst") {
      const names = row.events
        .slice(0, 2)
        .map((event) => resolveTarget(event.entry) ?? "Empleado")
        .join(", ");
      return <>{`${names} y ${row.events.length - 2} más`}</>;
    }

    if (entry.action === "create") {
      const values = createPreviewValues(leadEvent);
      return values.length > 0 ? <>{values.join(" · ")}</> : null;
    }

    if (!firstChange) return null;

    const before = formatFieldValue(firstChange.old_value);
    const extra = leadEvent.changes.length - 1;

    return (
      <>
        {fieldLabel(firstChange.field)} ·{" "}
        {before !== "—" && (
          <>
            <s className="decoration-[var(--neutral-700)]">{before}</s> →{" "}
          </>
        )}
        <span className="text-[var(--text)]">{formatFieldValue(firstChange.new_value)}</span>
        {extra > 0 && (
          <span className="text-[var(--accent-700)]">
            {" "}
            +{extra} {extra === 1 ? "cambio" : "cambios"}
          </span>
        )}
      </>
    );
  })();

  return (
    <div className={`border-b border-[var(--divider)] ${isOpen ? "bg-[var(--accent-100)]" : ""}`}>
      <button
        type="button"
        disabled={!expandable}
        aria-expanded={expandable ? isOpen : undefined}
        onClick={() => onToggle(row.id)}
        className="grid w-full grid-cols-[52px_minmax(0,1fr)_16px] items-center gap-3 px-2 py-[11px] text-left enabled:hover:bg-[var(--accent-100)] disabled:cursor-default sm:grid-cols-[58px_30px_minmax(0,1fr)_auto_16px] sm:gap-3.5"
      >
        <span className="text-[13px] tabular-nums text-[var(--neutral-700)]">
          {formatTimeShort(entry.occurred_at)}
        </span>

        <span className="font-heading hidden h-[30px] w-[30px] place-items-center border border-[var(--accent)] text-xs font-semibold text-[var(--accent-700)] sm:grid">
          {actorInitials(entry.actor_name)}
        </span>

        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={`text-sm leading-snug ${isLogin ? "text-[var(--neutral-700)]" : ""}`}>
            <b className="font-medium">{entry.actor_name || "Sistema"}</b>{" "}
            {row.kind === "burst"
              ? `creó ${row.events.length} empleados`
              : describeAction(entry)}
            {row.kind === "event" && targetName && (
              <> <b className="font-medium text-[var(--accent-800)]">{targetName}</b></>
            )}
            {/* Un intento fallido puede venir de un correo que no existe como cuenta. */}
            {isLogin && entry.actor_id === null && (
              <span className="text-[var(--neutral-700)]"> · sin cuenta</span>
            )}
          </span>
          {preview && (
            <span className="truncate text-xs text-[var(--neutral-700)]">{preview}</span>
          )}
        </span>

        <Badge className={`hidden justify-self-start sm:inline-block ${CATEGORY_BADGE[category]}`}>
          {category}
        </Badge>

        {expandable ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden
            className={`text-[var(--neutral-700)] transition-transform ${isOpen ? "rotate-90" : ""}`}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        ) : (
          <span />
        )}
      </button>

      {isOpen && expandable && <AuditRowDetail row={row} resolveTarget={resolveTarget} />}
    </div>
  );
}
