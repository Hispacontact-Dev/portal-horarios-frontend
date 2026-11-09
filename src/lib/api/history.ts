import { apiFetch } from "@/lib/api/client";
import type { HistoryEntry, HistoryFilters } from "@/types/history";

export async function listHistory(
  filters: HistoryFilters = {},
  signal?: AbortSignal,
): Promise<HistoryEntry[]> {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value !== undefined) as [string, string][]
  );
  const query = params.toString();
  return apiFetch<HistoryEntry[]>(`/history${query ? `?${query}` : ""}`, { signal });
}
