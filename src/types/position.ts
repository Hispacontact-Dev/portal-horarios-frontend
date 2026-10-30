// Corresponde al catálogo de Cargos (specs/010-catalogos-cargos-plantillas-festivos). El backend
// todavía no expone este recurso; mientras no exista, las llamadas a /positions devuelven error real.

export interface Position {
  id: string;
  name: string;
  is_enabled: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface PositionCreate {
  name: string;
}

export interface PositionUpdate {
  name: string;
}

export interface PositionDisableResult {
  position: Position;
}
