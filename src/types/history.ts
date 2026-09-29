export type EntityType = "employee" | "area" | "status" | "user" | "login";

export interface HistoryChange {
  field: string;
  old_value: unknown;
  new_value: unknown;
}

export interface HistoryEntry {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  action: string;
  actor_id: string;
  actor_name: string;
  changes: HistoryChange[];
  occurred_at: string;
}

export interface HistoryFilters {
  entity_type?: EntityType;
  entity_id?: string;
  actor_id?: string;
  date_from?: string;
  date_to?: string;
}
