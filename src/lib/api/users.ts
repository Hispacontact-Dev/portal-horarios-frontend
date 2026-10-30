import { apiFetch } from "@/lib/api/client";
import type { User, UserCreate, UserRoleUpdate } from "@/types/user";

export async function listUsers(signal?: AbortSignal): Promise<User[]> {
  return apiFetch<User[]>("/users", { signal });
}

export async function createUser(data: UserCreate): Promise<User> {
  return apiFetch<User>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUserRole(id: string, data: UserRoleUpdate): Promise<User> {
  return apiFetch<User>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// El backend rechaza con 409 retirar el acceso de la propia cuenta.
export async function deactivateUser(id: string): Promise<User> {
  return apiFetch<User>(`/users/${id}/deactivate`, { method: "PATCH" });
}
