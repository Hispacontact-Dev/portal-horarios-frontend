"use client";

import { useState } from "react";
import type { HistoryEntry } from "@/types/history";

// TODO: implementar carga real vía lib/api/history.ts.
export function useHistory() {
  const [entries] = useState<HistoryEntry[]>([]);
  const [isLoading] = useState(false);

  return { entries, isLoading };
}
