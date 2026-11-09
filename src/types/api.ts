// Formas comunes de error/respuesta usadas por lib/api/client.ts

export interface ApiErrorBody {
  message?: string;
  code?: string;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  body?: ApiErrorBody;
}
