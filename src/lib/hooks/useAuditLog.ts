"use client";

import { useMemo } from "react";
import { listHistory } from "@/lib/api/history";
import { useAsyncResource } from "@/lib/hooks/useAsyncResource";
import { useEmployees } from "@/lib/hooks/useEmployees";
import {
  auditCsvRows,
  countByCategory,
  foldCreateWithStatus,
  groupBursts,
  groupByDay,
  makeTargetResolver,
  matchesQuery,
  type AuditEvent,
} from "@/lib/utils/audit";
import { CATEGORY_BY_ENTITY, type AuditCategory } from "@/lib/utils/history-labels";
import type { HistoryEntry, HistoryFilters } from "@/types/history";

export interface AuditLogOptions {
  query: string;
  category: AuditCategory;
  actorId: string;
  includeLogins: boolean;
  limit: number;
  hasFilters: boolean;
  /** Plegado de altas en lote; apagarlo muestra cada alta en su propia fila. */
  groupBurstsEnabled?: boolean;
}

function employeeNameMap(employees: { id: string; full_name: string }[]): Map<string, string> {
  return new Map(employees.map((employee) => [employee.id, employee.full_name]));
}

/**
 * Historial de auditoría listo para la pantalla: lo que el backend no filtra ni cuenta
 * (búsqueda por texto, agrupación de Catálogos, inicios de sesión ocultos, conteos por
 * tipo y paginación) se deriva acá sobre la lista completa que devuelve `GET /history`.
 */
export function useAuditLog(serverFilters: HistoryFilters, options: AuditLogOptions) {
  const {
    query,
    category,
    actorId,
    includeLogins,
    limit,
    hasFilters,
    groupBurstsEnabled = true,
  } = options;
  const serverKey = JSON.stringify(serverFilters);

  const { state, retry } = useAsyncResource<HistoryEntry[]>(
    (signal) => listHistory(serverFilters, signal),
    [serverKey],
    { hasFilters },
  );

  const employeesState = useEmployees();
  // Estabiliza la referencia: `state.data` es null mientras carga y los useMemo de abajo
  // dependen de ella.
  const entries = useMemo(() => state.data ?? [], [state.data]);

  const resolveTarget = useMemo(
    () => makeTargetResolver(employeeNameMap(employeesState.employees)),
    [employeesState.employees],
  );

  const derived = useMemo(() => {
    const byActor =
      actorId === "" ? entries : entries.filter((entry) => entry.actor_id === actorId);

    // Los conteos de los botones de tipo reflejan todo menos el tipo mismo, y cuentan los
    // inicios de sesión aunque estén ocultos: si no, "Accesos" diría 0 mientras el aviso
    // informa que hay N escondidos.
    const counts = countByCategory(byActor);

    const byCategory =
      category === "Todos"
        ? byActor
        : byActor.filter((entry) => CATEGORY_BY_ENTITY[entry.entity_type] === category);

    const hiddenLogins = includeLogins
      ? 0
      : byCategory.filter((entry) => entry.entity_type === "login").length;

    const visibleEntries = includeLogins
      ? byCategory
      : byCategory.filter((entry) => entry.entity_type !== "login");

    const events = foldCreateWithStatus(visibleEntries).filter((event) =>
      matchesQuery(event, resolveTarget(event.entry), query),
    );

    const page = events.slice(0, limit);

    return {
      counts,
      hiddenLogins,
      events,
      days: groupByDay(groupBursts(page, groupBurstsEnabled)),
      filteredCount: events.length,
      visibleCount: page.length,
      // Sobre todo lo filtrado, no solo sobre la página cargada.
      actorCount: new Set(events.map((event) => event.entry.actor_name)).size,
    };
  }, [entries, category, actorId, includeLogins, query, limit, groupBurstsEnabled, resolveTarget]);

  // Se deriva de `entries` sin aplicar el filtro de actor, para que el selector siempre
  // ofrezca a todos. Si la carga falla no hay estado de error propio: la lista queda vacía
  // y el resto de la pantalla sigue operable (spec 006 RF-3).
  const actorOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const entry of entries) {
      if (entry.actor_id === null || seen.has(entry.actor_id)) continue;
      seen.set(entry.actor_id, entry.actor_name);
    }
    return [...seen.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [entries]);

  return {
    state,
    retry,
    resolveTarget,
    actorOptions,
    ...derived,
    /** Filas del CSV: todo lo filtrado, sin el recorte de la paginación. */
    csvRows: (): string[][] => auditCsvRows(derived.events, resolveTarget),
  };
}

export type { AuditEvent };
