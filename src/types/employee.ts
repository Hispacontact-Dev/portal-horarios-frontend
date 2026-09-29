export type EmployeePosition = "recursos_humanos" | "lider";

export interface Employee {
  id: string;
  full_name: string;
  position: EmployeePosition;
  area_id: string;
  area_name: string;
  status_id: string;
  status_name: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  status_updated_at: string;
  status_updated_by: string;
}

export interface EmployeeCreate {
  full_name: string;
  position: EmployeePosition;
  area_id: string;
  status_id: string;
}

export interface EmployeeUpdate {
  full_name?: string;
  position?: EmployeePosition;
  area_id?: string;
}
