import { apiFetch } from "@/lib/api/client";
import type { User, UserCreate } from "@/types/user";

// TODO: el backend no expone GET /users todavía, no es posible listar usuarios.

export async function createUser(data: UserCreate): Promise<User> {
  return apiFetch<User>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
