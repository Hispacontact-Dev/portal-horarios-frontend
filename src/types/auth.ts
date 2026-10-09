import type { UserRole } from "@/types/user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  session_token: string;
  role: UserRole;
}
