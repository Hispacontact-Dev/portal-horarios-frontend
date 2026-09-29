import { apiFetch } from "@/lib/api/client";
import type { Status, StatusCreate, StatusDisableResult, StatusUpdate } from "@/types/status";

// Corresponde al recurso /statuses del backend (Catálogo de Estados en la UI, ruta /estados).

export async function listStatuses(): Promise<Status[]> {
  return apiFetch<Status[]>("/statuses");
}

export async function createStatus(data: StatusCreate): Promise<Status> {
  return apiFetch<Status>("/statuses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStatus(id: string, data: StatusUpdate): Promise<Status> {
  return apiFetch<Status>(`/statuses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function disableStatus(id: string): Promise<StatusDisableResult> {
  return apiFetch<StatusDisableResult>(`/statuses/${id}/disable`, { method: "PATCH" });
}

export async function enableStatus(id: string): Promise<Status> {
  return apiFetch<Status>(`/statuses/${id}/enable`, { method: "PATCH" });
}
