import { bogotaDayKey, formatDateTime, parseBackendDate } from "@/lib/utils/date";
import {
  AUDIT_CATEGORIES,
  CATEGORY_BY_ENTITY,
  ENTITY_TYPE_LABELS,
  describeAction,
  fieldLabel,
  formatChangeValue,
  type AuditCategory,
} from "@/lib/utils/history-labels";
import type { HistoryChange, HistoryEntry } from "@/types/history";

/** Ventana de una ráfaga de altas y mínimo de altas para plegarlas en una fila. */
const BURST_WINDOW_MS = 10 * 60 * 1000;
const BURST_MIN_ITEMS = 3;

/**
 * Un evento tal como se muestra: normalmente una entrada del historial, pero el alta de
 * un empleado son dos entradas en el backend (`create` + `status_change`, spec 004 RF-1)
 * y acá se presentan plegadas en una sola.
 */
export interface AuditEvent {
  id: string;
  entry: HistoryEntry;
  changes: HistoryChange[];
  /** Ids de todas las entradas que este evento representa (una, o dos si hubo pliegue). */
  entryIds: string[];
}

export type AuditRow =
  | { kind: "event"; id: string; event: AuditEvent }
  | { kind: "burst"; id: string; actor: string; events: AuditEvent[] };

export interface AuditDay {
  dayKey: string;
  rows: AuditRow[];
  /** Eventos del día, contando los que están dentro de una ráfaga plegada. */
  count: number;
}

export type TargetResolver = (entry: HistoryEntry) => string | null;

function pairKey(entry: HistoryEntry): string {
  return `${entry.entity_id}|${entry.occurred_at}|${entry.actor_id ?? ""}`;
}

/**
 * Pliega el par `create` + `status_change` que genera el alta de un empleado. Las dos
 * entradas comparten entidad, actor e instante exacto, así que el par es inequívoco.
 */
export function foldCreateWithStatus(entries: HistoryEntry[]): AuditEvent[] {
  const statusByKey = new Map<string, number[]>();
  entries.forEach((entry, index) => {
    if (entry.entity_type !== "employee" || entry.action !== "status_change") return;
    const key = pairKey(entry);
    const bucket = statusByKey.get(key);
    if (bucket) bucket.push(index);
    else statusByKey.set(key, [index]);
  });

  // El pliegue se resuelve antes de emitir: dentro del mismo instante el backend puede
  // devolver el `status_change` antes que el `create`, y emitir sobre la marcha duplicaría
  // la entrada.
  const folded = new Set<number>();
  const pairedWith = new Map<number, number>();

  entries.forEach((entry, index) => {
    if (entry.entity_type !== "employee" || entry.action !== "create") return;
    const bucket = statusByKey.get(pairKey(entry));
    const pairedIndex = bucket?.find((candidate) => !folded.has(candidate));
    if (pairedIndex === undefined) return;
    folded.add(pairedIndex);
    pairedWith.set(index, pairedIndex);
  });

  const events: AuditEvent[] = [];

  entries.forEach((entry, index) => {
    if (folded.has(index)) return;

    const pairedIndex = pairedWith.get(index);
    if (pairedIndex !== undefined) {
      const paired = entries[pairedIndex];
      events.push({
        id: entry.id,
        entry,
        changes: [...entry.changes, ...paired.changes],
        entryIds: [entry.id, paired.id],
      });
      return;
    }

    events.push({ id: entry.id, entry, changes: entry.changes, entryIds: [entry.id] });
  });

  return events;
}

function isBurstCandidate(event: AuditEvent): boolean {
  return event.entry.entity_type === "employee" && event.entry.action === "create";
}

/**
 * Agrupa las altas consecutivas del mismo usuario (al menos tres en diez minutos y el
 * mismo día) en una sola fila desplegable. Los eventos llegan del más reciente al más
 * antiguo, así que la distancia se mide del anterior al actual.
 */
