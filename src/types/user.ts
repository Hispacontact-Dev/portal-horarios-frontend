export type UserRole = "admin" | "gestion_humana" | "lider";

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

// El backend solo permite crear cuentas gestion_humana/lider vía POST /users.
export interface UserCreate {
  full_name: string;
  email: string;
  role: Exclude<UserRole, "admin">;
}

// El backend solo admite estos dos roles al cambiar el de una cuenta: `admin` es
// un valor legacy que se canonicaliza a `gestion_humana` y no se puede asignar.
export interface UserRoleUpdate {
  role: Exclude<UserRole, "admin">;
}
