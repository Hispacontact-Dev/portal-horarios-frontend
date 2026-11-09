export interface Employee {
  id: string;
  full_name: string;
  // Texto legado del cargo que el backend sigue escribiendo para el índice de identidad;
  // la UI muestra `position_name`, que se resuelve desde el catálogo de Cargos.
  position: string;
  // `null` en un empleado creado antes del catálogo de Áreas/Estados/Cargos, que todavía
  // no tiene la referencia (el backend los devuelve ausentes — spec 009 RNF-6).
  position_id: string | null;
  position_name: string;
  area_id: string | null;
  area_name: string;
  status_id: string | null;
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
  position_id: string;
  area_id: string;
  status_id: string;
}

export interface EmployeeUpdate {
  full_name?: string;
  position_id?: string;
  area_id?: string;
}
