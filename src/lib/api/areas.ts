import { apiFetch } from "@/lib/api/client";
import type { Area, AreaCreate, AreaDisableResult, AreaUpdate } from "@/types/area";

export async function listAreas(): Promise<Area[]> {
  return apiFetch<Area[]>("/areas");
}

export async function createArea(data: AreaCreate): Promise<Area> {
  return apiFetch<Area>("/areas", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateArea(id: string, data: AreaUpdate): Promise<Area> {
  return apiFetch<Area>(`/areas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function disableArea(id: string): Promise<AreaDisableResult> {
  return apiFetch<AreaDisableResult>(`/areas/${id}/disable`, { method: "PATCH" });
}

export async function enableArea(id: string): Promise<Area> {
  return apiFetch<Area>(`/areas/${id}/enable`, { method: "PATCH" });
}
