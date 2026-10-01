import { readSessionCookie } from "@/lib/session/cookie";
import type { ApiErrorResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;

  constructor({ status, message }: ApiErrorResponse) {
    super(message);
    this.status = status;
  }
}

let sessionInvalidHandler: (() => void) | null = null;

export function registerSessionInvalidHandler(handler: () => void): void {
  sessionInvalidHandler = handler;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = readSessionCookie();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401 && session !== null) {
    sessionInvalidHandler?.();
  }

  if (!response.ok) {
    // TODO: manejar 403 (prohibido) y 423 (cuenta bloqueada) en los flujos que los necesiten.
    throw new ApiError({ status: response.status, message: response.statusText });
  }

  return response.json() as Promise<T>;
}
