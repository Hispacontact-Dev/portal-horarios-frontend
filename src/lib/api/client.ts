import type { ApiErrorResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;

  constructor({ status, message }: ApiErrorResponse) {
    super(message);
    this.status = status;
  }
}

function getSessionToken(): string | null {
  // TODO: leer el token desde la cookie que administra AuthContext.
  return null;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getSessionToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    // TODO: manejar 401 (sesión expirada -> logout), 403 (prohibido), 423 (cuenta bloqueada).
    throw new ApiError({ status: response.status, message: response.statusText });
  }

  return response.json() as Promise<T>;
}
