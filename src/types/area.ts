export interface Area {
  id: string;
  name: string;
  is_enabled: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
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
