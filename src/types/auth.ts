import type { Role } from "@/types/session";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  session_token: string;
  role: Role;
}
