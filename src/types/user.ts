export type UserRole = "admin" | "gestion_humana" | "lider";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

// El backend solo permite crear cuentas gestion_humana/lider vía POST /users.
export interface UserCreate {
  full_name: string;
  email: string;
  role: Exclude<UserRole, "admin">;
}
