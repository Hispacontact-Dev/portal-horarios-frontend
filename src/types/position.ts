// Corresponde al catálogo de Cargos (specs/010-catalogos-cargos-plantillas-festivos), que el
// backend expone en /positions desde su specs/009-catalogos-configuracion.

export interface Position {
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

export interface PositionCreate {
  name: string;
}

export interface PositionUpdate {
  name: string;
}

export interface PositionDisableResult {
  position: Position;
}