export function groupBursts(events: AuditEvent[], enabled = true): AuditRow[] {
  const rows: AuditRow[] = [];
  let run: AuditEvent[] = [];

  function flush(): void {
    if (run.length >= BURST_MIN_ITEMS) {
      rows.push({
        kind: "burst",
        id: `${run[0].id}-burst`,
        actor: run[0].entry.actor_name,
        events: run,
      });
    } else {
      run.forEach((event) => rows.push({ kind: "event", id: event.id, event }));
    }
    run = [];
  }

  for (const event of events) {
    const previous = run[run.length - 1];
    const continues =
      enabled &&
      isBurstCandidate(event) &&
      previous !== undefined &&
      previous.entry.actor_id === event.entry.actor_id &&
      bogotaDayKey(previous.entry.occurred_at) === bogotaDayKey(event.entry.occurred_at) &&
      +parseBackendDate(previous.entry.occurred_at) - +parseBackendDate(event.entry.occurred_at) <=
        BURST_WINDOW_MS;

    if (continues) {
      run.push(event);
      continue;
    }

    flush();
    if (enabled && isBurstCandidate(event)) run = [event];
    else rows.push({ kind: "event", id: event.id, event });
  }

  flush();
  return rows;
}

function rowTimestamp(row: AuditRow): string {
  return row.kind === "burst" ? row.events[0].entry.occurred_at : row.event.entry.occurred_at;
}

export function groupByDay(rows: AuditRow[]): AuditDay[] {
  const days: AuditDay[] = [];

  for (const row of rows) {
    const dayKey = bogotaDayKey(rowTimestamp(row));
    let current = days[days.length - 1];
    if (!current || current.dayKey !== dayKey) {
      current = { dayKey, rows: [], count: 0 };
      days.push(current);
    }
    current.rows.push(row);
    current.count += row.kind === "burst" ? row.events.length : 1;
  }

  return days;
}

/** Iniciales del actor para el cuadrado de la fila; un correo cae en su parte local. */
export function actorInitials(actorName: string): string {
  const words = actorName.split(/[\s.@_-]+/).filter(Boolean);
  if (words.length === 0) return "??";
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/**
 * Valores que resumen el cambio en la fila. En un alta se omite el nombre, que ya aparece
 * en la frase, para no repetirlo.
 */
export function createPreviewValues(event: AuditEvent): string[] {
  return event.changes
    .filter((change) => change.field !== "full_name" && change.field !== "name")
    .map((change) => formatChangeValue(change.field, change.new_value))
    .filter((value) => value !== "—");
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Nombre del objetivo de una entrada. Solo los empleados se resuelven contra una lista;
 * para el resto se usa el nombre que venga en los cambios, y si no hay, no se inventa.
 */
export function makeTargetResolver(employeeNames: Map<string, string>): TargetResolver {
  return (entry) => {
    if (entry.entity_type === "login") return null;

    if (entry.entity_type === "employee") {
      const known = entry.entity_id === null ? undefined : employeeNames.get(entry.entity_id);
      if (known) return known;
    }

    const named = entry.changes.find((change) => change.field === "full_name" || change.field === "name");
    if (named) {
      const value = named.new_value ?? named.old_value;
      if (typeof value === "string" && value !== "") return value;
    }

    return null;
  };
}

export function matchesQuery(event: AuditEvent, targetName: string | null, query: string): boolean {
  if (query === "") return true;
  const needle = normalizeText(query);

  const haystack = [
    event.entry.actor_name,
    targetName ?? "",
    ENTITY_TYPE_LABELS[event.entry.entity_type],
    describeAction(event.entry),
    ...event.changes.flatMap((change) => [
      fieldLabel(change.field),
      formatChangeValue(change.field, change.old_value),
      formatChangeValue(change.field, change.new_value),
    ]),
  ];

  return haystack.some((value) => normalizeText(value).includes(needle));
}

export function countByCategory(entries: HistoryEntry[]): Record<AuditCategory, number> {
  const counts = Object.fromEntries(AUDIT_CATEGORIES.map((category) => [category, 0])) as Record<
    AuditCategory,
    number
  >;

  for (const entry of entries) {
    counts.Todos += 1;
    counts[CATEGORY_BY_ENTITY[entry.entity_type]] += 1;
  }

  return counts;
}

export const AUDIT_CSV_HEADERS = ["Fecha y hora", "Usuario", "Tipo", "Acción", "Objetivo", "Cambios"];

export function auditCsvRows(events: AuditEvent[], resolveTarget: TargetResolver): string[][] {
  return events.map((event) => [
    formatDateTime(event.entry.occurred_at),
    event.entry.actor_name,
    ENTITY_TYPE_LABELS[event.entry.entity_type],
    describeAction(event.entry),
    resolveTarget(event.entry) ?? "",
    event.changes
      .map((change) => `${fieldLabel(change.field)}: ${formatChangeValue(change.field, change.old_value)} → ${formatChangeValue(change.field, change.new_value)}`)
      .join("; "),
  ]);
}
