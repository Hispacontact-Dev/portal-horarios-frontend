import { readSessionCookie } from "@/lib/session/cookie";
import type { ApiErrorBody, ApiErrorResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;

  constructor({ status, message, body }: ApiErrorResponse) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody | undefined> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return undefined;
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
    const body = await parseErrorBody(response);
    throw new ApiError({ status: response.status, message: body?.message ?? response.statusText, body });
  }

  return response.json() as Promise<T>;
}
