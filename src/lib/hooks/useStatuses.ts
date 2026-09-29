"use client";

import { useState } from "react";
import type { Status } from "@/types/status";

// TODO: implementar carga real vía lib/api/statuses.ts.
export function useStatuses() {
  const [statuses] = useState<Status[]>([]);
  const [isLoading] = useState(false);

  return { statuses, isLoading };
}
