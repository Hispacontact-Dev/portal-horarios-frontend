export type UserRole = "admin" | "gestion_humana" | "lider" | "planeacion";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  // `null` en la cuenta semilla, creada por el CLI sin un actor autenticado.
  created_by: string | null;
}

// El backend permite crear cuentas gestion_humana/lider/planeacion vía POST /users.
export interface UserCreate {
  full_name: string;
  email: string;
  role: Exclude<UserRole, "admin">;
}

// `admin` es un valor legacy que se canonicaliza a `gestion_humana` y no se puede
// asignar; el resto de los roles sí.
export interface UserRoleUpdate {
  role: Exclude<UserRole, "admin">;
}
