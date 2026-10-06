// Mapea al recurso /statuses del backend (Catálogo de Estados en la UI).

export interface Status {
  id: string;
  name: string;
  is_enabled: boolean;
  is_predefined: boolean;
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
