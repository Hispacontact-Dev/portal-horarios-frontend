export interface Area {
  id: string;
  name: string;
  is_enabled: boolean;
  created_at: string;
  // `null` mientras nadie haya tocado la entrada: el backend devuelve estos campos
  // vacíos hasta el primer cambio.
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export interface AreaCreate {
  name: string;
}

export interface AreaUpdate {
  name: string;
}

export interface AreaDisableResult {
  area: Area;
  affected_employees: number;
}
