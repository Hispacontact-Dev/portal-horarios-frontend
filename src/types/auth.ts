// TODO: el backend no expone GET /auth/me; LoginResponse solo trae el token.

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  session_token: string;
}
