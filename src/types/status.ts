// Mapea al recurso /statuses del backend (Catálogo de Estados en la UI).

export interface Status {
  id: string;
  name: string;
  is_enabled: boolean;
  is_predefined: boolean;
  // `true` cuando el Estado representa una ausencia que bloquea la asignación de
  // turnos; `false` cuando es una modalidad de trabajo (spec 009 del backend, RF-5).
  blocks_shifts: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface StatusCreate {
  name: string;
}

export interface StatusUpdate {
  name: string;
}

export interface StatusDisableResult {
  status: Status;
  affected_employees: number;
}
